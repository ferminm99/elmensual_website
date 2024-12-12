import { ArrowLeftOutlined, ArrowRightOutlined } from "@material-ui/icons";
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { sliderItems } from "../data";
import { mobile } from "../responsive";
import { useNavigate } from "react-router-dom";

type Direction = "left" | "right";

interface ArrowProps {
  direction: Direction;
}

interface WrapperProps {
  slideIndex: number;
}

const Container = styled.div<{ inTransition: boolean }>`
  width: 100%;
  height: 100vh;
  display: flex;
  position: relative;
  overflow: hidden;
  background-color: transparent;
  z-index: 1;
  transition: all 0.3s ease;

  ${({ inTransition }) => (inTransition ? "pointer-events: none;" : "")}

  ${mobile({ display: "none" })}
`;

const Arrow = styled.div<ArrowProps>`
  width: 50px;
  height: 50px;
  background-color: #fff7f7;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  bottom: 0;
  cursor: pointer;
  opacity: 0.5;
  left: ${(props) => props.direction === "left" && "10px"};
  right: ${(props) => props.direction === "right" && "10px"};
  margin: auto;
  z-index: 2;
`;

const Wrapper = styled.div<WrapperProps>`
  height: 100%;
  display: flex;
  transition: all 1.5s ease;
  transform: translateX(${(props) => props.slideIndex * -100}vw);
`;

const ImgContainer = styled.div`
  flex: 0.5;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  overflow: hidden;
`;

const Image = styled.img`
  width: auto;
  height: 100%;
  max-width: 100%;
  object-fit: contain;
`;

const Slide = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f9f9f9;
`;

const InfoContainer = styled.div`
  flex: 0.5;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px;
`;

const Title = styled.h1`
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #333;
`;

const Desc = styled.p`
  font-size: 18px;
  line-height: 1.6;
  color: #555;
  margin-bottom: 20px;
`;

const Button = styled.button`
  padding: 8px 16px;
  font-size: 16px;
  color: #fff;
  background-color: #000;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  width: fit-content;
  transition: all 0.3s ease;

  &:hover {
    background-color: #333;
    transform: scale(1.1);
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.3);
  }
`;

const Slider: React.FC = () => {
  const [slideIndex, setSlideIndex] = useState(0);
  const [inTransition, setInTransition] = useState(false);
  const navigate = useNavigate();

  const handleClick = (direction: Direction) => {
    setInTransition(true);
    setTimeout(() => setInTransition(false), 1500);

    if (direction === "left") {
      setSlideIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : sliderItems.length - 1
      );
    } else {
      setSlideIndex((prevIndex) =>
        prevIndex < sliderItems.length - 1 ? prevIndex + 1 : 0
      );
    }
  };

  const handleViewMoreClick = (link: string) => {
    window.scrollTo(0, 0); // Desplaza al inicio
    navigate(link); // Redirige usando React Router
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setInTransition(true);
      setTimeout(() => setInTransition(false), 1500);

      setSlideIndex((prevIndex) =>
        prevIndex < sliderItems.length - 1 ? prevIndex + 1 : 0
      );
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Container inTransition={inTransition}>
      <Arrow direction="left" onClick={() => handleClick("left")}>
        <ArrowLeftOutlined />
      </Arrow>
      <Wrapper slideIndex={slideIndex}>
        {sliderItems.map((item) => (
          <Slide key={item.id}>
            <ImgContainer>
              <Image src={item.img} alt={item.title} />
            </ImgContainer>
            <InfoContainer>
              <Title>{item.title}</Title>
              <Desc>{item.desc}</Desc>
              <Button onClick={() => handleViewMoreClick(item.link)}>
                Ver más
              </Button>
            </InfoContainer>
          </Slide>
        ))}
      </Wrapper>
      <Arrow direction="right" onClick={() => handleClick("right")}>
        <ArrowRightOutlined />
      </Arrow>
    </Container>
  );
};

export default Slider;
