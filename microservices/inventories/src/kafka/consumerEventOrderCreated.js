const { Kafka } = require("kafkajs");
const { OrderEvent, EventType } = require("./order_events_pb");
const { processEventOrderCreated } = require("../services/inventoriesService");

const kafka = new Kafka({
  clientId: "inventories",
  brokers: ["kafka:29092"],
});

const consumer = kafka.consumer({ groupId: "inventories-group" });
const TOPIC = "event-order-created";

async function processEvent(eventBuffer) {
  try {
    const event = OrderEvent.deserializeBinary(eventBuffer);
    const eventType = event.getEventType();

    if (eventType === EventType.ORDER_CREATED) {
      const orderCreated = event.getOrderCreated();
      const orderData = {
        event_id: event.getEventId(),
        order_id: event.getOrderId(),
        customer: {
          user_id: orderCreated.getCustomer().getUserId(),
          email: orderCreated.getCustomer().getEmail(),
        },
        items: orderCreated.getItemsList().map((item) => ({
          product_id: item.getProductId(),
          sku: item.getSku(),
          name: item.getName(),
          price: item.getPrice(),
          quantity: item.getQuantity(),
        })),
      };
      await processEventOrderCreated(orderData);
    }
  } catch (err) {
    console.error(`Error when processing event ${TOPIC}:`, err);
  }
}

async function listenEventOrderCreated() {
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
  listenEventOrderCreated,
};
