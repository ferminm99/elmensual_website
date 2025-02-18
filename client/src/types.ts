// src/types.ts

export interface Product {
  filters: never[];
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
