
import sys
import json
import time

# Forzar impresión continua para debug
for i in range(3):
    print(f"[DEBUG] Worker arrancando, ciclo {i+1}", flush=True)
    time.sleep(1)

# Agregamos la carpeta /app al path
sys.path.append("/app")

from api.db import get_pg_connection, get_mongo_connection
from kafka import KafkaConsumer

print("Worker iniciado... intentando conectarse a Kafka", flush=True)

# Espera para asegurar que Kafka esté arriba
time.sleep(5)


consumer = KafkaConsumer(
    'orders',
    bootstrap_servers='kafka:9092',
    value_deserializer=lambda v: json.loads(v.decode('utf-8')),
    group_id='order_consumer_group',
    auto_offset_reset='earliest'
)

print("Conexión a Kafka establecida, escuchando ordenes...", flush=True)


def process_order(order):
    print(f"Procesando orden: {order['order_id']}", flush=True)

    # Actualizar inventario PostgreSQL
    conn = get_pg_connection()
    cursor = conn.cursor()
    for item in order["items"]:
        cursor.execute(
            "UPDATE products SET stock = stock - %s WHERE id = %s",
            (item["quantity"], item["id"])
        )
    conn.commit()
    conn.close()

    # Guardar en MongoDB
    mongo = get_mongo_connection()
    mongo.orders.insert_one(order)
    print(f"Orden {order['order_id']} guardada en MongoDB", flush=True)


for message in consumer:
    order = message.value
    process_order(order)
