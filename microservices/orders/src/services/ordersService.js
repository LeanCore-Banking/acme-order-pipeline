const {
  produceEventOrderCreated,
} = require("../kafka/producerEventOrderCreated");
const {
  createOrderRepository,
  getOrderByIdRepository,
  getOrdersByUserIdRepository,
  updateOrderByIdRepository,
} = require("../repositories/ordersRepository");
const { getProductBySku } = require("../repositories/inventoriesRepository");
const {
  buildOrderId,
  buildTransactionId,
} = require("../utils/generateRandoms");
const {
  produceEventOrderFailed,
} = require("../kafka/producerEventOrderFailed");

async function validateItemsStock(items) {
  const results = await Promise.all(
    items.map(async (item) => {
      const product = await getProductBySku(item.sku);
      if (
        !product ||
        !product.Inventory ||
        product.Inventory.available_quantity == null
      ) {
        throw new Error(`Product with SKU ${item.sku} not found in inventory`);
      }
      if (
        product.Inventory.available_quantity -
          product.Inventory.reserved_quantity <
        item.quantity
      ) {
        throw new Error(
          `Insufficient stock for SKU ${item.sku}: requested ${item.quantity}, available ${product.Inventory.available_quantity}`
        );
      }
      return {
        ...item,
        product_id: product.id,
        price: product.price,
        name: product.name,
      };
    })
  );
  return results;
}

function applyRandomPercent(num) {
  const percent = Math.floor(Math.random() * 10) + 1;
  const result = num * (percent / 100);
  return result;
}

function getPricing(items) {
  const subtotal = items.reduce((acc, cur) => {
    return (acc += cur.quantity * cur.price);
  }, 0);
  const tax = applyRandomPercent(subtotal);
  const total = subtotal + tax;
  return {
    subtotal: subtotal.toFixed(2),
    tax: tax.toFixed(2),
    total: total.toFixed(2),
  };
}

function getRandomPaymentStatus() {
  const random = Math.random();
  if (random < 0.7) {
    return "completed";
  } else {
    return "failed";
  }
}

function getPayment() {
  return {
    status: getRandomPaymentStatus(),
    transaction_id: buildTransactionId(),
  };
}

function validatePayment(payment) {
  return payment.status === "completed";
}

async function createOrderService(orderData) {
  const items = await validateItemsStock(orderData.items);
  const pricing = getPricing(items);
  const payment = getPayment();
  const order = {
    ...orderData,
    order_id: buildOrderId(),
    status: "pending",
    items,
    pricing,
    payment,
    created_at: new Date().toISOString(),
  };
  const continueProcess = validatePayment(payment);
  if (!continueProcess) {
    await produceEventOrderFailed(order, "Payment failed");
    return {
      order_id: order.order_id,
      status: "failed",
      message: "Order failed on payment processing",
      created_at: order.created_at,
    };
  }
  await produceEventOrderCreated(order);
  const savedOrder = await createOrderRepository(order);
  return {
    order_id: savedOrder.order_id,
    status: savedOrder.status,
    message: "Order created successfully and queued for processing",
    estimated_total: pricing.total,
    created_at: savedOrder.created_at,
  };
}

async function getOrderByIdService(orderId) {
  return await getOrderByIdRepository(orderId);
}

async function getOrdersByUserIdService(userId) {
  return await getOrdersByUserIdRepository(userId);
}

async function processEventOrder(orderData, type) {
  await updateOrderByIdRepository(
    orderData.order_id,
    type === "confirmed" ? "completed" : "failed"
  );
}

module.exports = {
  createOrderService,
  getOrderByIdService,
  getOrdersByUserIdService,
  validateItemsStock,
  processEventOrder,
  applyRandomPercent,
  getPricing,
  getRandomPaymentStatus,
  getPayment,
  validatePayment,
};
