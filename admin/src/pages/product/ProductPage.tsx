import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Product from "./Product"; // Ajusta esta ruta según tu estructura de archivos

const ProductPage: React.FC = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <Product />
    </DndProvider>
  );
};

export default ProductPage;
