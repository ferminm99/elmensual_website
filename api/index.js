const dotenv = require("dotenv");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
dotenv.config();
const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const productRoute = require("./routes/product");
const cartRoute = require("./routes/cart");
const orderRoute = require("./routes/order");
// const stripeRoute = require("./routes/stripe");
const cors = require("cors");

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
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
  .catch((err) => console.log(err));

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/products", productRoute);
app.use("/api/carts", cartRoute);
app.use("/api/orders", orderRoute);

app.get("/api/check-products", async (req, res) => {
  try {
    const products = await mongoose.connection.db
      .collection("products")
      .find()
      .toArray();
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// app.use("/api/checkout", stripeRoute);

app.listen(process.env.PORT || 5000, () => {
  console.log("Backend server is running");
});
