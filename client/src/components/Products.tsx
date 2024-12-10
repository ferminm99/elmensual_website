import React, { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import Product from "./Product";
import { Product as ProductType } from "../types";

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const Spinner = styled.div`
  margin: 20px auto;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: ${spin} 1s linear infinite;
`;

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 50px;
  width: 100%;
  background-color: #f9f9f9;
  margin: 0 auto;
  box-sizing: border-box;
  padding: 20px;
`;

const LoadingContainer = styled.div`
  text-align: center;
  font-size: 18px;
  color: #666;
`;

interface ProductProps {
  products: ProductType[]; // Productos pasados al componente
  filters?: { [key: string]: string };
  sort?: string;
}

const Products: React.FC<ProductProps> = ({ products = [] }) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (products.length > 0) {
      // Si los productos ya están cargados, desactiva el estado de "cargando"
      setIsLoading(false);
    } else {
      // Si no hay productos, activa "cargando" y espera un tiempo razonable
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 60000); // 2 segundos para evitar loops infinitos si nunca se cargan
      return () => clearTimeout(timer); // Limpia el temporizador
    }
  }, [products]);

  const limitedProducts = products.slice(0, 12); // Limita a los primeros 12 productos

  return (
    <Container>
      {isLoading ? (
        <LoadingContainer>
          <p>Cargando productos...</p>
          <Spinner />
        </LoadingContainer>
      ) : limitedProducts.length > 0 ? (
        limitedProducts.map((item) => <Product key={item._id} item={item} />)
      ) : (
        <LoadingContainer>
          No se encontraron productos que coincidan con los filtros
          seleccionados.
        </LoadingContainer>
      )}
    </Container>
  );
};

export default Products;
