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
import Footer from "../components/Footer";

interface Filters {
  [key: string]: string | undefined;
}

const MainContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const BackgroundContainer = styled.div`
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
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
  display: flex;
  align-items: center;
  justify-content: space-between; /* Alinea los filtros en una fila */
  gap: 20px; /* Espaciado entre filtros */
  margin: 20px 0;
  padding: 0; /* Eliminamos el padding para pantallas grandes */
  background-color: transparent; /* Sin fondo gris */

  ${({ isMobileVisible }) =>
    mobile({
      display: isMobileVisible ? "flex" : "none",
      flexDirection: "column",
      gap: "20px",
      padding: "20px",
      backgroundColor: "#f9f9f9",
      borderRadius: "8px",
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
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 10px; /* Espaciado entre el texto y el select */
`;

const Select = styled.select`
  padding: 10px;
  margin-left: 20px;
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
  const [availableColors, setAvailableColors] = useState<string[]>([]); // Estado para los colores disponibles

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
    const fixNinos = (str: string) => {
      // Reemplaza "ninos" o "Ninos" por "niños" o "Niños"
      return str.replace(/ninos/gi, (match) =>
        match.charAt(0) === "N" ? "Niños" : "niños"
      );
    };

    if (!subCategory && !type) {
      // Si no hay subcategoría ni tipo, retorna la categoría principal con la primera letra en mayúscula
      return mainCategory
        ? fixNinos(
            mainCategory.charAt(0).toUpperCase() +
              mainCategory.slice(1).toLowerCase()
          )
        : "";
    }

    const category = subCategory
      ? fixNinos(
          subCategory.charAt(0).toUpperCase() +
            subCategory.slice(1).toLowerCase()
        )
      : "";
    const group = mainCategory
      ? fixNinos(mainCategory.charAt(0).toLowerCase() + mainCategory.slice(1))
      : "";

    return `${category} de ${group} - ${fixNinos(type.replace(/-/g, " "))}`;
  };

  useEffect(() => {
    const uniqueColors = new Set<string>();

    products.forEach((product) => {
      if (product.images && typeof product.images === "object") {
        Object.keys(product.images).forEach((key) => {
          const color = normalizeColor(key);
          uniqueColors.add(color);
        });
      }
    });

    setAvailableColors(Array.from(uniqueColors));
  }, [products]);

  const normalizeColor = (color: string) => color.replace(/[0-9]/g, "").trim();

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
        (!mainCategory || productCategories.includes(mainCategory)) &&
        (!subCategory || productCategories.includes(subCategory));

      const matchesType = normalizedTypeParts.every((part) =>
        productCategories.includes(part)
      );

      const matchesSize =
        !filters.size || product.size.includes(Number(filters.size).toString());

      const matchesColor =
        !filters.color || // Si no hay filtro de color, incluye el producto
        (product.images &&
          typeof product.images === "object" &&
          Object.keys(product.images).some(
            (key) =>
              normalizeColor(key).toLowerCase() === filters.color!.toLowerCase()
          ));

      //const matchesStock = product.inStock; // Excluye productos que no están en stock

      const included =
        matchesCategory && matchesType && matchesSize && matchesColor;

      console.log("Producto:", product.title);
      console.log("Matches Size:", matchesSize);
      console.log("Matches Type:", matchesType);
      console.log("Matches Color:", matchesColor);
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
      {/* <Announcement /> */}
      <BackgroundContainer>
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
              <Select name="color" onChange={handleFilters}>
                <option value="">Todos los colores</option>
                {availableColors.map((color) => (
                  <option key={color} value={color}>
                    {color.charAt(0).toUpperCase() + color.slice(1)}
                  </option>
                ))}
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
      </BackgroundContainer>
      <Newsletter />
      <Footer />
    </Container>
  );
};

export default ProductList;
