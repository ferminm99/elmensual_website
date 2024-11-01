const dotenv = require("dotenv");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path"); // Agregar esta línea
dotenv.config();
const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const productRoute = require("./routes/product");
const cartRoute = require("./routes/cart");
const orderRoute = require("./routes/order");
const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/carts", cartRoute);
app.use("/api/orders", orderRoute);
// Redirige todas las rutas no especificadas al dashboard de administración
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:5000",
    "https://elmensual-website.onrender.com/api",
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  responseHeader: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// Selecciona el URI según el entorno
const mongoURI =
  process.env.NODE_ENV === "production"
    ? process.env.MONGODB_URI // URI para producción
    : process.env.MONGO_URL; // URI para desarrollo/local

mongoose
  .connect(mongoURI)
  .then(() => {
    console.log("DB Connection successful!");

    // Prueba de conexión a la base de datos
    mongoose.connection.db.listCollections().toArray((err, collections) => {
      if (err) {
        console.error("Error fetching collections:", err);
      } else {
        console.log("Collections in database:", collections);
      }
    });
  })
  .catch((err) => console.log("DB Connection error:", err));

// const cloudinary = require("cloudinary").v2;
// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// app.post("/api/upload", (req, res) => {
//   const file = req.files.file; // Asume que estás usando algún middleware como express-fileupload o multer

//   cloudinary.uploader.upload(file.tempFilePath, (error, result) => {
//     if (error) return res.status(500).json({ error });
//     return res.status(200).json({ url: result.secure_url });
//   });
// });

app.listen(process.env.PORT || 5000, () => {
  console.log("Backend server is running");
});
