jest.mock("../../src/repositories/ordersRepository", () => ({
  createOrderRepository: jest.fn(),
  getOrderByIdRepository: jest.fn(),
  getAllOrdersRepository: jest.fn(),
}));

const {
  createOrderRepository,
  getOrderByIdRepository,
  getAllOrdersRepository,
} = require("../../src/repositories/ordersRepository");

const {
  createOrderService,
  getOrderByIdService,
  getAllOrdersService,
} = require("../../src/services/ordersService");

describe("ordersService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createOrderService", () => {
    it("should call createOrderRepository and return result", async () => {
      const mockOrder = { order_id: "ORD001" };
      createOrderRepository.mockResolvedValue(mockOrder);

      const result = await createOrderService(mockOrder);

      expect(createOrderRepository).toHaveBeenCalledWith(mockOrder);
      expect(result).toBe(mockOrder);
    });
  });

  describe("getOrderByIdService", () => {
    it("should call getOrderByIdRepository and return result", async () => {
      const mockOrder = { order_id: "ORD001" };
      getOrderByIdRepository.mockResolvedValue(mockOrder);

      const result = await getOrderByIdService("ORD001");

      expect(getOrderByIdRepository).toHaveBeenCalledWith("ORD001");
      expect(result).toBe(mockOrder);
    });
  });

  describe("getAllOrdersService", () => {
    it("should call getAllOrdersRepository and return result", async () => {
      const mockOrders = [{ order_id: "ORD001" }, { order_id: "ORD002" }];
      getAllOrdersRepository.mockResolvedValue(mockOrders);

      const result = await getAllOrdersService();

      expect(getAllOrdersRepository).toHaveBeenCalled();
      expect(result).toBe(mockOrders);
    });
  });
});
