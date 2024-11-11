import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home";
import ProductList from "./pages/ProductList";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Success from "./pages/Success"; // Asegúrate de importar el componente
import AllProducts from "./pages/AllProducts";

const App: React.FC = () => {
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
        <Route path="/success" element={<Success />} />
        <Route path="/admin" element={<Navigate to="/admin" />} />
      </Routes>
    </Router>
  );
};

export default App;
