const {
  createOrderService,
  getOrderByIdService,
  getOrdersByUserIdService,
  validateItemsStock,
  processEventOrder,
  applyRandomPercent,
  getPricing,
  getRandomPaymentStatus,
  getPayment,
} = require("../../src/services/ordersService");

jest.mock("../../src/kafka/producerEventOrderCreated");
jest.mock("../../src/repositories/ordersRepository");
jest.mock("../../src/repositories/inventoriesRepository");
jest.mock("../../src/utils/generateRandoms");

const {
  produceEventOrderCreated,
} = require("../../src/kafka/producerEventOrderCreated");
const {
  createOrderRepository,
  getOrderByIdRepository,
  getOrdersByUserIdRepository,
  updateOrderByIdRepository,
} = require("../../src/repositories/ordersRepository");
const {
  getProductBySku,
} = require("../../src/repositories/inventoriesRepository");
const {
  buildOrderId,
  buildTransactionId,
} = require("../../src/utils/generateRandoms");

describe("Orders Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jest.spyOn(Math, "random").mockReturnValue(0.5);
    jest.spyOn(Math, "floor").mockReturnValue(5);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("validateItemsStock", () => {
    test("should validate items stock successfully", async () => {
      const items = [
        { sku: "SKU123", quantity: 2 },
        { sku: "SKU456", quantity: 1 },
      ];

      const mockProduct1 = {
        id: "product123",
        name: "Test Product",
        price: 75.0,
        Inventory: { available_quantity: 10, reserved_quantity: 2 },
      };

      const mockProduct2 = {
        id: "product456",
        name: "Test Product",
        price: 100.0,
        Inventory: { available_quantity: 5, reserved_quantity: 1 },
      };

      getProductBySku
        .mockResolvedValueOnce(mockProduct1)
        .mockResolvedValueOnce(mockProduct2);

      const result = await validateItemsStock(items);

      expect(getProductBySku).toHaveBeenCalledWith("SKU123");
      expect(getProductBySku).toHaveBeenCalledWith("SKU456");
      expect(result).toEqual([
        {
          sku: "SKU123",
          quantity: 2,
          product_id: "product123",
          price: 75.0,
          name: "Test Product",
        },
        {
          sku: "SKU456",
          quantity: 1,
          product_id: "product456",
          price: 100.0,
          name: "Test Product",
        },
      ]);
    });

    test("should throw error when product not found", async () => {
      const items = [{ sku: "SKU123", quantity: 2 }];

      getProductBySku.mockResolvedValueOnce(null);

      try {
        await validateItemsStock(items);
        expect(true).toBe(false);
      } catch (error) {
        expect(error.message).toBe(
          "Product with SKU SKU123 not found in inventory"
        );
      }
    });

    test("should throw error when product has no inventory", async () => {
      const items = [{ sku: "SKU123", quantity: 2 }];

      const mockProduct = {
        id: "product123",
        name: "Test Product",
        price: 75.0,
        Inventory: {},
      };

      getProductBySku.mockResolvedValueOnce(mockProduct);

      try {
        await validateItemsStock(items);
        expect(true).toBe(false);
      } catch (error) {
        expect(error.message).toBe(
          "Product with SKU SKU123 not found in inventory"
        );
      }
    });

    test("should throw error when available quantity is null", async () => {
      const items = [{ sku: "SKU123", quantity: 2 }];

      const mockProduct = {
        id: "product123",
        name: "Test Product",
        price: 75.0,
        Inventory: { available_quantity: null, reserved_quantity: 2 },
      };

      getProductBySku.mockResolvedValueOnce(mockProduct);

      try {
        await validateItemsStock(items);
        expect(true).toBe(false);
      } catch (error) {
        expect(error.message).toBe(
          "Product with SKU SKU123 not found in inventory"
        );
      }
    });

    test("should throw error when insufficient stock", async () => {
      const items = [{ sku: "SKU123", quantity: 10 }];

      const mockProduct = {
        id: "product123",
        name: "Test Product",
        price: 75.0,
        Inventory: { available_quantity: 5, reserved_quantity: 2 },
      };

      getProductBySku.mockResolvedValueOnce(mockProduct);

      try {
        await validateItemsStock(items);
        expect(true).toBe(false);
      } catch (error) {
        expect(error.message).toBe(
          "Insufficient stock for SKU SKU123: requested 10, available 5"
        );
      }
    });

    test("should handle edge case with exact available stock", async () => {
      const items = [{ sku: "SKU123", quantity: 3 }];

      const mockProduct = {
        id: "product123",
        name: "Test Product",
        price: 75.0,
        Inventory: { available_quantity: 5, reserved_quantity: 2 },
      };

      getProductBySku.mockResolvedValue(mockProduct);

      const result = await validateItemsStock(items);

      expect(result).toEqual([
        {
          sku: "SKU123",
          quantity: 3,
          product_id: "product123",
          price: 75.0,
          name: "Test Product",
        },
      ]);
    });
  });

  describe("applyRandomPercent", () => {
    test("should apply random percentage between 1-10%", () => {
      jest.spyOn(Math, "floor").mockReturnValue(10);

      const result = applyRandomPercent(100);

      expect(result).toBe(11);
    });

    test("should handle zero input", () => {
      const result = applyRandomPercent(0);

      expect(result).toBe(0);
    });
  });

  describe("getPricing", () => {
    test("should calculate pricing correctly", () => {
      const items = [
        { sku: "SKU123", quantity: 2, price: 100.0 },
        { sku: "SKU456", quantity: 1, price: 50.0 },
      ];

      jest.spyOn(Math, "floor").mockReturnValue(10);

      const result = getPricing(items);

      expect(result.subtotal).toBe("250.00");
      expect(result.tax).toBe("27.50");
      expect(result.total).toBe("277.50");
    });

    test("should handle single item", () => {
      const items = [{ sku: "SKU123", quantity: 1, price: 100.0 }];

      jest.spyOn(Math, "floor").mockReturnValue(10);

      const result = getPricing(items);

      expect(result.subtotal).toBe("100.00");
      expect(result.tax).toBe("11.00");
      expect(result.total).toBe("111.00");
    });

    test("should handle zero quantity items", () => {
      const items = [
        { sku: "SKU123", quantity: 0, price: 100.0 },
        { sku: "SKU456", quantity: 1, price: 50.0 },
      ];

      jest.spyOn(Math, "floor").mockReturnValue(10);

      const result = getPricing(items);

      expect(result.subtotal).toBe("50.00");
      expect(result.tax).toBe("5.50");
      expect(result.total).toBe("55.50");
    });
  });

  describe("getRandomPaymentStatus", () => {
    test("should return completed for random < 0.7", () => {
      jest.spyOn(Math, "random").mockReturnValue(0.5);

      const result = getRandomPaymentStatus();

      expect(result).toBe("completed");
    });

    test("should return failed for random >= 0.7", () => {
      jest.spyOn(Math, "random").mockReturnValue(0.8);

      const result = getRandomPaymentStatus();

      expect(result).toBe("failed");
    });

    test("should return failed for random = 0.7", () => {
      jest.spyOn(Math, "random").mockReturnValue(0.7);

      const result = getRandomPaymentStatus();

      expect(result).toBe("failed");
    });
  });

  describe("getPayment", () => {
    test("should return payment object with status and transaction_id", () => {
      const mockTransactionId = "txn_123456";
      buildTransactionId.mockReturnValue(mockTransactionId);

      const result = getPayment();

      expect(result).toEqual({
        status: "completed",
        transaction_id: mockTransactionId,
      });
    });
  });

  describe("createOrderService", () => {
    test("should create order successfully", async () => {
      const orderData = {
        items: [{ sku: "SKU123", quantity: 2 }],
        customer: { user_id: "user123", email: "test@example.com" },
      };

      const mockProduct = {
        id: "product123",
        name: "Test Product",
        price: 75.0,
        Inventory: { available_quantity: 10, reserved_quantity: 2 },
      };

      const mockOrderId = "ORD-2024-123456";
      const mockTransactionId = "txn_123456";

      getProductBySku.mockResolvedValue(mockProduct);
      buildOrderId.mockReturnValue(mockOrderId);
      buildTransactionId.mockReturnValue(mockTransactionId);
      produceEventOrderCreated.mockResolvedValue();
      createOrderRepository.mockResolvedValue({
        order_id: mockOrderId,
        status: "pending",
        created_at: "2024-01-01T00:00:00.000Z",
      });

      const result = await createOrderService(orderData);

      expect(produceEventOrderCreated).toHaveBeenCalledWith(
        expect.objectContaining({
          order_id: mockOrderId,
          status: "pending",
        })
      );
      expect(createOrderRepository).toHaveBeenCalledWith(
        expect.objectContaining({
          order_id: mockOrderId,
          status: "pending",
        })
      );
      expect(result).toEqual({
        order_id: mockOrderId,
        status: "pending",
        message: "Order created successfully and queued for processing",
        estimated_total: expect.any(String),
        created_at: "2024-01-01T00:00:00.000Z",
      });
    });

    test("should handle validation errors", async () => {
      const orderData = {
        items: [{ sku: "SKU123", quantity: 10 }],
        customer: { user_id: "user123", email: "test@example.com" },
      };

      const mockProduct = {
        id: "product123",
        name: "Test Product",
        price: 75.0,
        Inventory: { available_quantity: 5, reserved_quantity: 2 },
      };

      getProductBySku.mockResolvedValueOnce(mockProduct);

      try {
        await createOrderService(orderData);
        expect(true).toBe(false);
      } catch (error) {
        expect(error.message).toBe(
          "Insufficient stock for SKU SKU123: requested 10, available 5"
        );
      }
    });
  });

  describe("getOrderByIdService", () => {
    test("should get order by id successfully", async () => {
      const orderId = "ORD-2024-123456";
      const mockOrder = {
        order_id: orderId,
        status: "pending",
        items: [],
        customer: {},
      };

      getOrderByIdRepository.mockResolvedValue(mockOrder);

      const result = await getOrderByIdService(orderId);

      expect(getOrderByIdRepository).toHaveBeenCalledWith(orderId);
      expect(result).toEqual(mockOrder);
    });
  });

  describe("getOrdersByUserIdService", () => {
    test("should get orders by user id successfully", async () => {
      const userId = "user123";
      const mockOrders = [
        {
          order_id: "ORD-2024-123456",
          status: "pending",
        },
      ];

      getOrdersByUserIdRepository.mockResolvedValue(mockOrders);

      const result = await getOrdersByUserIdService(userId);

      expect(getOrdersByUserIdRepository).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockOrders);
    });
  });

  describe("processEventOrder", () => {
    test("should process order confirmed event", async () => {
      const orderData = { order_id: "ORD-2024-123456" };
      const type = "confirmed";

      updateOrderByIdRepository.mockResolvedValue({ modifiedCount: 1 });

      await processEventOrder(orderData, type);

      expect(updateOrderByIdRepository).toHaveBeenCalledWith(
        orderData.order_id,
        "completed"
      );
    });

    test("should process order failed event", async () => {
      const orderData = { order_id: "ORD-2024-123456" };
      const type = "failed";

      updateOrderByIdRepository.mockResolvedValue({ modifiedCount: 1 });

      await processEventOrder(orderData, type);

      expect(updateOrderByIdRepository).toHaveBeenCalledWith(
        orderData.order_id,
        "failed"
      );
    });

    test("should handle repository errors", async () => {
      const orderData = { order_id: "ORD-2024-123456" };
      const type = "confirmed";

      updateOrderByIdRepository.mockRejectedValueOnce(
        new Error("Database error")
      );

      try {
        await processEventOrder(orderData, type);
        expect(true).toBe(false);
      } catch (error) {
        expect(error.message).toBe("Database error");
      }
    });
  });
});
