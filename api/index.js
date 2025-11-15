const dotenv = require("dotenv");
const express = require("express");
const crypto = require("crypto");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const cloudinary = require("cloudinary").v2;

dotenv.config();
const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const productRoute = require("./routes/product");
const cartRoute = require("./routes/cart");
const orderRoute = require("./routes/order");
const cors = require("cors");

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:5000",
    "https://elmensual-website.onrender.com",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Configuración de CORS
app.use(cors(corsOptions));
app.use(express.json());

// Servir archivos estáticos del frontend (carpeta build)
app.use(express.static(path.join(__dirname, "build")));

// Rutas de API
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/carts", cartRoute);
app.use("/api/orders", orderRoute);

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Ruta para generar la firma de Cloudinary
app.get("/generate-signature", (req, res) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const paramsToSign = `format=png&timestamp=${timestamp}`;
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, format: "png" },
    process.env.CLOUDINARY_API_SECRET
  );

  res.json({
    signature,
    timestamp,
    api_key: process.env.CLOUDINARY_API_KEY,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  });
});

// Conexión a MongoDB
const mongoURI =
  process.env.NODE_ENV === "production"
    ? process.env.MONGODB_URI
    : process.env.MONGO_URL;

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("DB Connection successful!");
    mongoose.connection.db.listCollections().toArray((err, collections) => {
      if (err) console.error("Error fetching collections:", err);
      else console.log("Collections in database:", collections);
    });
  })
  .catch((err) => console.log("DB Connection error:", err));

// Redirección de rutas desconocidas al index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Iniciar el servidor
app.listen(process.env.PORT || 5000, () => {
  console.log("Backend server is running");
});
