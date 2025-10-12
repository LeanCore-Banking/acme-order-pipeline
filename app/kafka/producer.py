from kafka import KafkaProducer
from google.protobuf.timestamp_pb2 import Timestamp
from app.kafka.proto import order_events_pb2
import json
import datetime
import uuid
import os

def create_producer():
    kafka_host = os.getenv("KAFKA_HOST", "kafka:9092")
    return KafkaProducer(
        bootstrap_servers=kafka_host,
        value_serializer=lambda v: v.SerializeToString()
    )

def publish_order_event(order_data: dict):
    producer = create_producer()
    topic = "orders"

    event = order_events_pb2.OrderEvent()
    event.event_id = str(uuid.uuid4())
    event.order_id = order_data["order_id"]
    event.event_type = order_events_pb2.ORDER_CREATED

    ts = Timestamp()
    ts.FromDatetime(datetime.datetime.utcnow())
    event.timestamp.CopyFrom(ts)

    order_created = order_events_pb2.OrderCreated()
    order_created.order_id = order_data["order_id"]

    customer = order_events_pb2.Customer()
    customer.user_id = order_data["user_id"]
    customer.email = order_data["email"]
    order_created.customer.CopyFrom(customer)

    # Items
    for item in order_data["items"]:
        item_msg = order_events_pb2.OrderItem()
        item_msg.product_id = item.get("product_id", "")
        item_msg.sku = item["sku"]
        item_msg.name = item.get("name", "")
        item_msg.price = float(item.get("price", 0.0))
        item_msg.quantity = int(item["quantity"])
        order_created.items.append(item_msg)

    event.order_created.CopyFrom(order_created)

    producer.send(topic, event)
    producer.flush()
    print(f"Evento publicado en Kafka: {event.order_id} ({event.event_type})")

