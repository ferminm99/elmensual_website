import React, { useState, useEffect } from "react";
import styled from "styled-components";

const desktopImages = [
  "/images/DSC01999.JPG",
  "/images/DSC01962.JPG",
  "/images/DSC01980.JPG",
  "/images/DSC02222.JPG",
  "/images/DSC02001.JPG",
  "/images/DSC02005.JPG",
  "/images/DSC01946.JPG",
  "/images/DSC01888.JPG",
  "/images/DSC01875.JPG",
  "/images/DSC01853.JPG",
  "/images/DSC01936.JPG",
];

const mobileImages = [
  "/images/DSC01978.JPG",
  "/images/DSC02226.JPG",
  "/images/DSC02198.JPG",
  "/images/DSC01904.JPG",
  "/images/DSC01876.JPG",
  "/images/DSC01872.JPG",
  "/images/DSC01912.JPG",
  "/images/fotomobile5.png",
  "/images/fotomobile4.png",
  "/images/fotomobile2.png",
  "/images/fotomobile3.png",
];

// CONTAINER Y STYLES
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
        setImages(mobileImages); // ✅ directamente
      } else {
        setImages(desktopImages); // ✅ directamente
      }
    };

    updateImages();
    window.addEventListener("resize", updateImages);
    return () => window.removeEventListener("resize", updateImages);
  }, []);

  useEffect(() => {
    if (!images.length) return;
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
