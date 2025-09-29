import json
from kafka import KafkaProducer
from apps.common.config.base import BaseAppSettings

settings = BaseAppSettings()

class EventBusKafkaImpl:
    def __init__(self) -> None:
        brokers = [s.strip() for s in settings.kafka_brokers.split(",")]
        self.topic = settings.kafka_topic_orders_created

        self.producer = KafkaProducer(
            bootstrap_servers=brokers,
            value_serializer=lambda v: json.dumps(v).encode("utf-8"),
            key_serializer=lambda v: v.encode("utf-8") if isinstance(v, str) else v,
            acks="all",
        )
        print(f"[PUB READY] brokers={brokers} topic={self.topic}")

    def publish_order_created(self, order_id: str, customer: dict, items: list[dict]) -> None:
        payload = {
            "type": "ORDER_CREATED",
            "order_id": order_id,
            "customer": customer,
            "items": items,
        }

        self.producer.send(self.topic, key=order_id, value=payload)
        self.producer.flush()
        print(f"[PUB OK] topic={self.topic} key={order_id} bytes={len(json.dumps(payload))}")
