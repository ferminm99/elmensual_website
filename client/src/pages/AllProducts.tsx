import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Navbar from "../components/Navbar";
import Announcement from "../components/Announcement";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";
import axios from "axios";
import Product from "../components/Product";
import baseUrl from "../apiConfig";
import { Product as ProductType } from "../types";

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
  width: calc(100% - 80px);
  margin: 0 auto;
  overflow-x: hidden;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 20px 0;
  gap: 5px;
`;

const PaginationButton = styled.button<{ active?: boolean }>`
  padding: 8px 12px;
  background-color: ${(props) => (props.active ? "#555" : "#333")};
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 4px;

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const AllProducts: React.FC = () => {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(`${baseUrl}/products`);
        setProducts(res.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  const totalPages = Math.ceil(products.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handlePageClick = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];

    if (totalPages <= 5) {
      // Mostrar todas las páginas si el total es 5 o menos
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Siempre muestra el primer número
      pageNumbers.push(1);

      // Muestra el rango de páginas en el medio
      if (currentPage > 3) pageNumbers.push("...");

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }

      if (currentPage < totalPages - 2) pageNumbers.push("...");

      // Siempre muestra el último número
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  const displayedProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Container>
      <Announcement />
      <Navbar />
      <Title>Todos los Productos</Title>
      <ProductsContainer>
        {displayedProducts.map((item) => (
          <Product key={item._id} item={item} />
        ))}
      </ProductsContainer>
      <PaginationContainer>
        <PaginationButton
          onClick={handlePreviousPage}
          disabled={currentPage === 1}
        >
          &lt;
        </PaginationButton>
        {currentPage > 3 && (
          <>
            <PaginationButton onClick={() => handlePageClick(1)}>
              1
            </PaginationButton>
            {currentPage > 4 && <span>...</span>}
          </>
        )}
        {getPageNumbers().map((pageNumber) =>
          typeof pageNumber === "number" ? (
            <PaginationButton
              key={pageNumber}
              onClick={() => handlePageClick(pageNumber)}
              active={pageNumber === currentPage}
            >
              {pageNumber}
            </PaginationButton>
          ) : (
            <span key={pageNumber}>{pageNumber}</span>
          )
        )}

        {currentPage < totalPages - 2 && (
          <>
            {currentPage < totalPages - 3 && <span>...</span>}
            <PaginationButton onClick={() => handlePageClick(totalPages)}>
              {totalPages}
            </PaginationButton>
          </>
        )}
        <PaginationButton
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
        >
          &gt;
        </PaginationButton>
      </PaginationContainer>
      <Newsletter />
      <Footer />
    </Container>
  );
};

export default AllProducts;
