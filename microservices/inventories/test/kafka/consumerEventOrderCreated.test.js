const {
  listenEventOrderCreated,
} = require("../../src/kafka/consumerEventOrderCreated");

jest.mock("kafkajs", () => {
  const mConsumer = {
    connect: jest.fn(),
    subscribe: jest.fn(),
    run: jest.fn(),
  };
  const mKafka = {
    consumer: jest.fn(() => mConsumer),
  };
  return { Kafka: jest.fn(() => mKafka) };
});

jest.mock("../../src/kafka/order_events_pb", () => {
  class MockCustomer {
    getUserId = jest.fn(() => "user-123");
    getEmail = jest.fn(() => "user@example.com");
  }
  class MockOrderItem {
    getProductId = jest.fn(() => "prod-1");
    getSku = jest.fn(() => "sku-1");
    getName = jest.fn(() => "Product 1");
    getPrice = jest.fn(() => 99.99);
    getQuantity = jest.fn(() => 3);
  }
  class MockOrderCreated {
    getCustomer = jest.fn(() => new MockCustomer());
    getItemsList = jest.fn(() => [new MockOrderItem()]);
  }
  class MockOrderEvent {
    getEventType = jest.fn(() => 0);
    getTimestamp = jest.fn(() => null);
    getOrderCreated = jest.fn(() => new MockOrderCreated());
    getEventId = jest.fn(() => "event-uuid-1");
    getOrderId = jest.fn(() => "order-123");
  }
  return {
    OrderEvent: {
      deserializeBinary: jest.fn(() => new MockOrderEvent()),
    },
    EventType: {
      ORDER_CREATED: 0,
    },
  };
});

jest.mock("../../src/services/inventoriesService", () => ({
  processEventOrderCreated: jest.fn(),
}));

const {
  processEventOrderCreated,
} = require("../../src/services/inventoriesService");

