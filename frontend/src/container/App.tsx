import React, { useState, useEffect } from 'react';
import AppComponent from "../components/App";
import { useSnackbar } from "notistack";

const generateImageApi = ""; // input your API URL
const fetchRankingApi = "";
const defaultImageUrl = "https://aburaage-generator.s3-ap-northeast-1.amazonaws.com/0610e0dd001e78cce3fa9cc411f00d80.png";

const App: React.FC = () => {
  const [word, setWord] = useState<string>("油揚げ");
  const [imageUrl, setImageUrl] = useState<string>(defaultImageUrl);
  const [popularItemsUrls, setPopularItemsUrls] = useState<string[]>([]);
  const [buttonDisabled, setButtonDisabled] = useState<boolean>(false);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    fetchRanking();
  }, []);

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (word === "" || word.match(/^[\x20-\x7e]*$/)) {
      enqueueSnackbar("入力ボックスに日本語を入力してください", {
        variant: "error",
        preventDuplicate: true,
        autoHideDuration: 3000
      })
      return;
    };

    setButtonDisabled(true);
    fetch(generateImageApi, {
      method: "POST",
      body: JSON.stringify({ "word_ja" : word }),
      headers: { "Content-Type": "application/json" },
    })
    .then(res => res.json())
    .then(response => {
      setButtonDisabled(false);
      const imageUrl: string | undefined = response["imageUrl"];
      if (!imageUrl) {
        enqueueSnackbar("ロゴデータの作成に失敗しました…", {
          variant: "error",
          preventDuplicate: true,
          autoHideDuration: 3000
        });
        return;
      }
      setImageUrl(imageUrl);
      enqueueSnackbar(`${word}の作成に成功しました！`, {
        variant: "success",
        preventDuplicate: true,
        autoHideDuration: 3000
      });
    }).catch(error => console.error(error))
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("pikaa")
    setWord(e.target.value);
  };

  const fetchRanking = () => {
    fetch(fetchRankingApi, {
      method: "GET",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
    })
    .then(res => res.json())
    .then(response => {
      const urls: string[] | undefined = response["popularItems"];
      if (!urls) {
        enqueueSnackbar("ランキングデータの取得に失敗しました…", {
          variant: "error",
          preventDuplicate: true,
          autoHideDuration: 3000
        });
        return;
      }
      setPopularItemsUrls(urls);
    }).catch(error => console.log(error));
  };

  return (
    <AppComponent
      word={word}
      imageUrl={imageUrl}
      buttonDisabled={buttonDisabled}
      popularItemUrls={popularItemsUrls}
      handleButtonClick={handleButtonClick}
      handleInput={handleInput}
    />
  );
};

export default App;
