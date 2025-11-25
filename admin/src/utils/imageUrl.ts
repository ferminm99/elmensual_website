const apiBase = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
const defaultAssetsBase = apiBase.endsWith("/api")
  ? apiBase.replace(/\/api$/, "")
  : apiBase;

const ASSETS_BASE_URL =
  process.env.REACT_APP_ASSETS_BASE_URL || defaultAssetsBase || "";

export const resolveImageUrl = (value: string | undefined | null) => {
  if (!value) return "";
  if (value.startsWith("http")) return value;
  if (value.startsWith("/")) return `${ASSETS_BASE_URL}${value}`;
  return `${ASSETS_BASE_URL}/${value}`;
};
