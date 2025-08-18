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

async function updateOrderByIdRepository(orderId, status) {
  try {
    const existingOrder = await Order.findOne({ order_id: orderId }).exec();
    if (!existingOrder) {
      return { modifiedCount: 0, matchedCount: 0 };
    }
    const result = await Order.updateOne(
      { order_id: orderId },
      { $set: { status, updated_at: new Date().toISOString() } }
    );
    return result;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createOrderRepository,
  getOrderByIdRepository,
  getOrdersByUserIdRepository,
  updateOrderByIdRepository,
};
