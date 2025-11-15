const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const crypto = require("crypto");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");

// === RUTAS ===
const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const productRoute = require("./routes/product");
const cartRoute = require("./routes/cart");
const orderRoute = require("./routes/order");

// (Render suele estar detrás de proxy)
app.set("trust proxy", 1);

// ---------- CORS: a prueba de balas ----------
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5000",
  "http://127.0.0.1:3000",
  "https://elmensual-website.onrender.com",
  "https://elmensualwebsite-production.up.railway.app",
  // agrega aquí otros frontends que uses (Vercel, etc.)
];

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true); // curl, healthchecks
      return cb(null, ALLOWED_ORIGINS.includes(origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
    ],
    exposedHeaders: ["Content-Length"],
  })
);

// Responder explícito a TODOS los preflight
app.options("*", (req, res) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
  }
  res.header("Vary", "Origin");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  return res.sendStatus(204);
});

// Refuerzo de headers CORS en cualquier respuesta (incluye errores)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
  }
  res.header("Vary", "Origin");
  next();
});

// Body parser
app.use(express.json());

// ---------- STATIC (si servís el build aquí) ----------
app.use(express.static(path.join(__dirname, "build")));

// ---------- API ----------
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/carts", cartRoute);
app.use("/api/orders", orderRoute);

// ---------- CLOUDINARY ----------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.get("/generate-signature", (req, res) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
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

// ---------- DB ----------
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

// ---------- SPA fallback ----------
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// ---------- START ----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server is running on :${PORT}`);
});
