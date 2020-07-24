import React from "react";
import styled from "styled-components";

type IProps = {
  popularItemUrls: string[];
}

const BackGround = styled.div`
  background-color: #FFF9E6;
  padding: 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const RankingBox = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  width: 70%;

  @media (max-width: 768px) {
    width: 95%;
  }
`;

const DummyBox = styled.img`
  background-color: white;
  margin: 20px;
  width: 200px;
  height: 200px;

  @media (max-width: 768px) {
    width: 175px;
    height: 175px;
  }
`;

const Ranking: React.FC<IProps> = props => {
  const popularLogos = () => {
    const logos = props.popularItemUrls.map((url, idx) => {
      return (<DummyBox src={url} key={idx}></DummyBox>)
    });
    return logos;
  };

  return (
    <BackGround>
      <h3>人気のワード</h3>
      <RankingBox>
        {popularLogos()}
      </RankingBox>
    </BackGround>  
  )
};

export default Ranking;
