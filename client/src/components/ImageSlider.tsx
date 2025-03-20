import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { mobile } from "../responsive"; // Asegura que está bien importado

const desktopImages = [
  "https://res.cloudinary.com/djovvsorv/image/upload/v1742403710/DSC01999_o0pdhe.jpg",
  "https://res.cloudinary.com/djovvsorv/image/upload/v1742403710/DSC01962_sdzmqh.jpg",
  "https://res.cloudinary.com/djovvsorv/image/upload/v1742403710/DSC01980_p4zakh.jpg",
  "https://res.cloudinary.com/djovvsorv/image/upload/v1742404593/DSC02222_f4hyvd.jpg",
  "https://res.cloudinary.com/djovvsorv/image/upload/v1742404603/DSC02001_miaycd.jpg",
  "https://res.cloudinary.com/djovvsorv/image/upload/v1742404605/DSC02005_mzbjo8.jpg",
  "https://res.cloudinary.com/djovvsorv/image/upload/v1742404749/DSC01946_szlasc.jpg",
  "https://res.cloudinary.com/djovvsorv/image/upload/v1742404749/DSC01888_dqbyyp.jpg",
  "https://res.cloudinary.com/djovvsorv/image/upload/v1742404762/DSC01875_hpssih.jpg",
  "https://res.cloudinary.com/djovvsorv/image/upload/v1742404774/DSC01853_r4rjdj.jpg",
  "https://res.cloudinary.com/djovvsorv/image/upload/v1742425710/DSC01936_b39x9i.jpg",
];

const mobileImages = [
  "https://res.cloudinary.com/djovvsorv/image/upload/v1742423561/DSC01978_nl0mof.jpg",
  "https://res.cloudinary.com/djovvsorv/image/upload/v1742423561/DSC02226_1_ljwu0j.jpg",
  "https://res.cloudinary.com/djovvsorv/image/upload/v1742423561/DSC02198_wauvxt.jpg",
  "https://res.cloudinary.com/djovvsorv/image/upload/v1742423561/DSC01904_atyywz.jpg",
  "https://res.cloudinary.com/djovvsorv/image/upload/v1742423561/DSC01876_xuemk0.jpg",
  "https://res.cloudinary.com/djovvsorv/image/upload/v1742423561/DSC01872_p6nwnd.jpg",
  "https://res.cloudinary.com/djovvsorv/image/upload/v1742425000/DSC01912_cs1ahn.jpg",
  "https://res.cloudinary.com/djovvsorv/image/upload/v1742425722/fotomobile5_cwrwsl.png",
  "https://res.cloudinary.com/djovvsorv/image/upload/v1742425721/fotomobile4_vakops.png",
  "https://res.cloudinary.com/djovvsorv/image/upload/v1742425720/fotomobile2_sdl9dl.png",
  "https://res.cloudinary.com/djovvsorv/image/upload/v1742425718/fotomobile3_hceplp.png",
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
