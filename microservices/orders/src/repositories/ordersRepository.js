const Order = require("../models/order");

async function createOrderRepository(orderData) {
  const order = new Order(orderData);
  return await order.save();
}

async function getOrderByIdRepository(orderId) {
  return await Order.findOne({ order_id: orderId }).exec();
}

async function getOrdersByUserIdRepository(userId) {
  return await Order.find({ "customer.user_id": userId }).exec();
}

module.exports = {
  createOrderRepository,
  getOrderByIdRepository,
  getOrdersByUserIdRepository,
};
