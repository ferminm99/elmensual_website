// src/types.ts

export interface Product {
  filters: never[];
  _id: string;
  title: string;
  desc: string;
  categories: string[];
  size: string[];
  colors: string[]; // Lista de colores
  images: { [color: string]: string }; // Mapa de color a ruta relativa (/products/...) o URL
  img: string; // Ruta principal relativa o URL
  price: number;
  inStock: boolean;
  totalStock?: number;
  variants?: Array<{
    size: string;
    color: string;
    stock: number;
  }>;
  createdAt: string;
  updatedAt: string;
}
