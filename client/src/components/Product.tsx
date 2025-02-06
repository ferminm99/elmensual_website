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
  aspect-ratio: 3 / 4;
  background-color: #f0f0f0;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px; /* Espacio entre la imagen y el título */
`;

const Card = styled.div`
  width: 100%;
  max-width: 100%; /* Elimina el ancho máximo para pantallas pequeñas */
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
  object-fit: contain; /* Asegura que la imagen no se recorte */
  transition: transform 0.3s ease;

  ${Card}:hover & {
    transform: scale(1.05); /* Zoom suave al pasar el mouse */
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
  color: black; /* Cambia el color del ícono a negro */

  &:hover {
    background-color: #e9f5f5;
    transform: scale(1.1);
  }

  a {
    color: inherit; /* Asegura que los enlaces dentro tomen el color definido */
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
  white-space: normal; /* Mantener en una línea */
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
            {/* <Icon>
                <ShoppingCartOutlined />
              </Icon> */}
            <Icon>
              <Link to={`/product/${item._id}`}>
                <SearchOutlined />
              </Link>
            </Icon>
            {/* <Icon>
                <FavoriteBorderOutlined />
              </Icon> */}
          </IconContainer>
        </Info>
      </ImageContainer>
      <Details>
        <Title>{item.title}</Title>
        {/* <Subtitle>{item.categories[0]}</Subtitle> */}
        {/* <Price>${item.price}</Price> */}
      </Details>
    </Card>
  );
};

export default Product;
