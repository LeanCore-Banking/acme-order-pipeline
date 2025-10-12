from kafka import KafkaConsumer
from app.kafka.proto import order_events_pb2
from google.protobuf.message import DecodeError
from app.db.postgres import get_postgres_connection
from app.db.mongodb import get_mongo_connection
import random, time, json
import os
def start_consumer():
    print("Iniciando Kafka Consumer en topic: 'orders'...")
   
    consumer = KafkaConsumer(
        "orders",
        bootstrap_servers=os.getenv("KAFKA_HOST", "kafka:9092"),
        auto_offset_reset="earliest",
        enable_auto_commit=True,
        group_id="order-processing-group-v2",   
    )


    for message in consumer:
        try:
            event = order_events_pb2.OrderEvent()
            event.ParseFromString(message.value)

            if event.event_type == order_events_pb2.ORDER_CREATED:
                process_order_created(event.order_created)
        except DecodeError as e:
            print("Error al decodificar mensaje:", e)
        except Exception as e:
            print("Error inesperado:", e)


def process_order_created(order_created):
    print(f"\nProcesando orden: {order_created.order_id}")

    payment_success = random.choice([True, False])
    db_pg = get_postgres_connection()
    db_mongo = get_mongo_connection()
    cursor = db_pg.cursor()

    try:
        if payment_success:
            print("Pago completado con éxito.")

            for item in order_created.items:
                cursor.execute("""
                    UPDATE inventory
                    SET available_quantity = available_quantity - %s,
                        reserved_quantity = reserved_quantity + %s
                    WHERE product_id = (
                        SELECT id FROM product WHERE sku = %s
                    )
                """, (item.quantity, item.quantity, item.sku))

            db_pg.commit()

            order_doc = {
                "order_id": order_created.order_id,
                "customer": {
                    "user_id": order_created.customer.user_id,
                    "email": order_created.customer.email
                },
                "items": [json.loads(json.dumps({
                    "sku": item.sku,
                    "quantity": item.quantity,
                    "price": item.price
                })) for item in order_created.items],
                "status": "confirmed",
                "payment": {
                    "status": "completed",
                    "transaction_id": f"txn_{random.randint(1000,9999)}"
                },
                "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ")
            }

            db_mongo.orders.insert_one(order_doc)
            print(f"Orden {order_created.order_id} confirmada y guardada en MongoDB.")

        else:
            print("Pago fallido, liberando inventario.")

            order_doc = {
                "order_id": order_created.order_id,
                "customer": {
                    "user_id": order_created.customer.user_id,
                    "email": order_created.customer.email
                },
                "status": "failed",
                "payment": {
                    "status": "failed",
                    "transaction_id": f"txn_{random.randint(1000,9999)}"
                },
                "created_at": time.strftime("%Y-%m-%dT%H:%M:%SZ")
            }
            db_mongo.orders.insert_one(order_doc)
            print(f"Orden {order_created.order_id} registrada como fallida.")

    except Exception as e:
        db_pg.rollback()
        print("Error durante el procesamiento:", e)

    finally:
        cursor.close()
        db_pg.close()


if __name__ == "__main__":
    print("Iniciando servicio de consumo de órdenes Kafka...")
    try:
        start_consumer()
    except KeyboardInterrupt:
        print("\nKafka Consumer detenido manualmente.")

