const mongoose = require("mongoose");

const OrderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true },
    title: { type: String },
    size: { type: String },
    color: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    items: { type: [OrderItemSchema], default: [] },
    subtotal: { type: Number, required: true },
    status: { type: String, default: "pending" },
    paymentMetadata: { type: Object, default: {} },
    shippingAddress: { type: Object },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
