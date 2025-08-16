jest.mock("../../src/models/order", () => {
  return jest.fn().mockImplementation(() => ({
    save: jest.fn(),
  }));
});

const Order = require("../../src/models/order");

const {
  createOrderRepository,
  getOrderByIdRepository,
  getAllOrdersRepository,
} = require("../../src/repositories/ordersRepository");

describe("ordersRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createOrderRepository", () => {
    it("should create and save a new order", async () => {
      const mockSave = jest.fn().mockResolvedValue("savedOrder");
      Order.mockImplementation(() => ({
        save: mockSave,
      }));

      const orderData = { order_id: "ORD001" };
      const result = await createOrderRepository(orderData);

      expect(Order).toHaveBeenCalledWith(orderData);
      expect(mockSave).toHaveBeenCalled();
      expect(result).toBe("savedOrder");
    });
  });

  describe("getOrderByIdRepository", () => {
    it("should find order by order_id", async () => {
      const execMock = jest.fn().mockResolvedValue("orderFound");
      const findOneMock = jest.fn(() => ({ exec: execMock }));
      Order.findOne = findOneMock;

      const orderId = "ORD001";
      const result = await getOrderByIdRepository(orderId);

      expect(findOneMock).toHaveBeenCalledWith({ order_id: orderId });
      expect(execMock).toHaveBeenCalled();
      expect(result).toBe("orderFound");
    });
  });

  describe("getAllOrdersRepository", () => {
    it("should find all orders", async () => {
      const execMock = jest.fn().mockResolvedValue(["order1", "order2"]);
      const findMock = jest.fn(() => ({ exec: execMock }));
      Order.find = findMock;

      const result = await getAllOrdersRepository();

      expect(findMock).toHaveBeenCalledWith({});
      expect(execMock).toHaveBeenCalled();
      expect(result).toEqual(["order1", "order2"]);
    });
  });
});