describe("consumerEventOrderCreated", () => {
  let kafkaMockConsumer;
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    const { Kafka } = require("kafkajs");
    const kafkaInstance = new Kafka();
    kafkaMockConsumer = kafkaInstance.consumer();

    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    if (consoleErrorSpy) {
      consoleErrorSpy.mockRestore();
    }
  });

  describe("listenEventOrderCreated", () => {
    it("should connect, subscribe and run the consumer", async () => {
      kafkaMockConsumer.run.mockImplementation(({ eachMessage }) => {
        return eachMessage({
          topic: "event-order-created",
          partition: 0,
          message: {
            value: Buffer.from([1, 2, 3]),
          },
        });
      });

      await listenEventOrderCreated();

      expect(kafkaMockConsumer.connect).toHaveBeenCalled();
      expect(kafkaMockConsumer.connect).toHaveBeenCalledTimes(1);
      expect(kafkaMockConsumer.subscribe).toHaveBeenCalledWith({
        topic: "event-order-created",
        fromBeginning: true,
      });
      expect(kafkaMockConsumer.subscribe).toHaveBeenCalledTimes(1);
      expect(kafkaMockConsumer.run).toHaveBeenCalled();
      expect(kafkaMockConsumer.run).toHaveBeenCalledTimes(1);
    });

    it("should process ORDER_CREATED event successfully", async () => {
      const { OrderEvent } = require("../../src/kafka/order_events_pb");

      kafkaMockConsumer.run.mockImplementation(({ eachMessage }) => {
        return eachMessage({
          topic: "event-order-created",
          partition: 0,
          message: {
            value: Buffer.from([1, 2, 3]),
          },
        });
      });

      await listenEventOrderCreated();

      expect(OrderEvent.deserializeBinary).toHaveBeenCalledWith(
        Buffer.from([1, 2, 3])
      );
      expect(OrderEvent.deserializeBinary).toHaveBeenCalledTimes(1);
      expect(processEventOrderCreated).toHaveBeenCalledWith({
        event_id: "event-uuid-1",
        order_id: "order-123",
        customer: {
          user_id: "user-123",
          email: "user@example.com",
        },
        items: [
          {
            product_id: "prod-1",
            sku: "sku-1",
            name: "Product 1",
            price: 99.99,
            quantity: 3,
          },
        ],
      });
      expect(processEventOrderCreated).toHaveBeenCalledTimes(1);
    });

    it("should handle non-ORDER_CREATED event types", async () => {
      const {
        OrderEvent,
        EventType,
      } = require("../../src/kafka/order_events_pb");

      // Mock different event type
      OrderEvent.deserializeBinary.mockReturnValue({
        getEventType: jest.fn(() => 999), // Non-ORDER_CREATED event
        getEventId: jest.fn(() => "event-uuid-1"),
        getOrderId: jest.fn(() => "order-123"),
      });

      kafkaMockConsumer.run.mockImplementation(({ eachMessage }) => {
        return eachMessage({
          topic: "event-order-created",
          partition: 0,
          message: {
            value: Buffer.from([1, 2, 3]),
          },
        });
      });

      await listenEventOrderCreated();

      expect(OrderEvent.deserializeBinary).toHaveBeenCalled();
      expect(processEventOrderCreated).not.toHaveBeenCalled();
    });

    it("should handle multiple items in order", async () => {
      const { OrderEvent } = require("../../src/kafka/order_events_pb");

      // Mock order with multiple items
      const mockOrderCreated = {
        getCustomer: jest.fn(() => ({
          getUserId: jest.fn(() => "user-123"),
          getEmail: jest.fn(() => "user@example.com"),
        })),
        getItemsList: jest.fn(() => [
          {
            getProductId: jest.fn(() => "prod-1"),
            getSku: jest.fn(() => "sku-1"),
            getName: jest.fn(() => "Product 1"),
            getPrice: jest.fn(() => 99.99),
            getQuantity: jest.fn(() => 3),
          },
          {
            getProductId: jest.fn(() => "prod-2"),
            getSku: jest.fn(() => "sku-2"),
            getName: jest.fn(() => "Product 2"),
            getPrice: jest.fn(() => 49.99),
            getQuantity: jest.fn(() => 2),
          },
        ]),
      };

      OrderEvent.deserializeBinary.mockReturnValue({
        getEventType: jest.fn(() => 0),
        getEventId: jest.fn(() => "event-uuid-1"),
        getOrderId: jest.fn(() => "order-123"),
        getOrderCreated: jest.fn(() => mockOrderCreated),
      });

      kafkaMockConsumer.run.mockImplementation(({ eachMessage }) => {
        return eachMessage({
          topic: "event-order-created",
          partition: 0,
          message: {
            value: Buffer.from([1, 2, 3]),
          },
        });
      });

      await listenEventOrderCreated();

      expect(processEventOrderCreated).toHaveBeenCalledWith({
        event_id: "event-uuid-1",
        order_id: "order-123",
        customer: {
          user_id: "user-123",
          email: "user@example.com",
        },
        items: [
          {
            product_id: "prod-1",
            sku: "sku-1",
            name: "Product 1",
            price: 99.99,
            quantity: 3,
          },
          {
            product_id: "prod-2",
            sku: "sku-2",
            name: "Product 2",
            price: 49.99,
            quantity: 2,
          },
        ],
      });
    });

    it("should handle deserialization errors gracefully", async () => {
      const { OrderEvent } = require("../../src/kafka/order_events_pb");

      OrderEvent.deserializeBinary.mockImplementation(() => {
        throw new Error("Deserialization failed");
      });

      kafkaMockConsumer.run.mockImplementation(({ eachMessage }) => {
        return eachMessage({
          topic: "event-order-created",
          partition: 0,
          message: {
            value: Buffer.from([1, 2, 3]),
          },
        });
      });

      await listenEventOrderCreated();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error when processing event event-order-created:",
        expect.any(Error)
      );
      expect(processEventOrderCreated).not.toHaveBeenCalled();
    });

    it("should handle service processing errors gracefully", async () => {
      const { OrderEvent } = require("../../src/kafka/order_events_pb");

      processEventOrderCreated.mockRejectedValue(
        new Error("Service processing failed")
      );

      kafkaMockConsumer.run.mockImplementation(({ eachMessage }) => {
        return eachMessage({
          topic: "event-order-created",
          partition: 0,
          message: {
            value: Buffer.from([1, 2, 3]),
          },
        });
      });

      await listenEventOrderCreated();

      expect(OrderEvent.deserializeBinary).toHaveBeenCalled();
      expect(processEventOrderCreated).toHaveBeenCalled();
      // The error should be caught and logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error when processing event event-order-created:",
        expect.any(Error)
      );
    });

    it("should only process messages from the correct topic", async () => {
      const { OrderEvent } = require("../../src/kafka/order_events_pb");

      kafkaMockConsumer.run.mockImplementation(({ eachMessage }) => {
        // Simulate message from different topic
        return eachMessage({
          topic: "different-topic",
          partition: 0,
          message: {
            value: Buffer.from([1, 2, 3]),
          },
        });
      });

      await listenEventOrderCreated();

      expect(OrderEvent.deserializeBinary).not.toHaveBeenCalled();
      expect(processEventOrderCreated).not.toHaveBeenCalled();
    });

    it("should handle empty message value", async () => {
      const { OrderEvent } = require("../../src/kafka/order_events_pb");

      kafkaMockConsumer.run.mockImplementation(({ eachMessage }) => {
        return eachMessage({
          topic: "event-order-created",
          partition: 0,
          message: {
            value: Buffer.alloc(0), // Empty buffer
          },
        });
      });

      await listenEventOrderCreated();

      expect(OrderEvent.deserializeBinary).toHaveBeenCalledWith(
        Buffer.alloc(0)
      );
    });
  });
});
