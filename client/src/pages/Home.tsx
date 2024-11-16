import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Announcement from "../components/Announcement";
import Slider from "../components/Slider";
import Categories from "../components/Categories";
import Products from "../components/Products";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";
import axios from "axios";
import baseUrl from "../apiConfig";
import { Product } from "../types";

const Home = () => {
  const [defaultProducts, setDefaultProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchDefaultProducts = async () => {
      try {
        const res = await axios.get(`${baseUrl}/products?category=bombachas`);
        const bombachaProducts = res.data.slice(0, 12);
        console.log("Productos con categoría 'bombacha':", bombachaProducts);
        setDefaultProducts(bombachaProducts);
      } catch (err) {
        console.error("Error fetching default products:", err);
      }
    };

    fetchDefaultProducts();
  }, []);

  return (
    <div>
      <Announcement />
      <Navbar />
      <Slider />
      <Categories />
      <Products products={defaultProducts} />{" "}
      {/* Pasamos los productos como prop */}
      <Newsletter />
      <Footer />
    </div>
  );
};

export default Home;
