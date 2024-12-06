import React, { useEffect, useState } from "react";
import styled from "styled-components";
import Navbar from "../components/Navbar";
import Announcement from "../components/Announcement";
import Newsletter from "../components/Newsletter";
import Products from "../components/Products";
import { mobile } from "../responsive";
import { useLocation } from "react-router-dom";
import axios from "axios";
import baseUrl from "../apiConfig";
import { Product } from "../types";

interface Filters {
  [key: string]: string | undefined;
}

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const Container = styled.div``;

const Title = styled.h1`
  margin: 20px;
  text-align: center;
  font-size: 24px;

  ${mobile({
    fontSize: "18px",
  })}
`;

const FilterContainer = styled.div<{ isMobileVisible: boolean }>`
  display: ${(props) => (props.isMobileVisible ? "flex" : "none")};
  flex-direction: column;
  gap: 20px;
  max-width: 100%;
  margin: 20px 0;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  position: relative;
  transition: transform 0.3s ease-in-out, opacity 0.3s ease;

  ${mobile({
    position: "fixed",
    top: "80px",
    left: "0",
    right: "0",
    zIndex: 1000,
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
  })}
`;

const CloseButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background: #333;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  font-size: 18px;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: #555;
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.9);
  }
`;

const FilterToggle = styled.button`
  display: none;

  ${mobile({
    display: "block",
    background: "#555",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    margin: "10px auto",
    transition: "background-color 0.3s ease, transform 0.2s ease",
  })}

  &:hover {
    background-color: #777;
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const Filter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  ${mobile({
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "10px",
  })}
`;

const FilterText = styled.div`
  font-size: 20px;
  font-weight: 600;
`;

const Select = styled.select`
  padding: 10px;
  margin-right: 20px;
  border: 1px solid #ccc;
  border-radius: 4px;
  transition: border-color 0.3s ease;

  &:hover {
    border-color: #777;
  }

  ${mobile({
    margin: "10px 0",
    width: "100%",
  })}
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
  transition: background-color 0.3s ease, transform 0.2s ease;

  &:hover {
    background-color: ${(props) => (props.active ? "#777" : "#555")};
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.9);
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const ProductList: React.FC = () => {
  const location = useLocation();
  const paths = location.pathname.split("/").slice(2);
  const mainCategory = paths[0]?.toLowerCase();
  const subCategory = paths[1]?.toLowerCase();
  const type = paths[2]?.toLowerCase() || "";

  const [filters, setFilters] = useState<Filters>({});
  const [availableSizes, setAvailableSizes] = useState<number[]>([]);
  const [sort, setSort] = useState("newest");
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFiltersVisible, setMobileFiltersVisible] = useState(false);
  const itemsPerPage = 12;

  const handleFilters = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const toggleMobileFilters = () => {
    setMobileFiltersVisible((prev) => !prev);
  };

  const formatTitle = () => {
    const category = subCategory
      ? subCategory.charAt(0).toUpperCase() + subCategory.slice(1).toLowerCase()
      : "";
    const group = mainCategory
      ? mainCategory.charAt(0).toLowerCase() + mainCategory.slice(1)
      : "";

    return `${category} de ${group} - ${type.replace(/-/g, " ")}`;
  };

  useEffect(() => {
    const fetchSizesAndProducts = async () => {
      try {
        const categoryParams = [
          mainCategory && `category=${mainCategory}`,
          subCategory && `subcategory=${subCategory}`,
          type && `type=${type}`,
        ]
          .filter(Boolean)
          .join("&");

        const url = `${baseUrl}/products${
          categoryParams ? `?${categoryParams}` : ""
        }`;

        console.log("URL generada para la API:", url); // Log de la URL generada

        const res = await axios.get(url);
        const productsData: Product[] = res.data;

        console.log("Productos recibidos desde la API:", productsData); // Log de los productos recibidos

        setProducts(productsData);

        const sizesSet = new Set<number>();
        productsData.forEach((product) =>
          product.size.forEach((size) => sizesSet.add(Number(size)))
        );
        setAvailableSizes(Array.from(sizesSet).sort((a, b) => a - b));
      } catch (err) {
        console.error("Error fetching products and sizes:", err);
      }
    };

    fetchSizesAndProducts();
  }, [mainCategory, subCategory, type]);

  useEffect(() => {
    console.log("Productos antes del filtrado:", products);
    console.log("Filtros actuales:", filters);
    console.log("MainCategory:", mainCategory);
    console.log("SubCategory:", subCategory);
    console.log("Type:", type);

    const normalizedTypeParts = type
      ? type.replace(/-/g, " ").toLowerCase().split(" ") // Separar por espacio
      : [];

    const filtered = products.filter((product) => {
      const productCategories = product.categories.map((category: string) =>
        category.toLowerCase()
      );

      const matchesCategory =
        productCategories.includes(mainCategory) &&
        productCategories.includes(subCategory);

      // Verificar si todas las partes de type están en las categorías
      const matchesType = normalizedTypeParts.every((part) =>
        productCategories.includes(part)
      );

      const matchesSize =
        !filters.size || product.size.includes(Number(filters.size).toString());

      const included = matchesCategory && matchesType && matchesSize;

      // Agregar logs para debug
      console.log("Producto:", product.title);
      console.log("Categorías del producto:", productCategories);
      console.log("Matches Size:", matchesSize);
      console.log(
        "Matches Type:",
        matchesType,
        "para type parts:",
        normalizedTypeParts
      );
      console.log("Matches Category:", matchesCategory);
      console.log("Incluido en el filtrado:", included);

      return included;
    });

    console.log("Productos después del filtrado:", filtered);
    setFilteredProducts(filtered);
  }, [products, filters, mainCategory, subCategory, type]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const displayedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <Container>
      <Navbar />
      <Announcement />
      <MainContent>
        <Title>{formatTitle()}</Title>

        <FilterToggle onClick={toggleMobileFilters}>
          {isMobileFiltersVisible ? "Ocultar Filtros" : "Mostrar Filtros"}
        </FilterToggle>

        <FilterContainer isMobileVisible={isMobileFiltersVisible}>
          <CloseButton onClick={() => setMobileFiltersVisible(false)}>
            &times;
          </CloseButton>
          <Filter>
            <FilterText>Filtrar Productos:</FilterText>
            <Select name="color" onChange={handleFilters}>
              <option value="">Todos los colores</option>
              <option>Blanco</option>
              <option>Negro</option>
              <option>Rojo</option>
              <option>Azul</option>
              <option>Amarillo</option>
              <option>Verde</option>
            </Select>
            <Select name="size" value={filters.size} onChange={handleFilters}>
              <option value="">Todos los tamaños</option>
              {availableSizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </Select>
          </Filter>
          <Filter>
            <FilterText>Ordenar Productos:</FilterText>
            <Select onChange={(e) => setSort(e.target.value)}>
              <option value="newest">Nuevo</option>
              <option value="asc">Precio (ascendente)</option>
              <option value="desc">Precio (descendente)</option>
            </Select>
          </Filter>
        </FilterContainer>

        <Products
          products={displayedProducts}
          filters={Object.fromEntries(
            Object.entries(filters).map(([key, value]) => [key, value || ""])
          )}
          sort={sort}
        />

        <PaginationContainer>
          <PaginationButton
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            &lt;
          </PaginationButton>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <PaginationButton
              key={page}
              active={page === currentPage}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </PaginationButton>
          ))}
          <PaginationButton
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            &gt;
          </PaginationButton>
        </PaginationContainer>
      </MainContent>
      <Newsletter />
    </Container>
  );
};

export default ProductList;
