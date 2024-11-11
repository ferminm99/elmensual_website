import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Navbar from "../components/Navbar";
import Announcement from "../components/Announcement";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";
import axios from "axios";
import Product from "../components/Product"; // Asegúrate de que Product tenga el diseño de título y subtítulo
import baseUrl from "../apiConfig";

const Container = styled.div`
  max-width: 100%;
  overflow-x: hidden;
`;

const Title = styled.h1`
  margin: 20px;
  text-align: center;
`;

const ProductsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  justify-items: center;
  box-sizing: border-box;
  width: calc(100% - 80px); /* Ajusta el ancho para el padding */
  margin: 0 auto;
  overflow-x: hidden;
`;

const AllProducts: React.FC = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${baseUrl}/products`); // Cambia la URL según tu configuración
        setProducts(res.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <Container>
      <Announcement />
      <Navbar />
      <Title>Todos los Productos</Title>
      <ProductsContainer>
        {products.map((item) => (
          <Product key={item._id} item={item} /> // Cada producto usará el componente Product con título y subtítulo
        ))}
      </ProductsContainer>
      <Newsletter />
      <Footer />
    </Container>
  );
};

export default AllProducts;
