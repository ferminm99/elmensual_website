import React from "react";
import Sidebar from "./components/sidebar/Sidebar";
import Topbar from "./components/topbar/Topbar";
import "./App.css";
import Home from "./pages/home/Home";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import UserList from "./pages/userList/UserList";
import User from "./pages/user/User";
import NewUser from "./pages/newUser/NewUser";
import ProductList from "./pages/productList/ProductList";
import Product from "./pages/product/Product";
import NewProduct from "./pages/newProduct/NewProduct";
import Login from "./pages/login/Login";
import { useSelector } from "react-redux";
import { RootState } from "./redux/store"; // Asegúrate de que RootState esté bien definido

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div>
    <Topbar />
    <div className="container">
      <Sidebar />
      {children}
    </div>
  </div>
);

const App: React.FC = () => {
  const admin = useSelector(
    (state: RootState) => state.user.currentUser?.isAdmin
  );
  console.log("Estado de admin en App:", admin);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas solo para admin */}
        {admin ? (
          <>
            <Route
              path="/"
              element={
                <AdminLayout>
                  <Home />
                </AdminLayout>
              }
            />
            <Route
              path="/users"
              element={
                <AdminLayout>
                  <UserList />
                </AdminLayout>
              }
            />
            <Route
              path="/user/:userId"
              element={
                <AdminLayout>
                  <User />
                </AdminLayout>
              }
            />
            <Route
              path="/newUser"
              element={
                <AdminLayout>
                  <NewUser />
                </AdminLayout>
              }
            />
            <Route
              path="/products"
              element={
                <AdminLayout>
                  <ProductList />
                </AdminLayout>
              }
            />
            <Route
              path="/product/:productId"
              element={
                <AdminLayout>
                  <Product />
                </AdminLayout>
              }
            />
            <Route
              path="/newproduct"
              element={
                <AdminLayout>
                  <NewProduct />
                </AdminLayout>
              }
            />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </Router>
  );
};

export default App;
