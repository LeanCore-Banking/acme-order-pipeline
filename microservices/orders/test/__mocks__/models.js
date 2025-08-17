const Order = {
  find: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue([]),
  }),
  findOne: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(null),
  }),
  create: jest.fn().mockResolvedValue({
    order_id: "ORD-2024-123456",
    status: "pending",
  }),
  findByIdAndUpdate: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue({
      order_id: "ORD-2024-123456",
      status: "updated",
    }),
  }),
};

const OrderEvent = {
  create: jest.fn().mockResolvedValue({
    event_id: "evt_123456",
    order_id: "ORD-2024-123456",
  }),
  find: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue([]),
  }),
};

const Product = {
  findOne: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue({
      id: "product123",
      name: "Test Product",
      price: 75.0,
      Inventory: {
        available_quantity: 10,
        reserved_quantity: 2,
      },
    }),
  }),
};

module.exports = {
  Order,
  OrderEvent,
  Product,
};
