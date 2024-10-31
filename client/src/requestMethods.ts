import axios from "axios";

// Agrega el console.log aquí para verificar que `NEXT_PUBLIC_API_URL` esté definido
console.log("API URL:", import.meta.env.VITE_API_URL);

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const user = JSON.parse(localStorage.getItem("persist:root") || "{}")?.user;
const currentUser = user && JSON.parse(user)?.currentUser;
const TOKEN: string | undefined = currentUser?.accessToken;

export const publicRequest = axios.create({
  baseURL: BASE_URL,
});

export const userRequest = axios.create({
  baseURL: BASE_URL,
  headers: { Authorization: `Bearer ${TOKEN}` },
});
