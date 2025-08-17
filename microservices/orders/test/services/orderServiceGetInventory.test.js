jest.mock("../../src/repositories/ordersRepository", () => ({
  createOrderRepository: jest.fn(() => ({
    validateItemsStock: jest.fn(),
  })),
}));

jest.mock("../../src/services/ordersService", () => ({
  getProductBySku: jest.fn(() => ({
    sku: "A1",
    available_quantity: 10,
  })),
  validateItemsStock: jest.fn(),
}));

const {
  createOrderRepository,
} = require("../../src/repositories/ordersRepository");

const {
  createOrderService,
  getProductBySku,
  validateItemsStock,
} = require("../../src/services/ordersService");

describe.skip("createOrderService", () => {
  it("should create an order successfully", async () => {
    getProductBySku.mockResolvedValue({ sku: "A1", available_quantity: 5 });
    createOrderRepository.mockResolvedValue({ id: 123, status: "CREATED" });

    const result = await createOrderService({
      items: [{ sku: "A1", quantity: 2 }],
    });

    expect(validateItemsStock).toBeDefined();
    expect(createOrderRepository).toHaveBeenCalledWith({
      items: [{ sku: "A1", quantity: 2 }],
    });
    expect(result).toEqual({ id: 123, status: "CREATED" });
  });
});
