const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "monitor",
  brokers: ["localhost:9092"],
});

const consumer = kafka.consumer({ groupId: "monitor-group" });

async function monitorAllTopics() {
  const topics = [
    "event-order-created",
    "event-order-confirmed",
    "event-order-failed",
  ];

  await consumer.connect();

  for (const topic of topics) {
    await consumer.subscribe({ topic, fromBeginning: false });
  }

  console.log("🔍 Monitoreando eventos de Kafka...");
  console.log("📋 Topics:", topics.join(", "));
  console.log("=".repeat(60));

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const timestamp = new Date().toISOString();
      console.log(`\n⏰ [${timestamp}]`);
      console.log(`📨 Topic: ${topic}`);
      console.log(`📊 Partition: ${partition}`);
      console.log(`🔑 Key: ${message.key || "N/A"}`);
      console.log(`📝 Value: ${message.value.toString()}`);
      console.log("-".repeat(40));
    },
  });
}

monitorAllTopics().catch(console.error);

// Manejar cierre graceful
process.on("SIGINT", async () => {
  console.log("\n🛑 Deteniendo monitor...");
  await consumer.disconnect();
  process.exit(0);
});
