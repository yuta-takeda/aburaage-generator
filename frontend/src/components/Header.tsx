import React from "react";
import styled from "styled-components";

interface IProps {
  title: string;
  note: string;
}

const BackGround = styled.div`
  background-color: #0068c4;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 6px;
  color: white;
  text-align: center;
`;

const Note = styled.small`
  color: white;
  text-align: center;
`;

const Header: React.FC<IProps> = props => {
  return (
    <BackGround>
      <Title>{props.title}</Title>
      <Note>{props.note}</Note>
    </BackGround>
  )
};

export default Header;
