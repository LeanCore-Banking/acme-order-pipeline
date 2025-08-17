const { Kafka } = require("kafkajs");
const { OrderEvent, EventType } = require("./order_events_pb");
const { processEventOrderCreated } = require("../services/ordersService");
const { processEventOrder } = require("../services/ordersService");

const kafka = new Kafka({
  clientId: "orders",
  brokers: ["kafka:29092"],
});

const consumer = kafka.consumer({ groupId: "orders-group" });
const TOPIC = "event-order-confirmed";

async function processEvent(eventBuffer) {
  try {
    const event = OrderEvent.deserializeBinary(eventBuffer);
    const eventType = event.getEventType();

    if (eventType === EventType.ORDER_CONFIRMED) {
      const orderData = {
        event_id: event.getEventId(),
        order_id: event.getOrderId(),
      };
      await processEventOrder(orderData, "confirmed");
    }
  } catch (err) {
    console.error(`Error when processing event ${TOPIC}:`, err);
  }
}

async function listenEventOrderConfirmed() {
  await consumer.connect();
  await consumer.subscribe({
    topic: TOPIC,
    fromBeginning: true,
  });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      if (topic === TOPIC) {
        await processEvent(message.value);
      }
    },
  });
}

module.exports = {
  listenEventOrderConfirmed,
};
