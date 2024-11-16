import React from "react";
import styled from "styled-components";
import Product from "./Product";
import { Product as ProductType } from "../types";

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(250px, 1fr)
  ); // Cambia 'auto-fit' por 'auto-fill'
  gap: 15px; // Ajusta el espacio entre los productos
  width: 100%; // Asegura que ocupe todo el ancho disponible
  max-width: 1200px; // Opcional: limita el ancho total si quieres un diseño más compacto
  margin: 0 auto; // Centra el grid en la página
  box-sizing: border-box;
  padding: 0 20px; // Opcional: agrega espacio lateral para evitar que las tarjetas queden pegadas a los bordes
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
