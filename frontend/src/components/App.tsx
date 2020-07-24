import React from 'react';
import Header from "./Header";
import Generator from "./Generator";
import Ranking from "./Ranking";
import styled from "styled-components";
import 'semantic-ui-css/semantic.min.css';

interface AppProps {
  word: string;
  imageUrl: string;
  buttonDisabled: boolean;
  popularItemUrls: string[];
  handleButtonClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  handleInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Wrapper = styled.div`
  margin: 0;
`

const AppComponent: React.FC<AppProps> = props => {
  return (
    <Wrapper>
      <Header
        title={"ABURAAGE GENERATOR"}
        note={"某コンビニの新デザインっぽいロゴを作るジェネレータです"}
      />
      <Generator
        word={props.word}
        imgUrl={props.imageUrl}
        buttonDisabled={props.buttonDisabled}
        handleButtonClick={props.handleButtonClick}
        handleInput={props.handleInput}
      />
      <Ranking 
        popularItemUrls={props.popularItemUrls}
      />
    </Wrapper>
  )
};

export default AppComponent;
