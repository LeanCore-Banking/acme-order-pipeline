jest.mock("kafkajs");
jest.mock("../../src/kafka/order_events_pb");
jest.mock("../../src/services/ordersService");

const { OrderEvent, EventType } = require("../../src/kafka/order_events_pb");
const { processEventOrder } = require("../../src/services/ordersService");

const consumerModule = require("../../src/kafka/consumerEventOrderFailed");

describe("Consumer Event Order Failed", () => {
  let mockOrderEvent;
  let mockOrderFailed;

  beforeEach(() => {
    jest.clearAllMocks();

    mockOrderFailed = {
      getReason: jest.fn().mockReturnValue("Payment failed"),
      getErrorMessage: jest.fn().mockReturnValue("Insufficient funds"),
    };

    mockOrderEvent = {
      getEventType: jest.fn().mockReturnValue(EventType.ORDER_FAILED),
      getEventId: jest.fn().mockReturnValue("evt_123456"),
      getOrderId: jest.fn().mockReturnValue("ORD-2024-123456"),
      getOrderFailed: jest.fn().mockReturnValue(mockOrderFailed),
    };

    OrderEvent.deserializeBinary = jest.fn().mockReturnValue(mockOrderEvent);
  });

  describe("processEvent function", () => {
    test("should process ORDER_FAILED event successfully", async () => {
      const eventBuffer = Buffer.from("serialized_event");

      await consumerModule.processEvent(eventBuffer);

      expect(OrderEvent.deserializeBinary).toHaveBeenCalledWith(eventBuffer);
      expect(mockOrderEvent.getEventType).toHaveBeenCalled();
      expect(mockOrderEvent.getEventId).toHaveBeenCalled();
      expect(mockOrderEvent.getOrderId).toHaveBeenCalled();
      expect(mockOrderEvent.getOrderFailed).toHaveBeenCalled();
      expect(mockOrderFailed.getReason).toHaveBeenCalled();
      expect(mockOrderFailed.getErrorMessage).toHaveBeenCalled();
      expect(processEventOrder).toHaveBeenCalledWith(
        {
          event_id: "evt_123456",
          order_id: "ORD-2024-123456",
          reason: "Payment failed",
          error_message: "Insufficient funds",
        },
        "failed"
      );
    });

    test("should not process non-ORDER_FAILED events", async () => {
      mockOrderEvent.getEventType.mockReturnValue(EventType.ORDER_CREATED);

      const eventBuffer = Buffer.from("serialized_event");

      await consumerModule.processEvent(eventBuffer);

      expect(OrderEvent.deserializeBinary).toHaveBeenCalledWith(eventBuffer);
      expect(mockOrderEvent.getEventType).toHaveBeenCalled();
      expect(processEventOrder).not.toHaveBeenCalled();
    });

    test("should handle protobuf deserialization errors gracefully", async () => {
      const deserializationError = new Error("Protobuf deserialization failed");
      OrderEvent.deserializeBinary.mockImplementation(() => {
        throw deserializationError;
      });

      const eventBuffer = Buffer.from("invalid_event");

      const originalConsoleError = console.error;
      console.error = jest.fn();

      await consumerModule.processEvent(eventBuffer);

      expect(console.error).toHaveBeenCalledWith(
        "Error when processing event event-order-failed:",
        deserializationError
      );

      console.error = originalConsoleError;
    });

    test("should handle processEventOrder errors gracefully", async () => {
      const processError = new Error("Process event failed");
      processEventOrder.mockRejectedValue(processError);

      const eventBuffer = Buffer.from("serialized_event");

      const originalConsoleError = console.error;
      console.error = jest.fn();

      await consumerModule.processEvent(eventBuffer);

      expect(console.error).toHaveBeenCalledWith(
        "Error when processing event event-order-failed:",
        processError
      );

      console.error = originalConsoleError;
    });

    test("should handle missing order failed data gracefully", async () => {
      mockOrderEvent.getOrderFailed.mockReturnValue(null);

      const eventBuffer = Buffer.from("serialized_event");

      const originalConsoleError = console.error;
      console.error = jest.fn();

      await consumerModule.processEvent(eventBuffer);

      expect(console.error).toHaveBeenCalledWith(
        "Error when processing event event-order-failed:",
        expect.any(Error)
      );

      console.error = originalConsoleError;
    });
  });

  describe("Constants and Configuration", () => {
    test("should have correct topic constant", () => {
      expect(consumerModule.TOPIC).toBe("event-order-failed");
    });

    test("should export processEvent function", () => {
      expect(typeof consumerModule.processEvent).toBe("function");
    });

    test("should export listenEventOrderFailed function", () => {
      expect(typeof consumerModule.listenEventOrderFailed).toBe("function");
    });
  });
});
