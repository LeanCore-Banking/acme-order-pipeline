const {
  createOrder,
  getOrderById,
  getOrdersByUserId,
} = require("../../src/controllers/ordersController");

// Mock the orders service
jest.mock("../../src/services/ordersService");

const {
  createOrderService,
  getOrderByIdService,
  getOrdersByUserIdService,
} = require("../../src/services/ordersService");

describe("Orders Controller", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Setup mock request and response objects
    mockReq = {
      body: {},
      params: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe("createOrder", () => {
    test("should create order successfully with valid data", async () => {
      const orderData = {
        items: [{ sku: "SKU123", quantity: 2 }],
        customer: { user_id: "user123", email: "test@example.com" },
      };

      const mockOrderResult = {
        order_id: "ORD-2024-123456",
        status: "pending",
        message: "Order created successfully and queued for processing",
        estimated_total: "150.00",
        created_at: "2024-01-01T00:00:00.000Z",
      };

      mockReq.body = orderData;
      createOrderService.mockResolvedValue(mockOrderResult);

      await createOrder(mockReq, mockRes);

      expect(createOrderService).toHaveBeenCalledWith(orderData);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Order processed successfully",
        order: mockOrderResult,
      });
    });

    test("should return 400 when items are missing", async () => {
      const orderData = {
        customer: { user_id: "user123", email: "test@example.com" },
      };

      mockReq.body = orderData;

      await createOrder(mockReq, mockRes);

      expect(createOrderService).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Missing required data",
      });
    });

    test("should return 400 when customer is missing", async () => {
      const orderData = {
        items: [{ sku: "SKU123", quantity: 2 }],
      };

      mockReq.body = orderData;

      await createOrder(mockReq, mockRes);

      expect(createOrderService).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Missing required data",
      });
    });

    test("should return 400 when both items and customer are missing", async () => {
      const orderData = {};

      mockReq.body = orderData;

      await createOrder(mockReq, mockRes);

      expect(createOrderService).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Missing required data",
      });
    });

    test("should handle service errors and return 400", async () => {
      const orderData = {
        items: [{ sku: "SKU123", quantity: 2 }],
        customer: { user_id: "user123", email: "test@example.com" },
      };

      const serviceError = new Error("Service error occurred");
      mockReq.body = orderData;
      createOrderService.mockRejectedValue(serviceError);

      await createOrder(mockReq, mockRes);

      expect(createOrderService).toHaveBeenCalledWith(orderData);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Service error occurred",
      });
    });

    test("should handle service errors with custom error messages", async () => {
      const orderData = {
        items: [{ sku: "SKU123", quantity: 2 }],
        customer: { user_id: "user123", email: "test@example.com" },
      };

      const serviceError = new Error("Insufficient stock");
      mockReq.body = orderData;
      createOrderService.mockRejectedValue(serviceError);

      await createOrder(mockReq, mockRes);

      expect(createOrderService).toHaveBeenCalledWith(orderData);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Insufficient stock",
      });
    });
  });

  describe("getOrderById", () => {
    test("should get order successfully with valid orderId", async () => {
      const orderId = "ORD-2024-123456";
      const mockOrder = {
        order_id: orderId,
        status: "completed",
        customer: { user_id: "user123", email: "test@example.com" },
        items: [{ sku: "SKU123", quantity: 2, price: 75.0 }],
        pricing: { subtotal: 150.0, tax: 15.0, total: 165.0 },
      };

      mockReq.params = { orderId };
      getOrderByIdService.mockResolvedValue(mockOrder);

      await getOrderById(mockReq, mockRes);

      expect(getOrderByIdService).toHaveBeenCalledWith(orderId);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Order found",
        order: mockOrder,
      });
    });

    test("should return 500 when orderId is missing", async () => {
      mockReq.params = {};

      await getOrderById(mockReq, mockRes);

      expect(getOrderByIdService).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Missing orderId",
      });
    });

    test("should return 500 when orderId is empty string", async () => {
      mockReq.params = { orderId: "" };

      await getOrderById(mockReq, mockRes);

      expect(getOrderByIdService).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Missing orderId",
      });
    });

    test("should return 500 when orderId is null", async () => {
      mockReq.params = { orderId: null };

      await getOrderById(mockReq, mockRes);

      expect(getOrderByIdService).not.toHaveBeenCalled();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Missing orderId",
      });
    });

    test("should handle service errors and return 500", async () => {
      const orderId = "ORD-2024-123456";
      const serviceError = new Error("Database error occurred");

      mockReq.params = { orderId };
      getOrderByIdService.mockRejectedValue(serviceError);

      await getOrderById(mockReq, mockRes);

      expect(getOrderByIdService).toHaveBeenCalledWith(orderId);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Database error occurred",
      });
    });

    test("should handle service errors with custom error messages", async () => {
      const orderId = "ORD-2024-123456";
      const serviceError = new Error("Order not found");

      mockReq.params = { orderId };
      getOrderByIdService.mockRejectedValue(serviceError);

      await getOrderById(mockReq, mockRes);

      expect(getOrderByIdService).toHaveBeenCalledWith(orderId);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Order not found",
      });
    });
  });

  describe("getOrdersByUserId", () => {
    test("should get orders successfully with valid userId", async () => {
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

      mockReq.params = { userId };
      getOrdersByUserIdService.mockResolvedValue(mockOrders);

      await getOrdersByUserId(mockReq, mockRes);

      expect(getOrdersByUserIdService).toHaveBeenCalledWith(userId);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Orders found",
        order: mockOrders,
      });
    });

    test("should handle empty orders array successfully", async () => {
      const userId = "user123";
      const mockOrders = [];

      mockReq.params = { userId };
      getOrdersByUserIdService.mockResolvedValue(mockOrders);

      await getOrdersByUserId(mockReq, mockRes);

      expect(getOrdersByUserIdService).toHaveBeenCalledWith(userId);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Orders found",
        order: [],
      });
    });

    test("should handle service errors and return 500", async () => {
      const userId = "user123";
      const serviceError = new Error("Database error occurred");

      mockReq.params = { userId };
      getOrdersByUserIdService.mockRejectedValue(serviceError);

      await getOrdersByUserId(mockReq, mockRes);

      expect(getOrdersByUserIdService).toHaveBeenCalledWith(userId);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Database error occurred",
      });
    });

    test("should handle service errors with custom error messages", async () => {
      const userId = "user123";
      const serviceError = new Error("User not found");

      mockReq.params = { userId };
      getOrdersByUserIdService.mockRejectedValue(serviceError);

      await getOrdersByUserId(mockReq, mockRes);

      expect(getOrdersByUserIdService).toHaveBeenCalledWith(userId);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "User not found",
      });
    });

    test("should handle undefined userId gracefully", async () => {
      const userId = undefined;
      const mockOrders = [];

      mockReq.params = { userId };
      getOrdersByUserIdService.mockResolvedValue(mockOrders);

      await getOrdersByUserId(mockReq, mockRes);

      expect(getOrdersByUserIdService).toHaveBeenCalledWith(undefined);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({
        message: "Orders found",
        order: [],
      });
    });
  });
});
