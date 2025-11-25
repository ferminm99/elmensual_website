import React, { useState, useEffect } from "react";
import styled from "styled-components";

const desktopImages = [
  "/images/DSC01999.webp",
  "/images/DSC01962.webp",
  "/images/DSC01980.webp",
  "/images/DSC02222.webp",
  "/images/DSC02001.webp",
  "/images/DSC02005.webp",
  "/images/DSC01946.webp",
  "/images/DSC01888.webp",
  "/images/DSC01875.webp",
  "/images/DSC01853.webp",
  "/images/DSC01936.webp",
];

const mobileImages = [
  "/images/DSC01978.webp",
  "/images/DSC02226.webp",
  "/images/DSC02198.webp",
  "/images/DSC01904.webp",
  "/images/DSC01876.webp",
  "/images/DSC01872.webp",
  "/images/DSC01912.webp",
  "/images/fotomobile5.webp",
  "/images/fotomobile4.webp",
  "/images/fotomobile2.webp",
  "/images/fotomobile3.webp",
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
