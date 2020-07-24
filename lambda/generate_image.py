# -*- coding: utf-8 -*-

import io
import re
import json
import boto3
from boto3.dynamodb.conditions import Key
import hashlib
from PIL import Image, ImageDraw, ImageFont, ImageOps

BUCKET_NAME = "aburaage-generator"
TABLE_NAME = "aburaage-generator"

FONT_JA = "/opt/python/fonts/font_ja.otf"
# FONT_JA = "./aburaage-generator-layer/python/fonts/font_ja.otf" # local
FONT_EN = "/opt/python/fonts/font_en.ttf"
# FONT_EN = "./aburaage-generator-layer/python/fonts/font_en.ttf" # local

def translation_dict():
    return([
        {"ja": "油揚げ", "en": "ABURA AGE", "zh": "油豆腐", "kr": "유부"},
        {"ja": "あぶらあげ", "en": "ABURA AGE", "zh": "油豆腐", "kr": "유부"},
        {"ja": "油揚", "en": "ABURA AGE", "zh": "油豆腐", "kr": "유부"},
    ])

# 機械翻訳を使わずに明示的に翻訳する
def explicitly_translate(word_ja, lang):
    for d in translation_dict():
        if d["ja"] == word_ja:
            return d.get(lang)

def translate(word_ja, lang):
    explicitly_translated = explicitly_translate(word_ja, lang)
    if explicitly_translated:
        return explicitly_translated

    cli = boto3.client("translate", region_name="ap-northeast-1", use_ssl=True)
    translated = cli.translate_text(Text=word_ja, SourceLanguageCode="ja", TargetLanguageCode=lang)
    return translated.get("TranslatedText")

# max_width 以内に文字が収まるように word を描画する
def draw_hscaled_text(image, word, font, font_color, max_width, draw_y):
    draw = ImageDraw.Draw(image)
    w, h = draw.textsize(word, font=font)
    text = Image.new("L", (w, h))
    text_draw = ImageDraw.Draw(text)
    text_draw.text((0, 0), word, font=font, fill=255)
    resized_w = min(max_width, w)
    resized_image = text.resize((resized_w, h))
    image.paste(ImageOps.colorize(resized_image, (0,0,0), font_color),
                ((int((500 - resized_w) / 2)), draw_y), resized_image)
    return (resized_w, h)

def generate_logo(word_ja, word_en, word_ch, word_kr):
    image = Image.new("RGB", (500, 500), "#E8DBD2")
    draw = ImageDraw.Draw(image)

    ja_fontsize = 30
    en_fontsize = 70
    ch_fontsize = 24
    brown = "#8E5B48"
    font_ja = ImageFont.truetype(FONT_JA, ja_fontsize)
    font_en = ImageFont.truetype(FONT_EN, en_fontsize)
    font_ch = ImageFont.truetype(FONT_JA, ch_fontsize)

    w_ja, h_ja = draw_hscaled_text(image, word_ja, font_ja, brown, 400, 228)
    w_en, h_en = draw_hscaled_text(image, word_en.upper(), font_en, brown, 400, 140)
    word_ch_kr = f"{ word_ch } / { word_kr }"
    w_ch, h_ch = draw_hscaled_text(image, word_ch_kr, font_ch, brown, 400, 290)

    line_width = min(400, max(w_ja, w_en, w_ch)) + 10
    draw.line([(250 - (line_width / 2), 220), (250 + (line_width / 2), 220)], fill=brown, width=2)
    draw.line([(250 - (line_width / 2), 280), (250 + (line_width / 2), 280)], fill=brown, width=2)

    # image.save("./image.png")
    return image

def image_to_bytearray(image):
    byte_array = io.BytesIO()
    image.save(byte_array, format="PNG")
    return byte_array.getvalue()

def put_to_s3(img_obj, word_ja):
    cli = boto3.resource("s3", region_name="ap-northeast-1", use_ssl=True)
    bucket = cli.Bucket(BUCKET_NAME)
    path = hashlib.md5(word_ja.encode("utf-8")).hexdigest() + ".png"
    bucket.put_object(Body=img_obj, Key=path)
    return path

def create_presigned_url(path, expiration=3600):
    cli = boto3.client("s3")
    response = cli.generate_presigned_url("get_object",
                                          Params={"Bucket": BUCKET_NAME, "Key": path},
                                          ExpiresIn=expiration)
    return response

# https://docs.aws.amazon.com/ja_jp/amazondynamodb/latest/developerguide/GettingStarted.Python.03.html
def get_record_from_dynamo(word_ja):
    dynamodb = boto3.resource("dynamodb", region_name="ap-northeast-1", use_ssl=True)
    table = dynamodb.Table(TABLE_NAME)
    response = table.get_item(
        Key={
            "word_ja": word_ja
        }
    )
    return response.get("Item")

def write_record_to_dynamo(word_ja):
    dynamodb = boto3.resource("dynamodb", region_name="ap-northeast-1", use_ssl=True)
    table = dynamodb.Table(TABLE_NAME)
    hashed_word = hashlib.md5(word_ja.encode("utf-8")).hexdigest()
    table.put_item(
        Item={
            "type": "record",
            "generate_count": 1,
            "word_ja": word_ja,
            "hashed_word": hashed_word,
            "s3_path": hashed_word + ".png"
        }
    )

def update_record_of_dynamo(record):
    dynamodb = boto3.resource("dynamodb", region_name="ap-northeast-1", use_ssl=True)
    table = dynamodb.Table(TABLE_NAME)
    table.update_item(
        Key={"word_ja": record["word_ja"]},
        UpdateExpression="SET generate_count = generate_count + :incr",
        ExpressionAttributeValues={":incr": 1}
    )

def is_ascii_string(text):
    ascii_pattern = re.compile("^[!-~]*$")
    return ascii_pattern.match(text) is not None

def main(event, context):
    print(event)

    word_ja = json.loads(event["body"])["word_ja"]

    if is_ascii_string(word_ja):
        response = {
            "statusCode": 400,
            "headers": {
                "Content-Type": "application/json"
            },
            "body": json.dumps({
                "errorCode": "INVALID_WORD"
            })
        }

        print(response)
        return response

    url = None
    record = get_record_from_dynamo(word_ja)
    if record:
        url = create_presigned_url(record["s3_path"])
        update_record_of_dynamo(record)
    else:
        word_en = translate(word_ja, "en")
        word_ch = translate(word_ja, "zh")
        word_kr = translate(word_ja, "ko")

        img = generate_logo(word_ja, word_en, word_ch, word_kr)

        s3_path = put_to_s3(image_to_bytearray(img), word_ja)
        url = create_presigned_url(s3_path)
        write_record_to_dynamo(word_ja)

    response = {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "true"
        },
        "body": json.dumps({
            "imageUrl": url
        })
    }

    print(response)
    return response

# main({"body": '{"word_ja": "油揚げ"}'}, {})
