const {
  produceEventOrderCreated,
} = require("../../src/kafka/producerEventOrderCreated");

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
  v7: jest.fn(() => "dummy-uuid"),
}));

jest.mock("../../src/kafka/order_events_pb", () => {
  const OrderCreated = jest.fn().mockImplementation(() => ({
    setOrderId: jest.fn(),
    setCustomer: jest.fn(),
    setItemsList: jest.fn(),
  }));
  const Customer = jest.fn(() => ({
    setUserId: jest.fn(),
    setEmail: jest.fn(),
  }));
  const OrderItem = jest.fn(() => ({
    setProductId: jest.fn(),
    setSku: jest.fn(),
    setName: jest.fn(),
    setPrice: jest.fn(),
    setQuantity: jest.fn(),
  }));
  const OrderEvent = jest.fn(() => ({
    setEventId: jest.fn(),
    setOrderId: jest.fn(),
    setEventType: jest.fn(),
    setTimestamp: jest.fn(),
    setOrderCreated: jest.fn(),
    serializeBinary: jest.fn(() => Uint8Array.from([1, 2, 3])),
  }));
  return {
    OrderEvent,
    OrderCreated,
    EventType: { ORDER_CREATED: 0 },
    Customer,
    OrderItem,
  };
});

jest.mock("google-protobuf/google/protobuf/timestamp_pb", () => {
  return {
    Timestamp: jest.fn().mockImplementation(() => ({
      setSeconds: jest.fn(),
      setNanos: jest.fn(),
    })),
  };
});

describe.skip("produceEventOrderCreated", () => {
  let mockProducer;

  beforeEach(() => {
    jest.clearAllMocks();
    const { Kafka } = require("kafkajs");
    const kafkaInstance = new Kafka();
    mockProducer = kafkaInstance.producer();
  });

  it("should build and send the correct event message", async () => {
    const orderData = {
      order_id: "order-123",
      customer: {
        user_id: "user-1",
        email: "user@example.com",
      },
      items: [
        {
          product_id: "prod-1",
          sku: "sku-1",
          name: "Product 1",
          price: 100.5,
          quantity: 2,
        },
        {
          product_id: "prod-2",
          sku: "sku-2",
          name: "Product 2",
          price: 50,
          quantity: 1,
        },
      ],
    };

    await produceEventOrderCreated(orderData);

    expect(mockProducer.connect).toHaveBeenCalledTimes(1);

    expect(mockProducer.send).toHaveBeenCalledTimes(1);
    const sendArg = mockProducer.send.mock.calls[0][0];
    expect(sendArg.topic).toBe("event-order-created");
    expect(sendArg.messages).toHaveLength(1);
    expect(sendArg.messages[0].value).toBeInstanceOf(Buffer);

    expect(mockProducer.disconnect).toHaveBeenCalledTimes(1);

    const {
      OrderCreated,
      Customer,
      OrderItem,
      OrderEvent,
      EventType,
    } = require("../../src/kafka/order_events_pb");
    const {
      Timestamp,
    } = require("google-protobuf/google/protobuf/timestamp_pb");

    const orderCreatedInstance = OrderCreated.mock.instances[0];
    expect(orderCreatedInstance.setOrderId).toHaveBeenCalled();

    const customerInstance = Customer.mock.instances[0];
    expect(customerInstance.setUserId).toHaveBeenCalledWith(
      orderData.customer.user_id
    );
    expect(customerInstance.setEmail).toHaveBeenCalledWith(
      orderData.customer.email
    );
    expect(orderCreatedInstance.setCustomer).toHaveBeenCalledWith(
      customerInstance
    );

    const itemsInstances = OrderItem.mock.instances;
    expect(itemsInstances.length).toBe(orderData.items.length);
    orderData.items.forEach((itemData, index) => {
      const itemInstance = itemsInstances[index];
      expect(itemInstance.setProductId).toHaveBeenCalledWith(
        itemData.product_id
      );
      expect(itemInstance.setSku).toHaveBeenCalledWith(itemData.sku);
      expect(itemInstance.setName).toHaveBeenCalledWith(itemData.name);
      expect(itemInstance.setPrice).toHaveBeenCalledWith(itemData.price);
      expect(itemInstance.setQuantity).toHaveBeenCalledWith(itemData.quantity);
    });
    expect(orderCreatedInstance.setItemsList).toHaveBeenCalledWith(
      itemsInstances
    );

    const orderEventInstance = OrderEvent.mock.instances[0];
    expect(orderEventInstance.setEventId).toHaveBeenCalledWith("dummy-uuid");
    expect(orderEventInstance.setOrderId).toHaveBeenCalledWith(
      orderData.order_id
    );
    expect(orderEventInstance.setEventType).toHaveBeenCalledWith(
      EventType.ORDER_CREATED
    );

    expect(Timestamp).toHaveBeenCalled();
    const tsInstance = Timestamp.mock.results[0].value;
    expect(tsInstance.setSeconds).toHaveBeenCalled();
    expect(tsInstance.setNanos).toHaveBeenCalled();
    expect(orderEventInstance.setTimestamp).toHaveBeenCalledWith(tsInstance);

    expect(orderEventInstance.setOrderCreated).toHaveBeenCalledWith(
      orderCreatedInstance
    );

    expect(orderEventInstance.serializeBinary).toHaveBeenCalled();
  });
});
