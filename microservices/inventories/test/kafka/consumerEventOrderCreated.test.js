const { listenEventOrderCreated } = require("../inventoriesConsumer");

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

jest.mock("../order_events_pb", () => {
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

describe.skip("listenEventOrderCreated", () => {
  let kafkaMockConsumer;

  beforeEach(() => {
    jest.clearAllMocks();
    const { Kafka } = require("kafkajs");
    const kafkaInstance = new Kafka();
    kafkaMockConsumer = kafkaInstance.consumer();
  });

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
    expect(kafkaMockConsumer.subscribe).toHaveBeenCalledWith({
      topic: "event-order-created",
      fromBeginning: true,
    });
    expect(kafkaMockConsumer.run).toHaveBeenCalled();

    const { OrderEvent } = require("../order_events_pb");

    expect(OrderEvent.deserializeBinary).toHaveBeenCalled();
  });

  it("should call processEvent and log output for ORDER_CREATED event", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

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

    expect(consoleSpy).toHaveBeenCalledWith(
      "ORDER_CREATED:",
      expect.objectContaining({
        event_id: "event-uuid-1",
        order_id: "order-123",
        customer: expect.objectContaining({
          user_id: "user-123",
          email: "user@example.com",
        }),
        items: expect.any(Array),
      })
    );

    consoleSpy.mockRestore();
  });
});
