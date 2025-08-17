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

module.exports = {
  createOrderRepository,
  getOrderByIdRepository,
  getOrdersByUserIdRepository,
  updateOrderByIdRepository,
};
