// models/Product.js
const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    desc: { type: String, required: true },
    categories: { type: Array },
    size: { type: Array },
    colors: { type: Array }, // Lista de colores
    images: {
      type: Map,
      of: String, // Mapa de color a URL de imagen
      default: {},
    },
    img: { type: String }, // Imagen principal
    price: { type: Number, required: true },
    inStock: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
