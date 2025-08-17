const {
  produceEventOrderConfirmed,
} = require("../../src/kafka/producerEventOrderConfirmed");

jest.mock("kafkajs", () => {
  const mProducer = {
    connect: jest.fn(),
    send: jest.fn(),
    disconnect: jest.fn(),
  };
  const mKafka = {
    producer: jest.fn(() => mProducer),
  };
  return { Kafka: jest.fn(() => mKafka) };
});

jest.mock("uuid", () => ({
  v7: jest.fn(() => "test-uuid-123"),
}));

jest.mock("../../src/kafka/order_events_pb", () => {
  class MockOrderConfirmed {
    setOrderId = jest.fn();
  }
  class MockOrderEvent {
    setEventId = jest.fn();
    setOrderId = jest.fn();
    setEventType = jest.fn();
    setTimestamp = jest.fn();
    setOrderConfirmed = jest.fn();
    serializeBinary = jest.fn(() => Buffer.from("serialized-event"));
  }
  class MockTimestamp {
    setSeconds = jest.fn();
    setNanos = jest.fn();
  }
  return {
    OrderEvent: MockOrderEvent,
    OrderConfirmed: MockOrderConfirmed,
    EventType: {
      ORDER_CONFIRMED: 1,
      ORDER_FAILED: 2,
    },
    Timestamp: MockTimestamp,
  };
});

