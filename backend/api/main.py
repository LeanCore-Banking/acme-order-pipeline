from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from kafka import KafkaProducer
import json
from .models import OrderRequest
from .db import get_pg_connection
from utils import generate_order_id
import time

app = FastAPI()

# Inicializa el producer como None
producer = None

def get_kafka_producer():
    """
    Crea el KafkaProducer de manera lazy (cuando se necesita)
    y reintenta si Kafka aún no está disponible.
    """
    global producer
    if producer is None:
        for _ in range(10):  # reintentos
            try:
                producer = KafkaProducer(
                    bootstrap_servers='kafka:9092',
                    value_serializer=lambda v: json.dumps(v).encode('utf-8')
                )
                break
            except Exception as e:
                print(f"Esperando Kafka... intento fallido: {e}")
                time.sleep(2)
        if producer is None:
            raise HTTPException(status_code=503, detail="Kafka no disponible")
    return producer


@app.post("/orders")
def create_order(order: OrderRequest):
    try:
        # Validación de inventario
        try:
            conn = get_pg_connection()
            cursor = conn.cursor()
            for item in order.items:
                cursor.execute("SELECT stock FROM products WHERE id = %s", (item.id,))
                result = cursor.fetchone()
                if not result:
                    raise HTTPException(status_code=404, detail=f"Producto {item.id} no existe")
                if item.quantity > result[0]:
                    raise HTTPException(status_code=400, detail=f"Inventario insuficiente para producto {item.id}")
        except HTTPException as e:
            raise e
        except Exception as e:
            print(f"Error de base de datos: {e}")
            return JSONResponse(status_code=500, content={"detail": "Error de base de datos"})
        finally:
            try:
                conn.close()
            except:
                pass

        # Generar ID de orden
        order_id = generate_order_id()
        event = {
            "order_id": order_id,
            "items": [item.dict() for item in order.items]
        }

        # Enviar evento a Kafka
        try:
            kafka_producer = get_kafka_producer()
            kafka_producer.send("orders", event)
            kafka_producer.flush()
        except Exception as e:
            print(f"Error al enviar a Kafka: {e}")
            return JSONResponse(status_code=500, content={"detail": "Error al enviar evento a Kafka"})

        return {"message": "Orden recibida", "order_id": order_id}
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Error inesperado: {e}")
        return JSONResponse(status_code=500, content={"detail": "Error inesperado en el procesamiento"})
