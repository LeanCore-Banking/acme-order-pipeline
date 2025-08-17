const {
  produceEventOrderCreated,
} = require("../kafka/producerEventOrderCreated");
const {
  createOrderRepository,
  getOrderByIdRepository,
  getAllOrdersRepository,
} = require("../repositories/ordersRepository");
const { getProductBySku } = require("../repositories/inventoriesRepository");

async function validateItemsStock(items) {
  await Promise.all(
    items.map(async (item) => {
      const product = await getProductBySku(item.sku);
      if (
        !product ||
        !product.Inventory ||
        product.Inventory.available_quantity == null
      ) {
        throw new Error(`Product with SKU ${item.sku} not found in inventory`);
      }
      if (product.Inventory.available_quantity < item.quantity) {
        throw new Error(
          `Insufficient stock for SKU ${item.sku}: requested ${item.quantity}, available ${product.available_quantity}`
        );
      }
    })
  );
}

async function createOrderService(orderData) {
  await validateItemsStock(orderData.items);
  await produceEventOrderCreated(orderData);
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
  validateItemsStock,
};
