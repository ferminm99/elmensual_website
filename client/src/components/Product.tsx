import {
  FavoriteBorderOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
} from "@material-ui/icons";
import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

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
  height: 300px;
  background-color: #f0f0f0;
  position: relative;
  transition: filter 0.3s ease; /* Suaviza el efecto de oscurecimiento */
`;

const Card = styled.div`
  width: 100%; /* Permite que el card use todo el ancho asignado */
  max-width: 250px; /* Limita el ancho máximo de cada tarjeta */
  background-color: white;
  overflow: hidden;
  text-align: center;
  position: relative;
  transition: background-color 0.3s ease;
  padding: 10px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1); /* Sombra para separación visual */

  &:hover {
    background-color: rgba(0, 0, 0, 0.05); /* Fondo gris suave al hacer hover */
  }
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
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

  &:hover {
    background-color: #e9f5f5;
    transform: scale(1.1);
  }
`;

const Details = styled.div`
  padding: 10px;
`;

const Title = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 5px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap; /* Mantener en una línea */
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

const Product: React.FC<ProductProps> = ({ item }) => {
  return (
    <Card>
      <ImageContainer>
        <Image src={item.img} alt={item.title} />
        <Info>
          <IconContainer>
            <Icon>
              <ShoppingCartOutlined />
            </Icon>
            <Icon>
              <Link to={`/product/${item._id}`}>
                <SearchOutlined />
              </Link>
            </Icon>
            <Icon>
              <FavoriteBorderOutlined />
            </Icon>
          </IconContainer>
        </Info>
      </ImageContainer>
      <Details>
        <Title>{item.title}</Title>
        <Subtitle>{item.categories[0]}</Subtitle>
        <Price>${item.price}</Price>
      </Details>
    </Card>
  );
};

export default Product;
