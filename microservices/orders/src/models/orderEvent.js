const mongoose = require("mongoose");

const OrderEventSchema = mongoose.Schema({
  event_id: { type: String, unique: true },
  order_id: String,
  event_type: String,
  timestamp: { type: Date, default: Date.now },
});

const OrderEvent = mongoose.model("OrderEvent", OrderEventSchema);

module.exports = OrderEvent;
