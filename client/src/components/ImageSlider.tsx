import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { mobile } from "../responsive"; // Asegura que está bien importado

const desktopImages = [
  "/images/DSC01999.jpg",
  "/images/DSC01962.jpg",
  "/images/DSC01980.jpg",
  "/images/DSC02222.jpg",
  "/images/DSC02001.jpg",
  "/images/DSC02005.jpg",
  "/images/DSC01946.jpg",
  "/images/DSC01888.jpg",
  "/images/DSC01875.jpg",
  "/images/DSC01853.jpg",
  "/images/DSC01936.jpg",
];

const mobileImages = [
  "/images/DSC01978.jpg",
  "/images/DSC02226_1.jpg",
  "/images/DSC02198.jpg",
  "/images/DSC01904.jpg",
  "/images/DSC01876.jpg",
  "/images/DSC01872.jpg",
  "/images/DSC01912.jpg",
  "/images/fotomobile5.png",
  "/images/fotomobile4.png",
  "/images/fotomobile2.png",
  "/images/fotomobile3.png",
];

const Container = styled.div`
  margin-top: 80px;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Image = styled.img<{ isVisible: boolean }>`
  width: 100vw;
  height: 100vh;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  opacity: ${(props) => (props.isVisible ? 1 : 0)};
  transition: opacity 1s ease-in-out;
`;

const ImageSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const updateImages = () => {
      if (window.innerWidth <= 768) {
        setImages(mobileImages);
      } else {
        setImages(desktopImages);
      }
    };

    updateImages();
    window.addEventListener("resize", updateImages);

    return () => window.removeEventListener("resize", updateImages);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [images]);

  return (
    <Container>
      {images.map((img, index) => (
        <Image key={index} src={img} isVisible={index === currentIndex} />
      ))}
    </Container>
  );
};

export default ImageSlider;
