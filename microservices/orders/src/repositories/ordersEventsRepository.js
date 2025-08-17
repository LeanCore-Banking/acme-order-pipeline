const OrderEvent = require("../models/orderEvent");

async function createOrderEventRepository(orderData) {
  const order = new OrderEvent(orderData);
  return await order.save();
}

async function getOrderEventByIdRepository(eventId, orderId) {
  return await OrderEvent.findOne({
    event_id: eventId,
    order_id: orderId,
  }).exec();
}

module.exports = {
  createOrderEventRepository,
  getOrderEventByIdRepository,
};
