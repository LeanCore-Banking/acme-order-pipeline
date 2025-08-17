const {
  createOrderEventRepository,
  getOrderEventByIdRepository,
} = require("../../src/repositories/ordersEventsRepository");

jest.mock("../../src/models/orderEvent");

const OrderEvent = require("../../src/models/orderEvent");

describe("Orders Events Repository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createOrderEventRepository", () => {
    test("should create order event successfully", async () => {
      const eventData = {
        event_id: "evt_123456",
        order_id: "ORD-2024-123456",
        event_type: "ORDER_CREATED",
        timestamp: new Date("2024-01-01T00:00:00.000Z"),
      };

      const mockOrderEvent = {
        ...eventData,
        save: jest.fn().mockResolvedValue(eventData),
      };

      OrderEvent.mockImplementation(() => mockOrderEvent);

      const result = await createOrderEventRepository(eventData);

      expect(OrderEvent).toHaveBeenCalledWith(eventData);
      expect(mockOrderEvent.save).toHaveBeenCalled();
      expect(result).toEqual(eventData);
    });

    test("should handle save errors", async () => {
      const eventData = {
        event_id: "evt_123456",
        order_id: "ORD-2024-123456",
        event_type: "ORDER_CREATED",
        timestamp: new Date("2024-01-01T00:00:00.000Z"),
      };

      const mockOrderEvent = {
        ...eventData,
        save: jest.fn().mockRejectedValue(new Error("Save failed")),
      };

      OrderEvent.mockImplementation(() => mockOrderEvent);

      await expect(createOrderEventRepository(eventData)).rejects.toThrow(
        "Save failed"
      );

      expect(OrderEvent).toHaveBeenCalledWith(eventData);
      expect(mockOrderEvent.save).toHaveBeenCalled();
    });

    test("should handle validation errors", async () => {
      const eventData = {
        event_type: "ORDER_CREATED",
      };

      const mockOrderEvent = {
        ...eventData,
        save: jest.fn().mockRejectedValue(new Error("Validation failed")),
      };

      OrderEvent.mockImplementation(() => mockOrderEvent);

      await expect(createOrderEventRepository(eventData)).rejects.toThrow(
        "Validation failed"
      );

      expect(OrderEvent).toHaveBeenCalledWith(eventData);
      expect(mockOrderEvent.save).toHaveBeenCalled();
    });

    test("should handle duplicate key errors", async () => {
      const eventData = {
        event_id: "evt_123456",
        order_id: "ORD-2024-123456",
        event_type: "ORDER_CREATED",
        timestamp: new Date("2024-01-01T00:00:00.000Z"),
      };

      const duplicateError = new Error("E11000 duplicate key error");
      duplicateError.code = 11000;

      const mockOrderEvent = {
        ...eventData,
        save: jest.fn().mockRejectedValue(duplicateError),
      };

      OrderEvent.mockImplementation(() => mockOrderEvent);

      await expect(createOrderEventRepository(eventData)).rejects.toThrow(
        "E11000 duplicate key error"
      );

      expect(OrderEvent).toHaveBeenCalledWith(eventData);
      expect(mockOrderEvent.save).toHaveBeenCalled();
    });

    test("should handle network errors", async () => {
      const eventData = {
        event_id: "evt_123456",
        order_id: "ORD-2024-123456",
        event_type: "ORDER_CREATED",
        timestamp: new Date("2024-01-01T00:00:00.000Z"),
      };

      const networkError = new Error("Network timeout");
      networkError.code = "NETWORK_TIMEOUT";

      const mockOrderEvent = {
        ...eventData,
        save: jest.fn().mockRejectedValue(networkError),
      };

      OrderEvent.mockImplementation(() => mockOrderEvent);

      await expect(createOrderEventRepository(eventData)).rejects.toThrow(
        "Network timeout"
      );

      expect(OrderEvent).toHaveBeenCalledWith(eventData);
      expect(mockOrderEvent.save).toHaveBeenCalled();
    });
  });

  describe("getOrderEventByIdRepository", () => {
    test("should get order event by id successfully", async () => {
      const eventId = "evt_123456";
      const orderId = "ORD-2024-123456";
      const mockOrderEvent = {
        event_id: eventId,
        order_id: orderId,
        event_type: "ORDER_CREATED",
        timestamp: new Date("2024-01-01T00:00:00.000Z"),
      };

      const mockQuery = {
        findOne: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockOrderEvent),
      };

      OrderEvent.findOne = jest.fn().mockReturnValue(mockQuery);

      const result = await getOrderEventByIdRepository(eventId, orderId);

      expect(OrderEvent.findOne).toHaveBeenCalledWith({
        event_id: eventId,
        order_id: orderId,
      });
      expect(mockQuery.exec).toHaveBeenCalled();
      expect(result).toEqual(mockOrderEvent);
    });

    test("should return null when order event not found", async () => {
      const eventId = "evt_123456";
      const orderId = "ORD-2024-123456";

      const mockQuery = {
        findOne: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };

      OrderEvent.findOne = jest.fn().mockReturnValue(mockQuery);

      const result = await getOrderEventByIdRepository(eventId, orderId);

      expect(OrderEvent.findOne).toHaveBeenCalledWith({
        event_id: eventId,
        order_id: orderId,
      });
      expect(mockQuery.exec).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    test("should handle database errors", async () => {
      const eventId = "evt_123456";
      const orderId = "ORD-2024-123456";
      const dbError = new Error("Database connection failed");

      const mockQuery = {
        findOne: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(dbError),
      };

      OrderEvent.findOne = jest.fn().mockReturnValue(mockQuery);

      await expect(
        getOrderEventByIdRepository(eventId, orderId)
      ).rejects.toThrow("Database connection failed");

      expect(OrderEvent.findOne).toHaveBeenCalledWith({
        event_id: eventId,
        order_id: orderId,
      });
      expect(mockQuery.exec).toHaveBeenCalled();
    });

    test("should handle empty eventId", async () => {
      const eventId = "";
      const orderId = "ORD-2024-123456";

      const mockQuery = {
        findOne: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };

      OrderEvent.findOne = jest.fn().mockReturnValue(mockQuery);

      const result = await getOrderEventByIdRepository(eventId, orderId);

      expect(OrderEvent.findOne).toHaveBeenCalledWith({
        event_id: "",
        order_id: orderId,
      });
      expect(mockQuery.exec).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    test("should handle empty orderId", async () => {
      const eventId = "evt_123456";
      const orderId = "";

      const mockQuery = {
        findOne: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };

      OrderEvent.findOne = jest.fn().mockReturnValue(mockQuery);

      const result = await getOrderEventByIdRepository(eventId, orderId);

      expect(OrderEvent.findOne).toHaveBeenCalledWith({
        event_id: eventId,
        order_id: "",
      });
      expect(mockQuery.exec).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    test("should handle undefined eventId", async () => {
      const eventId = undefined;
      const orderId = "ORD-2024-123456";

      const mockQuery = {
        findOne: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };

      OrderEvent.findOne = jest.fn().mockReturnValue(mockQuery);

      const result = await getOrderEventByIdRepository(eventId, orderId);

      expect(OrderEvent.findOne).toHaveBeenCalledWith({
        event_id: undefined,
        order_id: orderId,
      });
      expect(mockQuery.exec).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    test("should handle undefined orderId", async () => {
      const eventId = "evt_123456";
      const orderId = undefined;

      const mockQuery = {
        findOne: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };

      OrderEvent.findOne = jest.fn().mockReturnValue(mockQuery);

      const result = await getOrderEventByIdRepository(eventId, orderId);

      expect(OrderEvent.findOne).toHaveBeenCalledWith({
        event_id: eventId,
        order_id: undefined,
      });
      expect(mockQuery.exec).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    test("should handle null eventId", async () => {
      const eventId = null;
      const orderId = "ORD-2024-123456";

      const mockQuery = {
        findOne: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };

      OrderEvent.findOne = jest.fn().mockReturnValue(mockQuery);

      const result = await getOrderEventByIdRepository(eventId, orderId);

      expect(OrderEvent.findOne).toHaveBeenCalledWith({
        event_id: null,
        order_id: orderId,
      });
      expect(mockQuery.exec).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    test("should handle null orderId", async () => {
      const eventId = "evt_123456";
      const orderId = null;

      const mockQuery = {
        findOne: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };

      OrderEvent.findOne = jest.fn().mockReturnValue(mockQuery);

      const result = await getOrderEventByIdRepository(eventId, orderId);

      expect(OrderEvent.findOne).toHaveBeenCalledWith({
        event_id: eventId,
        order_id: null,
      });
      expect(mockQuery.exec).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    test("should handle both null values", async () => {
      const eventId = null;
      const orderId = null;

      const mockQuery = {
        findOne: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };

      OrderEvent.findOne = jest.fn().mockReturnValue(mockQuery);

      const result = await getOrderEventByIdRepository(eventId, orderId);

      expect(OrderEvent.findOne).toHaveBeenCalledWith({
        event_id: null,
        order_id: null,
      });
      expect(mockQuery.exec).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    test("should handle both undefined values", async () => {
      const eventId = undefined;
      const orderId = undefined;

      const mockQuery = {
        findOne: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };

      OrderEvent.findOne = jest.fn().mockReturnValue(mockQuery);

      const result = await getOrderEventByIdRepository(eventId, orderId);

      expect(OrderEvent.findOne).toHaveBeenCalledWith({
        event_id: undefined,
        order_id: undefined,
      });
      expect(mockQuery.exec).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    test("should handle both empty strings", async () => {
      const eventId = "";
      const orderId = "";

      const mockQuery = {
        findOne: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };

      OrderEvent.findOne = jest.fn().mockReturnValue(mockQuery);

      const result = await getOrderEventByIdRepository(eventId, orderId);

      expect(OrderEvent.findOne).toHaveBeenCalledWith({
        event_id: "",
        order_id: "",
      });
      expect(mockQuery.exec).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe("Query Building", () => {
    test("should build query with correct structure", async () => {
      const eventId = "evt_123456";
      const orderId = "ORD-2024-123456";

      const mockQuery = {
        findOne: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };

      OrderEvent.findOne = jest.fn().mockReturnValue(mockQuery);

      await getOrderEventByIdRepository(eventId, orderId);

      expect(OrderEvent.findOne).toHaveBeenCalledWith({
        event_id: eventId,
        order_id: orderId,
      });
    });

    test("should use correct field names in query", async () => {
      const eventId = "evt_123456";
      const orderId = "ORD-2024-123456";

      const mockQuery = {
        findOne: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      };

      OrderEvent.findOne = jest.fn().mockReturnValue(mockQuery);

      await getOrderEventByIdRepository(eventId, orderId);

      const queryCall = OrderEvent.findOne.mock.calls[0][0];
      expect(queryCall).toHaveProperty("event_id");
      expect(queryCall).toHaveProperty("order_id");
      expect(queryCall.event_id).toBe(eventId);
      expect(queryCall.order_id).toBe(orderId);
    });
  });

  describe("Error Handling", () => {
    test("should propagate all types of errors", async () => {
      const eventData = {
        event_id: "evt_123456",
        order_id: "ORD-2024-123456",
        event_type: "ORDER_CREATED",
        timestamp: new Date("2024-01-01T00:00:00.000Z"),
      };

      const errorTypes = [
        new Error("Generic error"),
        new TypeError("Type error"),
        new ReferenceError("Reference error"),
        new SyntaxError("Syntax error"),
        new RangeError("Range error"),
      ];

      for (const error of errorTypes) {
        jest.clearAllMocks();

        const mockOrderEvent = {
          ...eventData,
          save: jest.fn().mockRejectedValue(error),
        };

        OrderEvent.mockImplementation(() => mockOrderEvent);

        await expect(createOrderEventRepository(eventData)).rejects.toThrow(
          error.message
        );
      }
    });

    test("should handle async errors correctly", async () => {
      const eventId = "evt_123456";
      const orderId = "ORD-2024-123456";

      const asyncError = new Error("Async operation failed");
      asyncError.name = "AsyncError";

      const mockQuery = {
        findOne: jest.fn().mockReturnThis(),
        exec: jest.fn().mockRejectedValue(asyncError),
      };

      OrderEvent.findOne = jest.fn().mockReturnValue(mockQuery);

      await expect(
        getOrderEventByIdRepository(eventId, orderId)
      ).rejects.toThrow("Async operation failed");
    });
  });
});
