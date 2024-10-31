import axios from "axios";

const BASE_URL = "http://localhost:5000/api";
// const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
// Define el tipo de TOKEN (puede ser string o undefined)
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
