const {
  produceEventOrderConfirmed,
} = require("../kafka/producerEventOrderConfirmed");
const {
  produceEventOrderFailed,
} = require("../kafka/producerEventOrderFailed");
const {
  getInventoryProductBySku,
  getAllProducts,
  increseReservedQuantityByProductId,
} = require("../repositories/inventoriesRepository");
const { FailureReason } = require("../kafka/order_events_pb");

async function validateItemsStock(items) {
  let error_message = "";
  let failure_reason = 0;
  await Promise.all(
    items.map(async (item) => {
      const product = await getInventoryProductBySku(item.sku);
      if (
        !product ||
        !product.Inventory ||
        product.Inventory.available_quantity == null
      ) {
        produceEventOrderFailed();
        error_message = `Product with SKU ${item.sku} not found in inventory`;
        failure_reason = FailureReason.INVALID_PRODUCT;
      }
      if (
        product.Inventory.available_quantity -
          product.Inventory.reserved_quantity <
        item.quantity
      ) {
        error_message = `Insufficient stock for SKU ${item.sku}: requested ${item.quantity}, available ${product.Inventory.available_quantity}`;
        failure_reason = FailureReason.INSUFFICIENT_INVENTORY;
      }
    })
  );
  return { error_message, failure_reason };
}

async function processEventOrderCreated(orderData) {
  const { error_message, failure_reason } = await validateItemsStock(
    orderData.items
  );
  if (error_message) {
    await produceEventOrderFailed(orderData, failure_reason, error_message);
  } else {
    const items = orderData.items;
    for (const item of items) {
      await increseReservedQuantityByProductId(item.product_id, item.quantity);
    }
    await produceEventOrderConfirmed(orderData);
  }
}

async function getInventoryProductBySkuService(sku) {
  const productData = await getInventoryProductBySku(sku);
  if (!productData) return null;
  return productData;
}

async function getAllInventoryProductsService() {
  const productData = await getAllProducts();
  if (!productData) return null;
  return productData;
}

module.exports = {
  getInventoryProductBySkuService,
  getAllInventoryProductsService,
  processEventOrderCreated,
};
