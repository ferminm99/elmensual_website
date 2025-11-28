const Product = require("../models/Product");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("./verifyToken");
const {
  computeTotalStock,
  findVariant,
  formatProductResponse,
  normalizeVariants,
  toSafeNumber,
} = require("../services/productStock");

const router = require("express").Router();

// router.post("/", verifyTokenAndAdmin, async (req, res) => {
router.post("/", async (req, res) => {
  console.log("Datos recibidos en el servidor:", req.body); // Asegúrate de que ves esto en la consola

  try {
    const payload = normalizeVariants(req.body);
    const newProduct = new Product(payload);
    const savedProduct = await newProduct.save();
    res.status(200).json(formatProductResponse(savedProduct));
  } catch (err) {
    console.error("Error al guardar el producto:", err);
    res.status(500).json(err);
  }
});

//UPDATE
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json("Product not found");
    }

    const mergedPayload = {
      ...product.toObject({ flattenMaps: true }),
      ...req.body,
    };

    const normalized = normalizeVariants(mergedPayload, product.variants || []);
    product.set(normalized);
    await product.save();

    res.status(200).json(formatProductResponse(product));
  } catch (err) {
    res.status(500).json(err);
  }
});

router.patch("/:id/variants/stock", verifyTokenAndAdmin, async (req, res) => {
  const { variantId, size, color, stock } = req.body;

  if (stock === undefined || stock === null) {
    return res.status(400).json("Stock value is required");
  }

  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json("Product not found");
    }

    const { variant, index } = findVariant(product.variants || [], {
      variantId,
      size,
      color,
    });

    if (index === -1 || !variant) {
      return res.status(404).json("Variant not found");
    }

    product.variants[index].stock = toSafeNumber(stock);
    product.totalStock = computeTotalStock(product.variants);
    product.inStock = product.totalStock > 0;

    const savedProduct = await product.save();
    res.status(200).json(formatProductResponse(savedProduct));
  } catch (err) {
    console.error("Error updating variant stock:", err);
    res.status(500).json(err);
  }
});

//DELETE
router.delete("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json("Product has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET PRODUCT
router.get("/find/:id", async (req, res) => {
  const productId = req.params.id;

  try {
    const product = await Product.findById(productId);
    if (!product) {
      console.log("Product not found"); // Log si no encuentra el producto
      return res.status(404).json("Product not found");
    }
    res.status(200).json(formatProductResponse(product));
  } catch (error) {
    console.error("Error fetching product:", error); // Log del error
    res.status(500).json(error);
  }
});

//GET ALL PRODUCTS
router.get("/", async (req, res) => {
  const qNew = req.query.new;
  const qCategory = req.query.category;
  const sizeFilter = req.query.size;
  const colorFilter = req.query.color;

  try {
    let products;

    if (qNew) {
      products = await Product.find().sort({ createdAt: -1 }).limit(1);
    } else if (qCategory) {
      products = await Product.find({
        categories: {
          $in: [qCategory],
        },
      });
    } else {
      products = await Product.find();
    }

    const formatted = products
      .map((product) =>
        formatProductResponse(product, {
          size: sizeFilter,
          color: colorFilter,
        })
      )
      .filter((product) => {
        if (sizeFilter || colorFilter) {
          return (product.variants || []).length > 0;
        }
        return true;
      });

    res.status(200).json(formatted);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;