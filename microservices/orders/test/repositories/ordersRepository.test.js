const {
  createOrderRepository,
  getOrderByIdRepository,
  getOrdersByUserIdRepository,
  updateOrderByIdRepository,
} = require("../../src/repositories/ordersRepository");

jest.mock("../../src/models/order");

const Order = require("../../src/models/order");

describe("Orders Repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createOrderRepository", () => {
    test("should create order successfully", async () => {
      const orderData = {
        order_id: "ORD-2024-123456",
        customer: { user_id: "user123", email: "test@example.com" },
        items: [{ sku: "SKU123", quantity: 2, price: 75.0 }],
        status: "pending",
      };

      const mockOrder = {
        ...orderData,
        save: jest.fn().mockResolvedValue(orderData),
      };

      Order.mockImplementation(() => mockOrder);

      const result = await createOrderRepository(orderData);

      expect(Order).toHaveBeenCalledWith(orderData);
      expect(mockOrder.save).toHaveBeenCalled();
      expect(result).toEqual(orderData);
    });

    test("should handle save errors", async () => {
      const orderData = {
        order_id: "ORD-2024-123456",
        customer: { user_id: "user123", email: "test@example.com" },
        items: [{ sku: "SKU123", quantity: 2, price: 75.0 }],
        status: "pending",
      };

      const mockOrder = {
        ...orderData,
        save: jest.fn().mockRejectedValue(new Error("Save failed")),
      };

      Order.mockImplementation(() => mockOrder);

      await expect(createOrderRepository(orderData)).rejects.toThrow(
        "Save failed"
      );

      expect(Order).toHaveBeenCalledWith(orderData);
      expect(mockOrder.save).toHaveBeenCalled();
    });

    test("should handle validation errors", async () => {
      const orderData = {
        status: "pending",
      };

      const mockOrder = {
        ...orderData,
        save: jest.fn().mockRejectedValue(new Error("Validation failed")),
      };

      Order.mockImplementation(() => mockOrder);

      await expect(createOrderRepository(orderData)).rejects.toThrow(
        "Validation failed"
      );

      expect(Order).toHaveBeenCalledWith(orderData);
      expect(mockOrder.save).toHaveBeenCalled();
    });
  });

  describe("getOrderByIdRepository", () => {
    test("should get order by id successfully", async () => {
      const orderId = "ORD-2024-123456";
      const mockOrder = {
        order_id: orderId,
        status: "completed",
        customer: { user_id: "user123", email: "test@example.com" },
        items: [{ sku: "SKU123", quantity: 2, price: 75.0 }],
      };

      const mockQuery = {
        findOne: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockOrder),
      };

      Order.findOne = jest.fn().mockReturnValue(mockQuery);

      const result = await getOrderByIdRepository(orderId);

      expect(Order.findOne).toHaveBeenCalledWith({ order_id: orderId });
      expect(mockQuery.exec).toHaveBeenCalled();
      expect(result).toEqual(mockOrder);
    });

    test("should return null when order not found", async () => {
      const orderId = "ORD-2024-123456";

      const mockQuery = {
        findOne: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };

      Order.findOne = jest.fn().mockReturnValue(mockQuery);

      const result = await getOrderByIdRepository(orderId);

      expect(Order.findOne).toHaveBeenCalledWith({ order_id: orderId });
      expect(mockQuery.exec).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    test("should handle database errors", async () => {
      const orderId = "ORD-2024-123456";
      const dbError = new Error("Database connection failed");

      const mockQuery = {
        findOne: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(dbError),
      };

      Order.findOne = jest.fn().mockReturnValue(mockQuery);

      await expect(getOrderByIdRepository(orderId)).rejects.toThrow(
        "Database connection failed"
      );

      expect(Order.findOne).toHaveBeenCalledWith({ order_id: orderId });
      expect(mockQuery.exec).toHaveBeenCalled();
    });

    test("should handle empty orderId", async () => {
      const orderId = "";

      const mockQuery = {
        findOne: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };

      Order.findOne = jest.fn().mockReturnValue(mockQuery);

      const result = await getOrderByIdRepository(orderId);

      expect(Order.findOne).toHaveBeenCalledWith({ order_id: "" });
      expect(mockQuery.exec).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe("getOrdersByUserIdRepository", () => {
    test("should get orders by user id successfully", async () => {
      const userId = "user123";
      const mockOrders = [
        {
          order_id: "ORD-2024-123456",
          status: "completed",
          customer: { user_id: userId, email: "test@example.com" },
        },
        {
          order_id: "ORD-2024-789012",
          status: "pending",
          customer: { user_id: userId, email: "test@example.com" },
        },
      ];

      const mockQuery = {
        find: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockOrders),
      };

      Order.find = jest.fn().mockReturnValue(mockQuery);

      const result = await getOrdersByUserIdRepository(userId);

      expect(Order.find).toHaveBeenCalledWith({ "customer.user_id": userId });
      expect(mockQuery.exec).toHaveBeenCalled();
      expect(result).toEqual(mockOrders);
    });

    test("should return empty array when no orders found", async () => {
      const userId = "user123";

      const mockQuery = {
        find: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };

      Order.find = jest.fn().mockReturnValue(mockQuery);

      const result = await getOrdersByUserIdRepository(userId);

      expect(Order.find).toHaveBeenCalledWith({ "customer.user_id": userId });
      expect(mockQuery.exec).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    test("should handle database errors", async () => {
      const userId = "user123";
      const dbError = new Error("Database connection failed");

      const mockQuery = {
        find: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(dbError),
      };

      Order.find = jest.fn().mockReturnValue(mockQuery);

      await expect(getOrdersByUserIdRepository(userId)).rejects.toThrow(
        "Database connection failed"
      );

      expect(Order.find).toHaveBeenCalledWith({ "customer.user_id": userId });
      expect(mockQuery.exec).toHaveBeenCalled();
    });

    test("should handle undefined userId", async () => {
      const userId = undefined;

      const mockQuery = {
        find: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };

      Order.find = jest.fn().mockReturnValue(mockQuery);

      const result = await getOrdersByUserIdRepository(userId);

      expect(Order.find).toHaveBeenCalledWith({
        "customer.user_id": undefined,
      });
      expect(mockQuery.exec).toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    test("should handle null userId", async () => {
      const userId = null;

      const mockQuery = {
        find: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue([]),
      };

      Order.find = jest.fn().mockReturnValue(mockQuery);

      const result = await getOrdersByUserIdRepository(userId);

      expect(Order.find).toHaveBeenCalledWith({ "customer.user_id": null });
      expect(mockQuery.exec).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe("updateOrderByIdRepository", () => {
    test("should update order status successfully", async () => {
      const orderId = "ORD-2024-123456";
      const newStatus = "completed";

      const mockUpdateResult = {
        modifiedCount: 1,
        matchedCount: 1,
        upsertedCount: 0,
      };

      Order.updateOne = jest.fn().mockResolvedValue(mockUpdateResult);

      const result = await updateOrderByIdRepository(orderId, newStatus);

      expect(Order.updateOne).toHaveBeenCalledWith(
        { order_id: orderId },
        { $set: { status: newStatus } }
      );
      expect(result).toEqual(mockUpdateResult);
    });

    test("should handle order not found", async () => {
      const orderId = "ORD-2024-123456";
      const newStatus = "completed";

      const mockUpdateResult = {
        modifiedCount: 0,
        matchedCount: 0,
        upsertedCount: 0,
      };

      Order.updateOne = jest.fn().mockResolvedValue(mockUpdateResult);

      const result = await updateOrderByIdRepository(orderId, newStatus);

      expect(Order.updateOne).toHaveBeenCalledWith(
        { order_id: orderId },
        { $set: { status: newStatus } }
      );
      expect(result).toEqual(mockUpdateResult);
    });

    test("should handle database errors", async () => {
      const orderId = "ORD-2024-123456";
      const newStatus = "completed";
      const dbError = new Error("Database connection failed");

      Order.updateOne = jest.fn().mockRejectedValue(dbError);

      await expect(
        updateOrderByIdRepository(orderId, newStatus)
      ).rejects.toThrow("Database connection failed");

      expect(Order.updateOne).toHaveBeenCalledWith(
        { order_id: orderId },
        { $set: { status: newStatus } }
      );
    });

    test("should handle empty orderId", async () => {
      const orderId = "";
      const newStatus = "completed";

      const mockUpdateResult = {
        modifiedCount: 0,
        matchedCount: 0,
        upsertedCount: 0,
      };

      Order.updateOne = jest.fn().mockResolvedValue(mockUpdateResult);

      const result = await updateOrderByIdRepository(orderId, newStatus);

      expect(Order.updateOne).toHaveBeenCalledWith(
        { order_id: "" },
        { $set: { status: newStatus } }
      );
      expect(result).toEqual(mockUpdateResult);
    });

    test("should handle undefined status", async () => {
      const orderId = "ORD-2024-123456";
      const newStatus = undefined;

      const mockUpdateResult = {
        modifiedCount: 1,
        matchedCount: 1,
        upsertedCount: 0,
      };

      Order.updateOne = jest.fn().mockResolvedValue(mockUpdateResult);

      const result = await updateOrderByIdRepository(orderId, newStatus);

      expect(Order.updateOne).toHaveBeenCalledWith(
        { order_id: orderId },
        { $set: { status: undefined } }
      );
      expect(result).toEqual(mockUpdateResult);
    });

    test("should handle null status", async () => {
      const orderId = "ORD-2024-123456";
      const newStatus = null;

      const mockUpdateResult = {
        modifiedCount: 1,
        matchedCount: 1,
        upsertedCount: 0,
      };

      Order.updateOne = jest.fn().mockResolvedValue(mockUpdateResult);

      const result = await updateOrderByIdRepository(orderId, newStatus);

      expect(Order.updateOne).toHaveBeenCalledWith(
        { order_id: orderId },
        { $set: { status: null } }
      );
      expect(result).toEqual(mockUpdateResult);
    });
  });
});
