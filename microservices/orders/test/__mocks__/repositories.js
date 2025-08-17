const createOrderRepository = jest.fn().mockResolvedValue({
  order_id: "ORD-2024-123456",
  status: "pending",
});

const getOrderByIdRepository = jest.fn().mockResolvedValue({
  order_id: "ORD-2024-123456",
  status: "pending",
  items: [],
  customer: {},
});

const getOrdersByUserIdRepository = jest.fn().mockResolvedValue([
  {
    order_id: "ORD-2024-123456",
    status: "pending",
  },
]);

const updateOrderByIdRepository = jest.fn().mockResolvedValue(true);

const getProductBySku = jest.fn().mockResolvedValue({
  id: "product123",
  name: "Test Product",
  price: 75.0,
  Inventory: {
    available_quantity: 10,
    reserved_quantity: 2,
  },
});

const createOrderEventRepository = jest.fn().mockResolvedValue(true);
const getOrderEventsByOrderIdRepository = jest.fn().mockResolvedValue([]);

module.exports = {
  createOrderRepository,
  getOrderByIdRepository,
  getOrdersByUserIdRepository,
  updateOrderByIdRepository,
  getProductBySku,
  createOrderEventRepository,
  getOrderEventsByOrderIdRepository,
};

module.exports.ordersRepository = {
  createOrderRepository,
  getOrderByIdRepository,
  getOrdersByUserIdRepository,
  updateOrderByIdRepository,
};

module.exports.inventoriesRepository = {
  getProductBySku,
};
