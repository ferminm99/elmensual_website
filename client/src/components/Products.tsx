import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Product from "./Product";
import axios from "axios";
import baseUrl from "../apiConfig";

const Container = styled.div`
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
`;

interface ProductProps {
  products?: Product[]; // Productos opcionales que pueden ser pasados desde el padre
  filters?: { [key: string]: string };
  sort?: string;
}

const Products: React.FC<ProductProps> = ({
  products: initialProducts = [], // Inicialmente vacío, si no se pasa
  filters = {},
  sort,
}) => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [filteredProducts, setFilteredProducts] =
    useState<Product[]>(initialProducts);

  // Obtener productos predeterminados si no se pasan como prop
  useEffect(() => {
    if (initialProducts.length === 0) {
      const getDefaultProducts = async () => {
        try {
          const res = await axios.get(`${baseUrl}/products?category=bombacha`);
          setProducts(res.data);
        } catch (err) {
          console.error("Error fetching default products:", err);
        }
      };
      getDefaultProducts();
    } else {
      setProducts(initialProducts); // Usar los productos iniciales si se pasan como prop
    }
  }, [initialProducts]);

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
      {filteredProducts.length > 0 ? (
        filteredProducts.map((item) => <Product key={item._id} item={item} />)
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
