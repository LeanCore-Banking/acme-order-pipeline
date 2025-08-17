const { v7 } = require("uuid");
const { Kafka } = require("kafkajs");
const {
  OrderEvent,
  OrderCreated,
  EventType,
  Customer,
  OrderItem,
} = require("./order_events_pb");
const { Timestamp } = require("google-protobuf/google/protobuf/timestamp_pb");

const kafka = new Kafka({
  clientId: "orders",
  brokers: ["kafka:29092"],
});

const producer = kafka.producer();
const TOPIC = "event-order-created";

async function produceEventOrderCreated(orderData) {
  const orderCreated = new OrderCreated();
  orderCreated.setOrderId(orderData.order_id);

  const customer = new Customer();
  customer.setUserId(orderData.customer.user_id);
  customer.setEmail(orderData.customer.email);
  orderCreated.setCustomer(customer);

  const itemsList = orderData.items.map((itemData) => {
    const item = new OrderItem();
    item.setProductId(itemData.product_id);
    item.setSku(itemData.sku);
    item.setName(itemData.name);
    item.setPrice(itemData.price);
    item.setQuantity(itemData.quantity);
    return item;
  });
  orderCreated.setItemsList(itemsList);

  const event = new OrderEvent();
  event.setEventId(v7());
  event.setOrderId(orderData.order_id);
  event.setEventType(EventType.ORDER_CREATED);

  const ts = new Timestamp();
  const jsDate = new Date();
  ts.setSeconds(Math.floor(jsDate.getTime() / 1000));
  ts.setNanos(jsDate.getMilliseconds() * 1e6);
  event.setTimestamp(ts);

  event.setOrderCreated(orderCreated);

  const serialized = event.serializeBinary();

  await producer.connect();
  await producer.send({
    topic: TOPIC,
    messages: [{ value: Buffer.from(serialized) }],
  });
  await producer.disconnect();
}

module.exports = {
  produceEventOrderCreated,
};