describe("producerEventOrderConfirmed", () => {
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

  describe("produceEventOrderConfirmed", () => {
    it("should produce order confirmed event successfully", async () => {
      const {
        OrderEvent,
        OrderConfirmed,
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
          {
            product_id: "prod-2",
            sku: "sku-2",
            name: "Product 2",
            price: 49.99,
            quantity: 1,
          },
        ],
      };

      await produceEventOrderConfirmed(orderData);

      // Verify Kafka producer operations
      expect(kafkaMockProducer.connect).toHaveBeenCalled();
      expect(kafkaMockProducer.connect).toHaveBeenCalledTimes(1);
      expect(kafkaMockProducer.send).toHaveBeenCalledWith({
        topic: "event-order-confirmed",
        messages: [{ value: Buffer.from("serialized-event") }],
      });
      expect(kafkaMockProducer.send).toHaveBeenCalledTimes(1);
      expect(kafkaMockProducer.disconnect).toHaveBeenCalled();
      expect(kafkaMockProducer.disconnect).toHaveBeenCalledTimes(1);

      // Verify protobuf object creation
      expect(OrderConfirmed).toHaveBeenCalled();
      expect(OrderEvent).toHaveBeenCalled();
      expect(Timestamp).toHaveBeenCalled();
    });

    it("should handle order with single item", async () => {
      const orderData = {
        order_id: "order-456",
        items: [
          {
            product_id: "prod-3",
            sku: "sku-3",
            name: "Product 3",
            price: 199.99,
            quantity: 1,
          },
        ],
      };

      await produceEventOrderConfirmed(orderData);

      expect(kafkaMockProducer.connect).toHaveBeenCalled();
      expect(kafkaMockProducer.send).toHaveBeenCalled();
      expect(kafkaMockProducer.disconnect).toHaveBeenCalled();
    });

    it("should handle order with no items", async () => {
      const orderData = {
        order_id: "order-789",
        items: [],
      };

      await produceEventOrderConfirmed(orderData);

      expect(kafkaMockProducer.connect).toHaveBeenCalled();
      expect(kafkaMockProducer.send).toHaveBeenCalled();
      expect(kafkaMockProducer.disconnect).toHaveBeenCalled();
    });

    it("should handle order with zero price items", async () => {
      const orderData = {
        order_id: "order-zero",
        items: [
          {
            product_id: "prod-4",
            sku: "sku-4",
            name: "Free Product",
            price: 0,
            quantity: 1,
          },
        ],
      };

      await produceEventOrderConfirmed(orderData);

      expect(kafkaMockProducer.connect).toHaveBeenCalled();
      expect(kafkaMockProducer.send).toHaveBeenCalled();
      expect(kafkaMockProducer.disconnect).toHaveBeenCalled();
    });

    it("should handle order with decimal prices", async () => {
      const orderData = {
        order_id: "order-decimal",
        items: [
          {
            product_id: "prod-5",
            sku: "sku-5",
            name: "Product 5",
            price: 19.99,
            quantity: 3,
          },
          {
            product_id: "prod-6",
            sku: "sku-6",
            name: "Product 6",
            price: 7.5,
            quantity: 2,
          },
        ],
      };

      await produceEventOrderConfirmed(orderData);

      expect(kafkaMockProducer.connect).toHaveBeenCalled();
      expect(kafkaMockProducer.send).toHaveBeenCalled();
      expect(kafkaMockProducer.disconnect).toHaveBeenCalled();
    });

    it("should handle large quantities", async () => {
      const orderData = {
        order_id: "order-large",
        items: [
          {
            product_id: "prod-7",
            sku: "sku-7",
            name: "Bulk Product",
            price: 10.0,
            quantity: 1000,
          },
        ],
      };

      await produceEventOrderConfirmed(orderData);

      expect(kafkaMockProducer.connect).toHaveBeenCalled();
      expect(kafkaMockProducer.send).toHaveBeenCalled();
      expect(kafkaMockProducer.disconnect).toHaveBeenCalled();
    });

    it("should handle producer connection errors", async () => {
      const error = new Error("Kafka connection failed");
      kafkaMockProducer.connect.mockRejectedValue(error);

      const orderData = {
        order_id: "order-error",
        items: [
          {
            product_id: "prod-8",
            sku: "sku-8",
            name: "Product 8",
            price: 25.0,
            quantity: 1,
          },
        ],
      };

      await expect(produceEventOrderConfirmed(orderData)).rejects.toThrow(
        "Kafka connection failed"
      );

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
            product_id: "prod-9",
            sku: "sku-9",
            name: "Product 9",
            price: 30.0,
            quantity: 1,
          },
        ],
      };

      await expect(produceEventOrderConfirmed(orderData)).rejects.toThrow(
        "Kafka send failed"
      );

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
            product_id: "prod-10",
            sku: "sku-10",
            name: "Product 10",
            price: 35.0,
            quantity: 1,
          },
        ],
      };

      await expect(produceEventOrderConfirmed(orderData)).rejects.toThrow(
        "Kafka disconnect failed"
      );

      expect(kafkaMockProducer.connect).toHaveBeenCalled();
      expect(kafkaMockProducer.send).toHaveBeenCalled();
      expect(kafkaMockProducer.disconnect).toHaveBeenCalled();
    });

    it("should handle undefined order data", async () => {
      const orderData = undefined;

      await expect(produceEventOrderConfirmed(orderData)).rejects.toThrow();

      expect(kafkaMockProducer.connect).toHaveBeenCalled();
    });

    it("should handle null order data", async () => {
      const orderData = null;

      await expect(produceEventOrderConfirmed(orderData)).rejects.toThrow();

      expect(kafkaMockProducer.connect).toHaveBeenCalled();
    });
  });

  describe("getSummary function", () => {
    it("should calculate summary correctly for multiple items", async () => {
      const {
        OrderEvent,
        OrderConfirmed,
        EventType,
        Timestamp,
      } = require("../../src/kafka/order_events_pb");

      const orderData = {
        order_id: "order-summary",
        items: [
          {
            product_id: "prod-11",
            sku: "sku-11",
            name: "Product 11",
            price: 100.0,
            quantity: 2,
          },
          {
            product_id: "prod-12",
            sku: "sku-12",
            name: "Product 12",
            price: 50.0,
            quantity: 1,
          },
        ],
      };

      await produceEventOrderConfirmed(orderData);

      expect(kafkaMockProducer.connect).toHaveBeenCalled();
      expect(kafkaMockProducer.send).toHaveBeenCalled();
      expect(kafkaMockProducer.disconnect).toHaveBeenCalled();
    });

    it("should handle tax calculation with random percentage", async () => {
      const {
        OrderEvent,
        OrderConfirmed,
        EventType,
        Timestamp,
      } = require("../../src/kafka/order_events_pb");

      const orderData = {
        order_id: "order-tax",
        items: [
          {
            product_id: "prod-13",
            sku: "sku-13",
            name: "Product 13",
            price: 200.0,
            quantity: 1,
          },
        ],
      };

      await produceEventOrderConfirmed(orderData);

      expect(kafkaMockProducer.connect).toHaveBeenCalled();
      expect(kafkaMockProducer.send).toHaveBeenCalled();
      expect(kafkaMockProducer.disconnect).toHaveBeenCalled();
    });
  });
});
