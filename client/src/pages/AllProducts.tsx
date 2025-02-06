import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Navbar from "../components/Navbar";
import Announcement from "../components/Announcement";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";
import axios from "axios";
import Products from "../components/Products"; // Usar el mismo componente que ProductList
import baseUrl from "../apiConfig";
import { Product as ProductType } from "../types";
import { useLocation } from "react-router-dom";

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const BackgroundContainer = styled.div`
  background-color: #f9f9f9;
  padding: 0px;
  border-radius: 8px;
`;

const Container = styled.div``;

const Title = styled.h1`
  margin: 20px;
  text-align: center;
  font-size: 24px;
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

  const location = useLocation();
  const searchResults = location.state?.results || [];

  useEffect(() => {
    console.log("Resultados de búsqueda recibidos:", searchResults);
    if (searchResults.length === 0) {
      const fetchProducts = async () => {
        try {
          const res = await axios.get(`${baseUrl}/products`);
          setProducts(res.data);
        } catch (error) {
          console.error("Error al obtener los productos:", error);
        }
      };
      fetchProducts();
    } else {
      setProducts(searchResults);
    }
  }, [searchResults]);

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

  const displayedProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Container>
      <Navbar />
      <BackgroundContainer>
        <MainContent>
          <Title>
            {searchResults.length > 0
              ? `Resultados de búsqueda (${searchResults.length} productos)`
              : "Todos los Productos"}
          </Title>

          {/* Aquí utilizamos el mismo componente Products */}
          <Products products={displayedProducts} />

          {products.length > itemsPerPage && (
            <PaginationContainer>
              <PaginationButton
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                &lt;
              </PaginationButton>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <PaginationButton
                    key={page}
                    active={page === currentPage}
                    onClick={() => handlePageClick(page)}
                  >
                    {page}
                  </PaginationButton>
                )
              )}
              <PaginationButton
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                &gt;
              </PaginationButton>
            </PaginationContainer>
          )}
        </MainContent>
      </BackgroundContainer>
      <Newsletter />
      <Footer />
    </Container>
  );
};

export default AllProducts;
