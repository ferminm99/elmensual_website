import React from "react";
import styled from "styled-components";
import { mobile } from "../responsive";
import { Link } from "react-router-dom";

interface ItemProps {
  item: {
    id: number;
    img: string;
    cat: string;
    title: string;
  };
}

const Container = styled.div`
  flex: 1;
  margin: 3px;
  height: 70vh;
  position: relative;
  overflow: hidden; /* Oculta cualquier contenido que sobresalga */
  background-color: #f9f9f9; /* Fondo claro */
  cursor: pointer; /* Indica que es interactivo */

  &:hover img {
    transform: scale(1.05); /* Zoom suave */
  }

  &:hover div {
    background-color: rgba(0, 0, 0, 0.5); /* Aumenta la opacidad del fondo */
  }
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain; /* Asegura que la imagen se vea completa */
  transition: transform 0.3s ease; /* Transición suave para el zoom */
`;

const Info = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.3); /* Fondo translúcido */
  transition: background-color 0.3s ease; /* Transición suave para el fondo */
`;

const Title = styled.h1`
  color: white;
  margin-bottom: 20px;
  font-size: 24px;
  text-align: center;
`;

const Button = styled.button`
  border: none;
  padding: 10px 20px;
  background-color: white;
  color: gray;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease; /* Transición para hover */

  &:hover {
    background-color: gray; /* Cambia el fondo al pasar el mouse */
    color: white; /* Cambia el texto a blanco */
    transform: scale(1.1); /* Aumenta ligeramente el tamaño */
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.2); /* Sombra para mayor impacto */
  }
`;

const CategoryItem: React.FC<ItemProps> = ({ item }) => {
  return (
    <Container>
      <Link to={`/products/${item.cat}`}>
        <Image src={item.img} />
        <Info>
          <Title>{item.title}</Title>
          <Button>VER MAS</Button>
        </Info>
      </Link>
    </Container>
  ); // Muestra el título o lo que necesites
};

export default CategoryItem;
