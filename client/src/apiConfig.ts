// En dev usa localhost:5000; en prod usa la URL que corresponda a TU backend real
const baseUrl = import.meta.env.PROD
  ? "https://elmensualwebsite-production.up.railway.app/api" // <-- si ESTE es tu backend real
  : import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default baseUrl;
