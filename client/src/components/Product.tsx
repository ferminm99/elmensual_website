import {
  FavoriteBorderOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
} from "@material-ui/icons";
import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { normalizeProductImageUrl } from "../utils/imageUrl";

interface ProductProps {
  item: {
    _id: string;
    img: string;
    title: string;
    categories: string[];
    price: number;
  };
}

const ImageContainer = styled.div`
  width: 100%;
  aspect-ratio: 2 / 3;
  background-color: #f0f0f0;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: white;
  font-size: 18px;
  font-weight: bold;
  text-transform: uppercase;

  ${ImageContainer}:hover & {
    opacity: 1;
  }
`;

const Card = styled.div`
  width: 100%;
  max-width: 100%;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  text-align: center;
  padding: 10px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.03);
    transform: translateY(-5px);
  }
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
  cursor: pointer;

  ${Card}:hover & {
    transform: scale(1.05);
  }
`;

const Info = styled.div`
  opacity: 0;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s ease;

  ${Card}:hover & {
    opacity: 1;
  }
`;

const IconContainer = styled.div`
  display: flex;
  gap: 10px;
`;

const Icon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #f5fbfd;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  cursor: pointer;
  color: black;

  &:hover {
    background-color: #e9f5f5;
    transform: scale(1.1);
  }

  a {
    color: inherit;
    text-decoration: none;
  }
`;

const Details = styled.div`
  padding: 10px;
`;

const Title = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 5px 0;
  text-align: center;
  overflow: visible;
  white-space: normal;
  width: 100%;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: gray;
  margin-bottom: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Price = styled.span`
  font-size: 18px;
  font-weight: bold;
  color: #333;
`;

const optimizedImageCache = {} as Record<string, string>;
const getOptimizedCloudinaryURL = (url: string, width: number = 500) => {
  if (!url.includes("res.cloudinary.com")) return url;
  const key = `${url}-w${width}`;
  if (optimizedImageCache[key]) return optimizedImageCache[key];
  const optimized = url.replace(
    "/upload/",
    `/upload/w_${width},f_auto,q_auto/`
  );
  optimizedImageCache[key] = optimized;
  return optimized;
};

const Product: React.FC<ProductProps> = ({ item }) => {
  return (
    <Card>
      <Link
        to={`/product/${item._id}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <ImageContainer>
          <Image src={normalizeProductImageUrl(item.img)} alt={item.title} />
          <Overlay>Ver Producto</Overlay>
        </ImageContainer>
      </Link>
      <Details>
        <Title>{item.title}</Title>
        {/* <Subtitle>{item.categories[0]}</Subtitle> */}
        {/* <Price>${item.price}</Price> */}
      </Details>
    </Card>
  );
};

export default Product;
