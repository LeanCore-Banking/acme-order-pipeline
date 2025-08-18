const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  product_id: { type: String, required: true },
  sku: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

const CustomerSchema = new mongoose.Schema({
  user_id: { type: String, required: true },
  email: { type: String, required: true },
});

const PaymentSchema = new mongoose.Schema({
  status: { type: String, required: true },
  transaction_id: { type: String },
  processed_at: { type: Date },
});

const PricingSchema = new mongoose.Schema({
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  total: { type: Number, required: true },
});

const OrderSchema = new mongoose.Schema({
  order_id: { type: String, required: true, unique: true, index: true },
  customer: CustomerSchema,
  items: [ItemSchema],
  pricing: PricingSchema,
  payment: PaymentSchema,
  status: { type: String, index: true },
  created_at: { type: Date, default: Date.now, index: -1 },
  updated_at: { type: Date, default: Date.now },
});

const Order = mongoose.model("Order", OrderSchema);

module.exports = Order;
