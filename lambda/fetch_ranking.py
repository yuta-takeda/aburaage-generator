# -*- coding: utf-8 -*-

import sys
import json
import hashlib
import boto3
from boto3.dynamodb.conditions import Key

BUCKET_NAME = "aburaage-generator"
TABLE_NAME = "aburaage-generator"

def get_popular_records_from_dynamo(count = 8):
    dynamodb = boto3.resource("dynamodb", region_name="ap-northeast-1", use_ssl=True)
    table = dynamodb.Table(TABLE_NAME)
    response = table.query(
        IndexName="type-generate_count-index",
        KeyConditionExpression=Key("type").eq("record"),
        ScanIndexForward=False,
        Limit=count
    )
    return response

def create_presigned_url(path, expiration=3600):
    cli = boto3.client("s3")
    response = cli.generate_presigned_url("get_object",
                                          Params={"Bucket": BUCKET_NAME, "Key": path},
                                          ExpiresIn=expiration)
    return response

def main(event, context):
    print(event)

    results = get_popular_records_from_dynamo(count=8)
    popular_items = []
    print(results.get("Items"))
    for item in results.get("Items"):
        print(item)
        s3_path = item.get("s3_path")
        if s3_path is None:
            next

        url = create_presigned_url(s3_path)
        popular_items.append(url)

    print(popular_items)
    response = {
        "statusCode": 200,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": "true"
        },
        "body": json.dumps({
            "popularItems": popular_items
        })
    }

    print(response)
    return response

# main({'body': '{"count":8}'}, "")
