const {
  produceEventOrderFailed,
} = require("../../src/kafka/producerEventOrderFailed");

jest.mock("kafkajs", () => {
  const mProducer = {
    connect: jest.fn(),
    send: jest.fn(),
    disconnect: jest.fn(),
  };
  const mKafka = {
    producer: jest.fn(() => mProducer),
  };
  return { Kafka: jest.fn(() => mProducer) };
});

jest.mock("uuid", () => ({
  v7: jest.fn(() => "test-uuid-456"),
}));

jest.mock("../../src/kafka/order_events_pb", () => {
  class MockOrderFailed {
    setOrderId = jest.fn();
    setReason = jest.fn();
    setErrorMessage = jest.fn();
  }
  class MockOrderEvent {
    setEventId = jest.fn();
    setOrderId = jest.fn();
    setEventType = jest.fn();
    setTimestamp = jest.fn();
    setOrderFailed = jest.fn();
    serializeBinary = jest.fn(() => Buffer.from("serialized-failed-event"));
  }
  class MockTimestamp {
    setSeconds = jest.fn();
    setNanos = jest.fn();
  }
  return {
    OrderEvent: MockOrderEvent,
    OrderFailed: MockOrderFailed,
    EventType: {
      ORDER_FAILED: 2,
    },
    Timestamp: MockTimestamp,
  };
});

