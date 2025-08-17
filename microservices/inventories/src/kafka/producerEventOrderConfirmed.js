const { v7 } = require("uuid");
const { Kafka } = require("kafkajs");
const { OrderEvent, OrderConfirmed, EventType } = require("./order_events_pb");
const { Timestamp } = require("google-protobuf/google/protobuf/timestamp_pb");

const kafka = new Kafka({
  clientId: "orders",
  brokers: ["kafka:29092"],
});

const producer = kafka.producer();
const TOPIC = "event-order-confirmed";

function applyRandomPercent(num) {
  const percent = Math.floor(Math.random() * 10) + 1;
  const result = num * (percent / 100);
  return result;
}

function getSummary(items) {
  const subtotal = items.reduce((acc, cur) => {
    return (acc += cur.quantity * cur.price);
  }, 0);
  const tax = applyRandomPercent(subtotal);
  const total = subtotal + tax;
  return {
    subtotal: Number(subtotal.toFixed(2)),
    tax_amount: Number(tax.toFixed(2)),
    total_amount: Number(total.toFixed(2)),
  };
}

async function produceEventOrderConfirmed(orderData) {
  const summary = getSummary(orderData.items);
  const orderConfirmed = new OrderConfirmed();
  orderConfirmed.setOrderId(orderData.order_id);
  // orderConfirmed.setSummary(JSON.stringify(summary));

  const event = new OrderEvent();
  event.setEventId(v7());
  event.setOrderId(orderData.order_id);
  event.setEventType(EventType.ORDER_FAILED);

  const ts = new Timestamp();
  const jsDate = new Date();
  ts.setSeconds(Math.floor(jsDate.getTime() / 1000));
  ts.setNanos(jsDate.getMilliseconds() * 1e6);
  event.setTimestamp(ts);

  event.setOrderConfirmed(orderConfirmed);

  const serialized = event.serializeBinary();

  await producer.connect();
  await producer.send({
    topic: TOPIC,
    messages: [{ value: Buffer.from(serialized) }],
  });
  await producer.disconnect();
}

module.exports = {
  produceEventOrderConfirmed,
};
