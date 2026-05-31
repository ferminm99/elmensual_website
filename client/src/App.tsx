import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home";
import AcercaDe from "./pages/AboutUs";
import ProductList from "./pages/ProductList";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CheckoutResult from "./pages/CheckoutResult";
import AllProducts from "./pages/AllProducts";
import "./App.css";

const App: React.FC = () => {
  useEffect(() => {
    document.title = "El Mensual"; // Cambia según el contenido
  }, []);
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products/:mainCategory" element={<ProductList />} />
        <Route
          path="/products/:mainCategory/:subCategory/:type"
          element={<ProductList />}
        />
        <Route
          path="/products/:mainCategory/:subCategory"
          element={<ProductList />}
        />
        <Route path="/product/:id" element={<Product />} />
        <Route path="/all-products" element={<AllProducts />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/checkout/result" element={<CheckoutResult />} />
        <Route path="/success" element={<CheckoutResult />} />
        <Route path="/acercade" element={<AcercaDe />} />
        <Route path="/admin" element={<Navigate to="/admin" />} />
      </Routes>
    </Router>
  );
};

export default App;
