const router = require("express").Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const { verifyToken } = require("./verifyToken");
const { buildOrderPayload } = require("../services/orderBuilder");
const { getPaymentProvider } = require("../services/payments/provider");
const { deductStockForOrder } = require("../services/orderFulfillment");

const mapProductsById = (products = []) =>
  products.reduce(
    (acc, product) => ({ ...acc, [product._id.toString()]: product }),
    {},
  );

const buildBaseUrl = (req, fallback) => {
  const base = fallback || `${req.protocol}://${req.get("host")}`;
  return base.endsWith("/") ? base.slice(0, -1) : base;
};

const normalizeStatus = (status) => {
  const normalized = String(status || "pending").toLowerCase();
  if (["approved", "paid", "completed"].includes(normalized)) return "approved";
  if (["rejected", "cancelled", "cancelado", "refunded"].includes(normalized)) {
    return "failed";
  }
  return "pending";
};

router.post("/checkout", verifyToken, async (req, res) => {
  try {
    const items = Array.isArray(req.body.items) ? req.body.items : [];

    if (!items.length) {
      return res.status(400).json("La orden debe incluir al menos un ítem.");
    }

    const productIds = items.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });
    const productsMap = mapProductsById(products);
    const { items: normalizedItems, subtotal } = buildOrderPayload(
      items,
      productsMap,
    );

    const newOrder = new Order({
      userId: req.user.id,
      items: normalizedItems,
      subtotal,
      status: "pending",
      paymentMetadata: { ...req.body.paymentMetadata, provider: "mercadopago" },
      shippingAddress: req.body.shippingAddress,
    });

    await newOrder.save();

    const provider = getPaymentProvider("mercadopago");
    if (!provider) {
      return res.status(503).json("Proveedor de pago no disponible");
    }

    const webhookBase = buildBaseUrl(req, process.env.WEBHOOK_BASE_URL);
    const frontendBase =
      process.env.FRONTEND_BASE_URL || "http://localhost:5173";

    const backUrls = {
      success: `${frontendBase}/checkout/result?orderId=${newOrder._id}&status=approved`,
      pending: `${frontendBase}/checkout/result?orderId=${newOrder._id}&status=pending`,
      failure: `${frontendBase}/checkout/result?orderId=${newOrder._id}&status=failed`,
    };

    const notificationUrl = `${webhookBase}/api/webhooks/mercadopago?orderId=${newOrder._id}`;

    const { paymentId, checkoutUrl, raw } = await provider.createPaymentIntent({
      order: newOrder,
      items: normalizedItems,
      backUrls,
      notificationUrl,
    });

    newOrder.paymentMetadata = {
      ...newOrder.paymentMetadata,
      paymentId,
      checkoutUrl,
      backUrls,
      notificationUrl,
      providerResponse: raw,
    };

    await newOrder.save();

    return res.status(201).json({
      orderId: newOrder._id,
      paymentId,
      checkoutUrl,
    });
  } catch (err) {
    console.error("Error en checkout:", err);
    res.status(400).json(err.message || "No se pudo iniciar el pago");
  }
});

router.post("/webhooks/:provider", async (req, res) => {
  const provider = getPaymentProvider(req.params.provider || "");
  if (!provider) {
    return res.status(404).json("Proveedor no soportado");
  }

  try {
    if (!provider.validateWebhook(req)) {
      return res.status(400).json("Firma inválida");
    }

    const orderId =
      req.query.orderId || req.body?.orderId || req.body?.data?.id;
    if (!orderId) {
      return res.status(400).json("orderId requerido");
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json("Orden no encontrada");
    }

    const paymentId = order.paymentMetadata?.paymentId;
    const { status, raw } = await provider.getPaymentStatus({
      paymentId,
      externalReference: orderId,
    });

    const normalizedStatus = normalizeStatus(status);
    const nextMetadata = {
      ...order.paymentMetadata,
      providerStatus: status,
      lastWebhookAt: new Date().toISOString(),
      providerPayload: raw,
    };

    if (
      normalizedStatus === "approved" &&
      !order.paymentMetadata?.stockDeducted
    ) {
      await deductStockForOrder(order);
      nextMetadata.stockDeducted = true;
    }

    order.status = normalizedStatus;
    order.paymentMetadata = nextMetadata;
    await order.save();

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Error en webhook:", err);
    res.status(500).json(err.message || "Error interno");
  }
});

module.exports = router;
