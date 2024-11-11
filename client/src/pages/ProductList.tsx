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

const Container = styled.div``;

const Title = styled.h1`
  margin: 20px;
`;

const FilterContainer = styled.div`
  display: flex;
  justify-content: space-between;
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

const Option = styled.option``;

const ProductList: React.FC = () => {
  const location = useLocation();
  const paths = location.pathname.split("/").slice(2);
  const mainCategory = paths[0]?.toLowerCase();
  const subCategory = paths[1]?.toLowerCase();
  const type = paths[2]?.toLowerCase() || "";

  const [filters, setFilters] = useState<{ [key: string]: string }>({});
  const [sort, setSort] = useState("newest");
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  // Función para actualizar filtros
  const handleFilters = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFilters({
      ...filters,
      [e.target.name]: value,
    });
  };

  useEffect(() => {
    // Obtener productos filtrados por categoría desde la API
    const fetchProducts = async () => {
      try {
        let url = `${baseUrl}/products`;
        if (mainCategory) {
          url += `?category=${mainCategory}`;
        }
        const res = await axios.get(url);
        setProducts(res.data);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };

    fetchProducts();
  }, [mainCategory]);

  useEffect(() => {
    // Filtrar productos en base a las categorías de la URL
    const filtered = products.filter((product) => {
      const categories = product.categories.map((cat) => cat.toLowerCase());
      return (
        categories.includes(mainCategory) &&
        (!subCategory || categories.includes(subCategory)) &&
        (!type || categories.includes(type))
      );
    });

    setFilteredProducts(filtered);
  }, [products, mainCategory, subCategory, type]);

  return (
    <Container>
      <Navbar />
      <Announcement />
      <Title>{`${mainCategory} > ${subCategory} ${
        type ? `> ${type}` : ""
      }`}</Title>
      <FilterContainer>
        <Filter>
          <FilterText>Filtrar Productos:</FilterText>
          <Select name="color" onChange={handleFilters}>
            <Option disabled>Color</Option>
            <Option>Blanco</Option>
            <Option>Negro</Option>
            <Option>Rojo</Option>
            <Option>Azul</Option>
            <Option>Amarillo</Option>
            <Option>Verde</Option>
          </Select>
          <Select name="size" onChange={handleFilters}>
            <Option disabled>Tamaño</Option>
            <Option>36</Option>
            <Option>38</Option>
            <Option>40</Option>
            <Option>42</Option>
            <Option>44</Option>
            <Option>46</Option>
            <Option>48</Option>
            <Option>50</Option>
            <Option>52</Option>
            <Option>54</Option>
            <Option>56</Option>
            <Option>58</Option>
            <Option>60</Option>
            <Option>62</Option>
            <Option>64</Option>
            <Option>66</Option>
            <Option>68</Option>
            <Option>70</Option>
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
        products={filteredProducts} // Pasamos los productos filtrados al componente Products
        filters={filters}
        sort={sort}
      />
      <Newsletter />
    </Container>
  );
};

export default ProductList;
