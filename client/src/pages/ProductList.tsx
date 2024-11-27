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
`;

const FilterContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 100%; // Asegura que ocupe todo el ancho del contenedor padre
  margin: 20px 0; // Añade un margen para separación vertical
  padding: 0 20px; // Añade un poco de espacio interno lateral
`;
const Filter = styled.div`
  margin: 20px;
  ${mobile({ width: "0px 20px", display: "flex", flexDirection: "column" })}
`;

const FilterText = styled.div`
  font-size: 20px;
  font-weight: 600;
  margin-right: 20px;
  ${mobile({ marginRight: "0px" })}
`;

const Select = styled.select`
  padding: 10px;
  margin-right: 20px;
  ${mobile({ margin: "10px" })}
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

const formatCategoryTitle = (paths: string[]) => {
  const formattedPaths = paths.map((path) =>
    path.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
  );
  return formattedPaths.join(" > ");
};

const cleanFilters = (filters: Filters): { [key: string]: string } => {
  const validFilters: { [key: string]: string } = {};
  for (const key in filters) {
    if (filters[key]) {
      validFilters[key] = filters[key] as string;
    }
  }
  return validFilters;
};

const Option = styled.option``;

const ProductList: React.FC = () => {
  const location = useLocation();
  const paths = location.pathname.split("/").slice(2);
  const mainCategory = paths[0]?.toLowerCase();
  const subCategory = paths[1]?.toLowerCase();
  const type = paths[2]?.toLowerCase() || "";
  const formattedTitle = formatCategoryTitle(paths);

  const [filters, setFilters] = useState<Filters>({});
  const [availableSizes, setAvailableSizes] = useState<number[]>([]);
  const [sort, setSort] = useState("newest");
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const handleFilters = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Reiniciar filtros al cambiar de categoría
  useEffect(() => {
    // Reiniciar los filtros al cargar nuevas categorías
    setFilters({ size: "" }); // Inicializa `size` como "" para que "Todos los tamaños" esté seleccionado
  }, [mainCategory, subCategory, type]);

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
        const res = await axios.get(url);
        const productsData: Product[] = res.data;

        setProducts(productsData);

        // Obtener talles únicos de los productos
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
    const categoriesRequired = [mainCategory, subCategory, type]
      .filter(Boolean)
      .flatMap((cat) => cat.split("-"));

    const filtered = products.filter((product) => {
      const productCategories = product.categories.map((cat) =>
        cat.toLowerCase()
      );

      // Verificar si el producto pertenece a las categorías requeridas
      const matchesCategories = categoriesRequired.every((requiredCategory) =>
        productCategories.includes(requiredCategory)
      );

      // Verificar si el producto tiene el talle seleccionado
      const matchesSize =
        !filters.size ||
        filters.size === "" ||
        product.size.includes(Number(filters.size));

      return matchesCategories && matchesSize;
    });

    setFilteredProducts(filtered);
  }, [products, mainCategory, subCategory, type, filters]);

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const displayedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      if (currentPage > 3) pageNumbers.push("...");
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      if (currentPage < totalPages - 2) pageNumbers.push("...");
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  return (
    <Container>
      <Navbar />
      <Announcement />
      <MainContent>
        <Title>{formattedTitle}</Title>
        <FilterContainer>
          <Filter>
            <FilterText>Filtrar Productos:</FilterText>
            <Select name="color" onChange={handleFilters}>
              <Option value="">Color</Option>
              <Option>Blanco</Option>
              <Option>Negro</Option>
              <Option>Rojo</Option>
              <Option>Azul</Option>
              <Option>Amarillo</Option>
              <Option>Verde</Option>
            </Select>
            <Select name="size" value={filters.size} onChange={handleFilters}>
              <Option value="">Todos los tamaños</Option>{" "}
              {/* Valor por defecto */}
              {availableSizes.map((size) => (
                <Option key={size} value={size.toString()}>
                  {size}
                </Option>
              ))}
            </Select>
          </Filter>
          <Filter>
            <FilterText>Ordenar Productos:</FilterText>
            <Select onChange={(e) => setSort(e.target.value)}>
              <Option value="newest">Nuevo</Option>
              <Option value="asc">Precio (ascendente)</Option>
              <Option value="desc">Precio (descendente)</Option>
            </Select>
          </Filter>
        </FilterContainer>
        <Products
          products={displayedProducts}
          filters={cleanFilters(filters)}
          sort={sort}
        />

        <PaginationContainer>
          <PaginationButton
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            &lt;
          </PaginationButton>
          {getPageNumbers().map((pageNumber) => (
            <PaginationButton
              key={pageNumber}
              onClick={() =>
                typeof pageNumber === "number" && setCurrentPage(pageNumber)
              }
              active={pageNumber === currentPage}
            >
              {pageNumber}
            </PaginationButton>
          ))}
          <PaginationButton
            onClick={() => setCurrentPage(currentPage + 1)}
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
