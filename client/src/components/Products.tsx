import React from "react";
import styled from "styled-components";
import Product from "./Product";
import { Product as ProductType } from "../types";

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(250px, 1fr)
  ); /* Mantén 'auto-fill' */
  gap: 50px; /* Aumenta el espacio entre las tarjetas */
  width: 100%; /* Ocupa todo el ancho disponible */
  //max-width: 1200px; /* Limita el ancho total si es necesario */
  background-color: #f9f9f9; /* Fondo similar al slider */
  margin: 0 auto; /* Centra el contenedor */
  box-sizing: border-box;
  padding: 20px; /* Añade espacio interno para evitar que las tarjetas toquen los bordes */
`;

interface ProductProps {
  products: ProductType[];
  filters?: { [key: string]: string };
  sort?: string;
}

const Products: React.FC<ProductProps> = ({ products = [] }) => {
  const limitedProducts = products.slice(0, 12); // Limita a los primeros 12 productos

  return (
    <Container>
      {limitedProducts.length > 0 ? (
        limitedProducts.map((item) => <Product key={item._id} item={item} />)
      ) : (
        <p>
          No se encontraron productos que coincidan con los filtros
          seleccionados.
        </p>
      )}
    </Container>
  );
};

export default Products;