describe("producerEventOrderFailed", () => {
  let kafkaMockProducer;
  let consoleLogSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    const { Kafka } = require("kafkajs");
    const kafkaInstance = new Kafka();
    kafkaMockProducer = kafkaInstance.producer();

    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    if (consoleLogSpy) {
      consoleLogSpy.mockRestore();
    }
  });

  describe("produceEventOrderFailed", () => {
    it("should produce order failed event successfully", async () => {
      const {
        OrderEvent,
        OrderFailed,
        EventType,
        Timestamp,
      } = require("../../src/kafka/order_events_pb");

      const orderData = {
        order_id: "order-123",
        items: [
          {
            product_id: "prod-1",
            sku: "sku-1",
            name: "Product 1",
            price: 99.99,
            quantity: 2,
          },
        ],
      };
      const failure_reason = 0; // INVALID_PRODUCT
      const error_message = "Product not found";

      await produceEventOrderFailed(orderData, failure_reason, error_message);

      // Verify Kafka producer operations
      expect(kafkaMockProducer.connect).toHaveBeenCalled();
      expect(kafkaMockProducer.connect).toHaveBeenCalledTimes(1);
      expect(kafkaMockProducer.send).toHaveBeenCalledWith({
        topic: "event-order-failed",
        messages: [{ value: Buffer.from("serialized-failed-event") }],
      });
      expect(kafkaMockProducer.send).toHaveBeenCalledTimes(1);
      expect(kafkaMockProducer.disconnect).toHaveBeenCalled();
      expect(kafkaMockProducer.disconnect).toHaveBeenCalledTimes(1);

      // Verify protobuf object creation
      expect(OrderFailed).toHaveBeenCalled();
      expect(OrderEvent).toHaveBeenCalled();
      expect(Timestamp).toHaveBeenCalled();
    });

    it("should handle different failure reasons", async () => {
      const orderData = {
        order_id: "order-456",
        items: [
          {
            product_id: "prod-2",
            sku: "sku-2",
            name: "Product 2",
            price: 49.99,
            quantity: 1,
          },
        ],
      };
      const failure_reason = 1; // INSUFFICIENT_INVENTORY
      const error_message = "Insufficient stock";

      await produceEventOrderFailed(orderData, failure_reason, error_message);

      expect(kafkaMockProducer.connect).toHaveBeenCalled();
      expect(kafkaMockProducer.send).toHaveBeenCalled();
      expect(kafkaMockProducer.disconnect).toHaveBeenCalled();
    });

    it("should handle order with no items", async () => {
      const orderData = {
        order_id: "order-no-items",
        items: [],
      };
      const failure_reason = 0;
      const error_message = "No items in order";

      await produceEventOrderFailed(orderData, failure_reason, error_message);

      expect(kafkaMockProducer.connect).toHaveBeenCalled();
      expect(kafkaMockProducer.send).toHaveBeenCalled();
      expect(kafkaMockProducer.disconnect).toHaveBeenCalled();
    });

    it("should handle empty error message", async () => {
      const orderData = {
        order_id: "order-empty-error",
        items: [
          {
            product_id: "prod-3",
            sku: "sku-3",
            name: "Product 3",
            price: 25.0,
            quantity: 1,
          },
        ],
      };
      const failure_reason = 0;
      const error_message = "";

      await produceEventOrderFailed(orderData, failure_reason, error_message);

      expect(kafkaMockProducer.connect).toHaveBeenCalled();
      expect(kafkaMockProducer.send).toHaveBeenCalled();
      expect(kafkaMockProducer.disconnect).toHaveBeenCalled();
    });

    it("should handle very long error messages", async () => {
      const orderData = {
        order_id: "order-long-error",
        items: [
          {
            product_id: "prod-4",
            sku: "sku-4",
            name: "Product 4",
            price: 75.0,
            quantity: 1,
          },
        ],
      };
      const failure_reason = 0;
      const error_message = "A".repeat(1000); // Very long error message

      await produceEventOrderFailed(orderData, failure_reason, error_message);

      expect(kafkaMockProducer.connect).toHaveBeenCalled();
      expect(kafkaMockProducer.send).toHaveBeenCalled();
      expect(kafkaMockProducer.disconnect).toHaveBeenCalled();
    });

    it("should handle special characters in error message", async () => {
      const orderData = {
        order_id: "order-special-chars",
        items: [
          {
            product_id: "prod-5",
            sku: "sku-5",
            name: "Product 5",
            price: 150.0,
            quantity: 1,
          },
        ],
      };
      const failure_reason = 0;
      const error_message =
        "Error with special chars: !@#$%^&*()_+-=[]{}|;':\",./<>?";

      await produceEventOrderFailed(orderData, failure_reason, error_message);

      expect(kafkaMockProducer.connect).toHaveBeenCalled();
      expect(kafkaMockProducer.send).toHaveBeenCalled();
      expect(kafkaMockProducer.disconnect).toHaveBeenCalled();
    });

    it("should handle producer connection errors", async () => {
      const error = new Error("Kafka connection failed");
      kafkaMockProducer.connect.mockRejectedValue(error);

      const orderData = {
        order_id: "order-conn-error",
        items: [
          {
            product_id: "prod-6",
            sku: "sku-6",
            name: "Product 6",
            price: 200.0,
            quantity: 1,
          },
        ],
      };
      const failure_reason = 0;
      const error_message = "Connection failed";

      await expect(
        produceEventOrderFailed(orderData, failure_reason, error_message)
      ).rejects.toThrow("Kafka connection failed");

      expect(kafkaMockProducer.connect).toHaveBeenCalled();
      expect(kafkaMockProducer.send).not.toHaveBeenCalled();
      expect(kafkaMockProducer.disconnect).not.toHaveBeenCalled();
    });

    it("should handle producer send errors", async () => {
      const error = new Error("Kafka send failed");
      kafkaMockProducer.send.mockRejectedValue(error);

      const orderData = {
        order_id: "order-send-error",
        items: [
          {
            product_id: "prod-7",
            sku: "sku-7",
            name: "Product 7",
            price: 300.0,
            quantity: 1,
          },
        ],
      };
      const failure_reason = 0;
      const error_message = "Send failed";

      await expect(
        produceEventOrderFailed(orderData, failure_reason, error_message)
      ).rejects.toThrow("Kafka send failed");

      expect(kafkaMockProducer.connect).toHaveBeenCalled();
      expect(kafkaMockProducer.send).toHaveBeenCalled();
      expect(kafkaMockProducer.disconnect).not.toHaveBeenCalled();
    });

    it("should handle producer disconnect errors", async () => {
      const error = new Error("Kafka disconnect failed");
      kafkaMockProducer.disconnect.mockRejectedValue(error);

      const orderData = {
        order_id: "order-disconnect-error",
        items: [
          {
            product_id: "prod-8",
            sku: "sku-8",
            name: "Product 8",
            price: 400.0,
            quantity: 1,
          },
        ],
      };
      const failure_reason = 0;
      const error_message = "Disconnect failed";

      await expect(
        produceEventOrderFailed(orderData, failure_reason, error_message)
      ).rejects.toThrow("Kafka disconnect failed");

      expect(kafkaMockProducer.connect).toHaveBeenCalled();
      expect(kafkaMockProducer.send).toHaveBeenCalled();
      expect(kafkaMockProducer.disconnect).toHaveBeenCalled();
    });

    it("should handle undefined order data", async () => {
      const orderData = undefined;
      const failure_reason = 0;
      const error_message = "Undefined order";

      await expect(
        produceEventOrderFailed(orderData, failure_reason, error_message)
      ).rejects.toThrow();

      expect(kafkaMockProducer.connect).toHaveBeenCalled();
    });

    it("should handle null order data", async () => {
      const orderData = null;
      const failure_reason = 0;
      const error_message = "Null order";

      await expect(
        produceEventOrderFailed(orderData, failure_reason, error_message)
      ).rejects.toThrow();

      expect(kafkaMockProducer.connect).toHaveBeenCalled();
    });

    it("should handle undefined failure reason", async () => {
      const orderData = {
        order_id: "order-undefined-reason",
        items: [
          {
            product_id: "prod-9",
            sku: "sku-9",
            name: "Product 9",
            price: 500.0,
            quantity: 1,
          },
        ],
      };
      const failure_reason = undefined;
      const error_message = "Undefined reason";

      await produceEventOrderFailed(orderData, failure_reason, error_message);

      expect(kafkaMockProducer.connect).toHaveBeenCalled();
      expect(kafkaMockProducer.send).toHaveBeenCalled();
      expect(kafkaMockProducer.disconnect).toHaveBeenCalled();
    });

    it("should handle undefined error message", async () => {
      const orderData = {
        order_id: "order-undefined-error",
        items: [
          {
            product_id: "prod-10",
            sku: "sku-10",
            name: "Product 10",
            price: 600.0,
            quantity: 1,
          },
        ],
      };
      const failure_reason = 0;
      const error_message = undefined;

      await produceEventOrderFailed(orderData, failure_reason, error_message);

      expect(kafkaMockProducer.connect).toHaveBeenCalled();
      expect(kafkaMockProducer.send).toHaveBeenCalled();
      expect(kafkaMockProducer.disconnect).toHaveBeenCalled();
    });

    it("should handle all undefined parameters", async () => {
      const orderData = undefined;
      const failure_reason = undefined;
      const error_message = undefined;

      await expect(
        produceEventOrderFailed(orderData, failure_reason, error_message)
      ).rejects.toThrow();

      expect(kafkaMockProducer.connect).toHaveBeenCalled();
    });

    it("should handle large order IDs", async () => {
      const orderData = {
        order_id: "order-" + "A".repeat(100), // Very long order ID
        items: [
          {
            product_id: "prod-11",
            sku: "sku-11",
            name: "Product 11",
            price: 700.0,
            quantity: 1,
          },
        ],
      };
      const failure_reason = 0;
      const error_message = "Large order ID";

      await produceEventOrderFailed(orderData, failure_reason, error_message);

      expect(kafkaMockProducer.connect).toHaveBeenCalled();
      expect(kafkaMockProducer.send).toHaveBeenCalled();
      expect(kafkaMockProducer.disconnect).toHaveBeenCalled();
    });

    it("should handle negative failure reason", async () => {
      const orderData = {
        order_id: "order-negative-reason",
        items: [
          {
            product_id: "prod-12",
            sku: "sku-12",
            name: "Product 12",
            price: 800.0,
            quantity: 1,
          },
        ],
      };
      const failure_reason = -1;
      const error_message = "Negative reason";

      await produceEventOrderFailed(orderData, failure_reason, error_message);

      expect(kafkaMockProducer.connect).toHaveBeenCalled();
      expect(kafkaMockProducer.send).toHaveBeenCalled();
      expect(kafkaMockProducer.disconnect).toHaveBeenCalled();
    });
  });
});
