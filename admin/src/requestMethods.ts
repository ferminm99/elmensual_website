import axios from "axios";

const BASE_URL = "https://elmensual-website.onrender.com/api";

const tokenData = JSON.parse(
  localStorage.getItem("persist:root") || "{}"
)?.user;
const currentUser = tokenData ? JSON.parse(tokenData)?.currentUser : null;
const TOKEN = currentUser ? currentUser.accessToken : "";

export const publicRequest = axios.create({
  baseURL: BASE_URL,
});

export const userRequest = axios.create({
  baseURL: BASE_URL,
  headers: { Authorization: `Bearer ${TOKEN}` },
});
