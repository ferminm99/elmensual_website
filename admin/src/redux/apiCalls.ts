import { loginFailure, loginStart, loginSuccess } from "./userRedux";
import { publicRequest, userRequest } from "../requestMethods";
import {
  getProductFailure,
  getProductStart,
  getProductSuccess,
  deleteProductFailure,
  deleteProductStart,
  deleteProductSuccess,
  updateProductFailure,
  updateProductStart,
  updateProductSuccess,
  addProductFailure,
  addProductStart,
  addProductSuccess,
} from "./productRedux";
import { Dispatch } from "@reduxjs/toolkit";

interface User {
  username: string;
  password: string;
}

interface NewProduct extends Omit<Product, "_id"> {}
// Interfaz para producto completo, todas las propiedades son requeridas
interface Product {
  _id: string;
  title: string;
  desc: string;
  categories: string[];
  size: string[];
  colors: string[]; // Lista de colores
  images: { [color: string]: string }; // Mapa de color a URL de imagen
  img: string;
  price: number;
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export const login = async (dispatch: Dispatch, user: User) => {
  dispatch(loginStart());
  try {
    const res = await publicRequest.post("/auth/login", user);

    console.log("Datos de respuesta del login:", res.data);
    dispatch(loginSuccess(res.data));
  } catch (err) {
    dispatch(loginFailure());
  }
};

export const getProducts = async (dispatch: Dispatch) => {
  dispatch(getProductStart());
  try {
    const res = await userRequest.get("/products");
    dispatch(getProductSuccess(res.data));
  } catch (err) {
    dispatch(getProductFailure());
  }
};

export const deleteProduct = async (id: string, dispatch: Dispatch) => {
  dispatch(deleteProductStart());
  try {
    const res = await userRequest.delete(`/products/${id}`);
    dispatch(deleteProductSuccess(id));
  } catch (err) {
    dispatch(deleteProductFailure());
  }
};

export const updateProduct = async (
  id: string,
  product: Product,
  dispatch: Dispatch
) => {
  dispatch(updateProductStart());
  try {
    // update
    dispatch(updateProductSuccess({ id, product }));
  } catch (err) {
    dispatch(updateProductFailure());
  }
};

export const addProduct = async (product: any, dispatch: Dispatch) => {
  dispatch(addProductStart());
  try {
    console.log("Datos del producto que se van a enviar:", product); // Añadir este log
    const res = await userRequest.post("/products", product);
    console.log(res);
    dispatch(addProductSuccess(res.data));
    getProducts(dispatch);
    alert("Product added successfully!");
  } catch (err) {
    console.error("Error al agregar el producto:", err); // Añadir este log
    dispatch(addProductFailure());
  }
};
