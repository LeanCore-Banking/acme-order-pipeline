const {
  createOrderRepository,
  getOrderByIdRepository,
  getAllOrdersRepository,
} = require("../repositories/ordersRepository");

async function createOrderService(orderData) {
  return await createOrderRepository(orderData);
}

async function getOrderByIdService(orderId) {
  return await getOrderByIdRepository(orderId);
}

async function getAllOrdersService() {
  return await getAllOrdersRepository();
}

module.exports = {
  createOrderService,
  getOrderByIdService,
  getAllOrdersService,
};
