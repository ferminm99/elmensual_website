import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axios from "axios";
import Product from "./Product";

const Container = styled.div`
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
`;

interface Product {
  _id: string;
  title: string;
  desc: string;
  img: string;
  categories: string[];
  size: string[];
  color: string[];
  price: number;
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProductsProps {
  cat?: string;
  filters?: { [key: string]: string };
  sort?: string;
}

const Products: React.FC<ProductsProps> = ({ cat, filters = {}, sort }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    const getProducts = async () => {
      try {
        console.log("Fetching products for category:", cat);
        const baseUrl = import.meta.env.VITE_API_URL; // Usamos la variable de entorno
        const url = cat
          ? `${baseUrl}/products?category=${cat}`
          : `${baseUrl}/products`;
        const res = await axios.get(url);
        setProducts(res.data);
        console.log("API response data:", res.data);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    getProducts();
  }, [cat]);

  // Filtrar productos en función de los filtros de color y tamaño
  useEffect(() => {
    let tempProducts = products;
    if (filters.color) {
      tempProducts = tempProducts.filter((product) =>
        product.color.includes(filters.color.toLowerCase())
      );
    }
    if (filters.size) {
      tempProducts = tempProducts.filter((product) =>
        product.size.includes(filters.size)
      );
    }
    setFilteredProducts(tempProducts);
  }, [products, filters]);

  // Ordenar los productos filtrados en función del valor de 'sort'
  useEffect(() => {
    if (sort === "newest") {
      setFilteredProducts((prev) =>
        [...prev].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
    } else if (sort === "asc") {
      setFilteredProducts((prev) =>
        [...prev].sort((a, b) => a.price - b.price)
      );
    } else if (sort === "desc") {
      setFilteredProducts((prev) =>
        [...prev].sort((a, b) => b.price - a.price)
      );
    }
  }, [sort]);

  return (
    <Container>
      {(cat ? filteredProducts : products.slice(0, 8)).map((item) => (
        <Product
          item={{ ...item, _id: parseInt(item._id, 10) }}
          key={item._id}
        />
      ))}
    </Container>
  );
};

export default Products;
