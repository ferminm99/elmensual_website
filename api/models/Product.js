// models/Product.js
const mongoose = require("mongoose");

const VariantSchema = new mongoose.Schema(
  {
    size: { type: String },
    color: { type: String },
    stock: { type: Number, default: 0, min: 0 },
  },
  { _id: true }
);

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, unique: true },
    desc: { type: String, required: true },
    categories: { type: Array },
    size: { type: Array },
    colors: { type: Array }, // Lista de colores
    variants: { type: [VariantSchema], default: [] },
    totalStock: { type: Number, default: 0 },
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
