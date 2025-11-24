export const normalizeProductImageUrl = (url?: string | null): string => {
  if (!url) return "";
  const value = url.trim();

  if (value.startsWith("http") || value.startsWith("/")) {
    return value;
  }

  return `/${value}`;
};
