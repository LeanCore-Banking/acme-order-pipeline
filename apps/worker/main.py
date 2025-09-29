"""
Este archivo implementa un worker que escucha eventos de creación de órdenes (ORDER_CREATED) desde un tópico de Kafka,
procesa la información de la orden, actualiza el inventario y almacena el estado de la orden en MongoDB.

A continuación se explica cada parte relevante del código:
"""
from __future__ import annotations

import json
import uuid
from decimal import Decimal
from datetime import datetime, timezone

from kafka import KafkaConsumer

from apps.infrastructure.config.worker_settings import worker_settings as settings
from apps.infrastructure.persistence.mongo.client import orders_col
from apps.infrastructure.persistence.postgres.inventory_repo_impl import InventoryRepoImpl
from apps.usecase.ports.inventory_repo import ItemEnriched

from pkg.generated import order_events_pb2 as pb

def _decode_event(raw: bytes) -> dict:
    """
    1) Intenta decodificar como Protobuf (ORDER_CREATED).
    2) Si falla, intenta JSON.
    Retorna: {order_id, customer{user_id,email}, items[{product_id,sku,name,price,quantity}]}
    """
    # Protobuf
    try:
        evt = pb.OrderEvent()
        evt.ParseFromString(raw)
        if evt.event_type == pb.EventType.ORDER_CREATED and evt.HasField("order_created"):
            oc = evt.order_created
            items = [{
                "product_id": it.product_id,
                "sku": it.sku,
                "name": it.name,
                "price": float(it.price),
                "quantity": int(it.quantity),
            } for it in oc.items]
            return {
                "order_id": oc.order_id or evt.order_id,
                "customer": {"user_id": oc.customer.user_id, "email": oc.customer.email},
                "items": items,
            }
        raise ValueError("not ORDER_CREATED")
    except Exception:
        pass

    # JSON fallback
    try:
        data = json.loads(raw.decode("utf-8"))
        return {
            "order_id": data["order_id"],
            "customer": data["customer"],
            "items": data["items"],
        }
    except Exception:
        pass

    raise ValueError("Could not decode event as Protobuf or JSON")

def main():
    print(
        "settings",
        f"KAFKA_BROKERS={settings.kafka_brokers}",
        f"KAFKA_TOPIC_ORDERS_CREATED={settings.kafka_topic_orders_created}",
        f"MONGO_DB={settings.mongo_db}",
        f"TAX_RATE={settings.tax_rate}",
    )

    consumer = KafkaConsumer(
        settings.kafka_topic_orders_created,
        bootstrap_servers=[s.strip() for s in settings.kafka_brokers.split(",")],
        group_id=settings.kafka_group_id,
        enable_auto_commit=settings.kafka_enable_auto_commit,
        auto_offset_reset=settings.kafka_auto_offset_reset,
    )

    col = orders_col()
    inv_repo = InventoryRepoImpl()

    print(f"Worker listening on topic={settings.kafka_topic_orders_created}, group={settings.kafka_group_id}")

    for rec in consumer:
        try:
            evt = _decode_event(rec.value)

            order_id = evt["order_id"]
            customer = evt["customer"]
            items = evt["items"]

            subtotal, tax, total = _calc_totals(items, settings.tax_rate)
            now = _now_utc()

            items_enriched = [
                ItemEnriched(
                    product_id=it.get("product_id", ""),
                    sku=it["sku"],
                    name=it["name"],
                    unit_price=Decimal(str(it["price"])),
                    quantity=int(it["quantity"]),
                )
                for it in items
            ]

            try:
                inv_repo.consume(items_enriched)
                payment_status = "completed"
                final_status = "confirmed"
                txn_id = str(uuid.uuid4())
            except Exception as inv_err:
                inv_repo.release(items_enriched)
                payment_status = "failed"
                final_status = "failed"
                txn_id = None
                print("Inventario: error al consumir, reserva liberada:", repr(inv_err))

            col.update_one(
                {"order_id": order_id},
                {"$set": {
                    "status": final_status,
                    "customer": customer,
                    "items": items,
                    "pricing": {"subtotal": subtotal, "tax": tax, "total": total},
                    "payment": {
                        "status": payment_status,
                        "transaction_id": txn_id,
                        "processed_at": now,
                    },
                    "updated_at": now,
                }},
                upsert=True,
            )

            print(f"Order {order_id} {final_status} (total={total})")

        except Exception as e:
            print("Error processing message:", repr(e))

def _calc_totals(items: list[dict], tax_rate: float) -> tuple[float, float, float]:
    subtotal = round(sum(float(i["price"]) * int(i["quantity"]) for i in items), 2)
    tax = round(subtotal * tax_rate, 2)
    total = round(subtotal + tax, 2)
    return subtotal, tax, total

def _now_utc():
    return datetime.now(timezone.utc).replace(microsecond=0)

if __name__ == "__main__":
    main()
