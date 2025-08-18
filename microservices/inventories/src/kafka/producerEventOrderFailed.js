const { v7 } = require("uuid");
const { Kafka } = require("kafkajs");
const { OrderEvent, EventType, OrderFailed } = require("./order_events_pb");
const { Timestamp } = require("google-protobuf/google/protobuf/timestamp_pb");

const kafka = new Kafka({
  clientId: "orders",
  brokers: ["kafka:29092"],
});

const producer = kafka.producer();
const TOPIC = "event-order-failed";

async function produceEventOrderFailed(
  orderData,
  failure_reason,
  error_message
) {
  const orderFailed = new OrderFailed();
  orderFailed.setOrderId(orderData.order_id);
  orderFailed.setReason(failure_reason);
  orderFailed.setErrorMessage(error_message);

  const event = new OrderEvent();
  event.setEventId(v7());
  event.setOrderId(orderData.order_id);
  event.setEventType(EventType.ORDER_FAILED);

  const ts = new Timestamp();
  const jsDate = new Date();
  ts.setSeconds(Math.floor(jsDate.getTime() / 1000));
  ts.setNanos(jsDate.getMilliseconds() * 1e6);
  event.setTimestamp(ts);

  event.setOrderFailed(orderFailed);

  const serialized = event.serializeBinary();

  await producer.connect();
  await producer.send({
    topic: TOPIC,
    messages: [{ value: Buffer.from(serialized) }],
  });
  await producer.disconnect();
}

module.exports = {
  produceEventOrderFailed,
};
