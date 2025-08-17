jest.mock("kafkajs");
jest.mock("uuid");
jest.mock("../../src/repositories/ordersEventsRepository");
jest.mock("../../src/kafka/order_events_pb");

const { Kafka } = require("kafkajs");
const { v7 } = require("uuid");
const {
  createOrderEventRepository,
  getOrderEventByIdRepository,
} = require("../../src/repositories/ordersEventsRepository");
const {
  OrderEvent,
  OrderCreated,
  EventType,
  Customer,
  OrderItem,
} = require("../../src/kafka/order_events_pb");

const {
  produceEventOrderCreated,
} = require("../../src/kafka/producerEventOrderCreated");

describe("Producer Event Order Created", () => {
  let mockProducer;
  let mockOrderCreated;
  let mockCustomer;
  let mockOrderItem;
  let mockOrderEvent;
  let mockTimestamp;

  beforeEach(() => {
    jest.clearAllMocks();

    mockProducer = {
      connect: jest.fn().mockResolvedValue(),
      send: jest.fn().mockResolvedValue(),
      disconnect: jest.fn().mockResolvedValue(),
    };

    Kafka.mockImplementation(() => ({
      producer: jest.fn().mockReturnValue(mockProducer),
    }));

    mockOrderCreated = {
      setOrderId: jest.fn().mockReturnThis(),
      setCustomer: jest.fn().mockReturnThis(),
      setItemsList: jest.fn().mockReturnThis(),
    };

    mockCustomer = {
      setUserId: jest.fn().mockReturnThis(),
      setEmail: jest.fn().mockReturnThis(),
    };

    mockOrderItem = {
      setProductId: jest.fn().mockReturnThis(),
      setSku: jest.fn().mockReturnThis(),
      setName: jest.fn().mockReturnThis(),
      setPrice: jest.fn().mockReturnThis(),
      setQuantity: jest.fn().mockReturnThis(),
    };

    mockOrderEvent = {
      setEventId: jest.fn().mockReturnThis(),
      setOrderId: jest.fn().mockReturnThis(),
      setEventType: jest.fn().mockReturnThis(),
      setTimestamp: jest.fn().mockReturnThis(),
      setOrderCreated: jest.fn().mockReturnThis(),
      getEventId: jest.fn().mockReturnValue("evt_123456"),
      getOrderId: jest.fn().mockReturnValue("ORD-2024-123456"),
      getEventType: jest.fn().mockReturnValue(EventType.ORDER_CREATED),
      serializeBinary: jest
        .fn()
        .mockReturnValue(Buffer.from("serialized_event")),
    };

    mockTimestamp = {
      setSeconds: jest.fn().mockReturnThis(),
      setNanos: jest.fn().mockReturnValue(),
    };

    OrderCreated.mockImplementation(() => mockOrderCreated);
    Customer.mockImplementation(() => mockCustomer);
    OrderItem.mockImplementation(() => mockOrderItem);
    OrderEvent.mockImplementation(() => mockOrderEvent);

    v7.mockReturnValue("evt_123456");
  });

  describe("produceEventOrderCreated", () => {
    test("should throw error when order event already exists", async () => {
      const orderData = {
        order_id: "ORD-2024-123456",
        customer: { user_id: "user123", email: "test@example.com" },
        items: [
          {
            product_id: "prod123",
            sku: "SKU123",
            name: "Product 1",
            price: 75.0,
            quantity: 2,
          },
        ],
      };

      getOrderEventByIdRepository.mockResolvedValue({
        event_id: "evt_123456",
        order_id: "ORD-2024-123456",
      });

      await expect(produceEventOrderCreated(orderData)).rejects.toThrow(
        "Order Event whit same data already exists!"
      );
    });

    test("should handle repository errors gracefully", async () => {
      const orderData = {
        order_id: "ORD-2024-123456",
        customer: { user_id: "user123", email: "test@example.com" },
        items: [
          {
            product_id: "prod123",
            sku: "SKU123",
            name: "Product 1",
            price: 75.0,
            quantity: 2,
          },
        ],
      };

      getOrderEventByIdRepository.mockRejectedValue(
        new Error("Database error")
      );

      await expect(produceEventOrderCreated(orderData)).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("Constants and Configuration", () => {
    test("should have correct topic constant", () => {
      const { TOPIC } = require("../../src/kafka/producerEventOrderCreated");
      expect(TOPIC).toBe("event-order-created");
    });

    test("should export produceEventOrderCreated function", () => {
      expect(typeof produceEventOrderCreated).toBe("function");
    });
  });
});
