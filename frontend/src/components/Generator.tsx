import React from "react";
import styled, { css } from "styled-components";
import { Input, Button, Loader } from "semantic-ui-react";
import mesh from "./assets/bg_b04_23.gif";

type IProps = {
  word: string;
  imgUrl: string;
  buttonDisabled: boolean;
  handleButtonClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  handleInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

type ImgProps = Pick<IProps, "buttonDisabled">;

const BackGround = styled.div`
  background-color: #EDD3A1;
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 425px) {
    padding: 30px 14px;
  }
`;

const GeneratorInput = styled(Input)`
  width: 80%;
  margin-bottom: 15px;
  display: flex;

  @media (max-width: 768px) {
    width: 100%;
    font-size: 1em;
  }

  @media (max-width: 560px) {
    flex-direction: column;
    align-items: center;
  }
`;

const InnerInput = styled.input`
  @media (max-width: 560px) {
    &&&&& {
      border: 1px solid rgba(34,36,38,.15) !important;
      margin-bottom: 15px;
    }
  }
`;

const Logo = styled.div`
  margin-top: 10px;
  width: 300px;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  @media (max-width: 768px) {
    width: 250px;
    height: 250px;
  }

  @media (max-width: 425px) {
    width: 200px;
    height: 200px;
  }
`;

const LogoImg = styled.img<ImgProps>`
  width: 98%;
  height: 98%;
  box-shadow: 0 0 12px grey;

  filter: ${props => props.buttonDisabled && css`
    brightness(90%);
    transition: 0.5s;
  `}
`;

const MeshSegment = styled.div`
  padding: 30px;
  width: 70%;
  border: none;
  background-color: transparent;
  background-image: url(${mesh});
  display: flex;
  flex-direction: column;
  align-items: center;
  border-radius: 20px;

  @media (max-width: 768px) {
    width: 90%;
  }
`

const ProcessLoader = styled(Loader)`
  &&& {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateY(-50%) translateX(-50%);
  }
`;

const Generator: React.FC<IProps> = props => {
  return (
    <BackGround>
      <MeshSegment>
        <GeneratorInput action size="large">
          <InnerInput
            defaultValue={props.word}
            onChange={props.handleInput}
            placeholder={"作成したい言葉を日本語で入力してください"}
          />
          <Button primary onClick={props.handleButtonClick} disabled={props.buttonDisabled}>
            ロゴを作成
          </Button>
        </GeneratorInput>

        <Logo>
          <ProcessLoader active={props.buttonDisabled} inline='centered' />
          <LogoImg src={props.imgUrl} buttonDisabled={props.buttonDisabled}></LogoImg>
        </Logo>
      </MeshSegment>
    </BackGround>
  )
};

export default Generator;
