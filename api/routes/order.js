const Order = require("../models/Order");
const Product = require("../models/Product");
const { findVariant } = require("../services/productStock");
const { verifyToken, verifyTokenAndAdmin } = require("./verifyToken");

const router = require("express").Router();

const buildOrderPayload = (items = [], productsMap = {}) => {
  let subtotal = 0;
  const normalizedItems = items.map((item) => {
    const product = productsMap[String(item.productId)];
    if (!product) {
      throw new Error(`Producto no encontrado: ${item.productId}`);
    }

    const { variant } = findVariant(product.variants || [], {
      size: item.size,
      color: item.color,
    });

    if (!variant) {
      throw new Error(
        `Variante no disponible para el producto ${item.productId}`
      );
    }

    const stock = Number(variant.stock ?? 0);

    if (stock < item.quantity) {
      throw new Error(
        `Stock insuficiente para ${item.productId} (${item.size || ""}/${
          item.color || ""
        })`
      );
    }

    const price = product.price;
    const quantity = Number(item.quantity) || 0;

    if (quantity <= 0) {
      throw new Error("La cantidad debe ser mayor a cero");
    }
    subtotal += price * quantity;

    return {
      productId: item.productId,
      size: item.size,
      color: item.color,
      quantity,
      price,
    };
  });

  return { items: normalizedItems, subtotal };
};

// CREATE
router.post("/", verifyToken, async (req, res) => {
  try {
    const payloadItems = Array.isArray(req.body.items) ? req.body.items : [];

    if (payloadItems.length === 0) {
      return res.status(400).json("La orden debe incluir al menos un ítem.");
    }

    const productIds = payloadItems.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    const productsMap = products.reduce((map, product) => {
      const id = product._id.toString();
      return { ...map, [id]: product };
    }, {});

    const { items, subtotal } = buildOrderPayload(payloadItems, productsMap);

    const newOrder = new Order({
      userId: req.user.id,
      items,
      subtotal,
      status: "pending",
      paymentMetadata: req.body.paymentMetadata || {},
      shippingAddress: req.body.shippingAddress,
    });

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    console.error("Error al crear orden:", err);
    res.status(400).json(err.message || "No se pudo crear la orden");
  }
});

// UPDATE STATUS / METADATA
router.put("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET MONTHLY INCOME
router.get("/income", verifyTokenAndAdmin, async (req, res) => {
  const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));

  try {
    const income = await Order.aggregate([
      { $match: { createdAt: { $gte: previousMonth } } },
      {
        $project: {
          month: { $month: "$createdAt" },
          sales: "$subtotal",
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$sales" },
        },
      },
    ]);
    res.status(200).json(income);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET ORDER BY ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json("Orden no encontrada");
    }

    if (!req.user.isAdmin && order.userId !== req.user.id) {
      return res.status(403).json("No estás autorizado a ver esta orden");
    }

    res.status(200).json(order);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET ORDERS (ADMIN: todas, USER: propias)
router.get("/", verifyToken, async (req, res) => {
  try {
    const filter = req.user.isAdmin ? {} : { userId: req.user.id };
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
