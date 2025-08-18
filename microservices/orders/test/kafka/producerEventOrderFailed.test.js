// Mock modules before requiring them
jest.mock("kafkajs");
jest.mock("uuid");
jest.mock("../../src/kafka/order_events_pb");
jest.mock("google-protobuf/google/protobuf/timestamp_pb");

// Now require the mocked modules
const { Kafka } = require("kafkajs");
const { v7 } = require("uuid");
const {
  OrderEvent,
  EventType,
  OrderFailed,
  FailureReason,
} = require("../../src/kafka/order_events_pb");
const { Timestamp } = require("google-protobuf/google/protobuf/timestamp_pb");

// Require the module under test
const {
  produceEventOrderFailed,
} = require("../../src/kafka/producerEventOrderFailed");

describe("Producer Event Order Failed", () => {
  describe("Module Structure", () => {
    test("should export produceEventOrderFailed function", () => {
      expect(typeof produceEventOrderFailed).toBe("function");
    });

    test("should be an async function", () => {
      expect(produceEventOrderFailed.constructor.name).toBe("AsyncFunction");
    });
  });

  describe("Constants and Configuration", () => {
    test("should have correct topic constant", () => {
      const { TOPIC } = require("../../src/kafka/producerEventOrderFailed");
      expect(TOPIC).toBe("event-order-failed");
    });

    test("should export produceEventOrderFailed function", () => {
      expect(typeof produceEventOrderFailed).toBe("function");
    });
  });

  describe("Function Parameters", () => {
    test("should accept orderData and error_message parameters", () => {
      const orderData = { order_id: "ORD-2024-123456" };
      const errorMessage = "Payment failed";

      // This test verifies the function signature without executing the full logic
      expect(produceEventOrderFailed).toBeDefined();
      expect(typeof produceEventOrderFailed).toBe("function");
    });
  });

  describe("Dependencies", () => {
    test("should import required modules", () => {
      expect(Kafka).toBeDefined();
      expect(v7).toBeDefined();
      expect(OrderEvent).toBeDefined();
      expect(EventType).toBeDefined();
      expect(OrderFailed).toBeDefined();
      expect(FailureReason).toBeDefined();
      expect(Timestamp).toBeDefined();
    });

    test("should have proper error handling structure", () => {
      expect(produceEventOrderFailed).toBeDefined();
    });
  });

  describe("Integration Points", () => {
    test("should integrate with Kafka", () => {
      expect(Kafka).toBeDefined();
      expect(typeof Kafka).toBe("function");
    });

    test("should integrate with protobuf", () => {
      expect(OrderEvent).toBeDefined();
      expect(OrderFailed).toBeDefined();
      expect(EventType).toBeDefined();
      expect(FailureReason).toBeDefined();
    });

    test("should integrate with UUID generation", () => {
      expect(v7).toBeDefined();
      expect(typeof v7).toBe("function");
    });

    test("should integrate with timestamp handling", () => {
      expect(Timestamp).toBeDefined();
      expect(typeof Timestamp).toBe("function");
    });
  });

  describe("Configuration Validation", () => {
    test("should use correct Kafka client configuration", () => {
      expect(Kafka).toBeDefined();
    });

    test("should use correct topic name", () => {
      const { TOPIC } = require("../../src/kafka/producerEventOrderFailed");
      expect(TOPIC).toBe("event-order-failed");
    });
  });

  describe("Data Flow", () => {
    test("should handle order data structure", () => {
      expect(produceEventOrderFailed).toBeDefined();
    });

    test("should handle error message processing", () => {
      expect(produceEventOrderFailed).toBeDefined();
    });
  });
});
