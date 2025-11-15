import axios from "axios";
import { store } from "./redux/store";
import { logout } from "./redux/userRedux";

const BASE_URL = "https://elmensualwebsite-production.up.railway.app/api";

export const publicRequest = axios.create({
  baseURL: BASE_URL,
});

export const userRequest = axios.create({
  baseURL: BASE_URL,
});

// Función para obtener el token actualizado desde localStorage
function getToken() {
  const tokenData = JSON.parse(
    localStorage.getItem("persist:root") || "{}"
  )?.user;
  const currentUser = tokenData ? JSON.parse(tokenData)?.currentUser : null;
  return currentUser ? currentUser.accessToken : "";
}

// Configurar el token dinámicamente en cada solicitud de `userRequest`
userRequest.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar la expiración del token en userRequest
userRequest.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 403) {
      // Si recibimos un error 403, deslogueamos al usuario y redirigimos a login
      store.dispatch(logout());
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
