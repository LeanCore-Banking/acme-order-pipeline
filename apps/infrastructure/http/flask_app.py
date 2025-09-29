from __future__ import annotations

from datetime import datetime, timezone
from flask import Flask, request, jsonify

from apps.usecase.commands import (
    CreateOrderCommand, CustomerIn, OrderItemIn,
    GetProductsQuery, GetInventoryQuery, GetOrderQuery, ListUserOrdersQuery
)
from apps.usecase.create_order import CreateOrderUseCase
from apps.usecase.get_products import GetProductsUseCase
from apps.usecase.get_inventory import GetInventoryUseCase
from apps.usecase.get_order import GetOrderUseCase
from apps.usecase.list_user_orders import ListUserOrdersUseCase

from apps.infrastructure.persistence.postgres.product_repo_impl import ProductRepoImpl
from apps.infrastructure.persistence.postgres.inventory_repo_impl import InventoryRepoImpl
from apps.infrastructure.persistence.postgres.idempotency_store_impl import IdempotencyStoreImpl
from apps.infrastructure.persistence.mongo.order_read_repo_impl import OrderReadRepoImpl
from apps.infrastructure.messaging.kafka.publisher_impl import EventBusKafkaImpl
from apps.infrastructure.services.clock_impl import ClockImpl
from apps.infrastructure.services.uuid_impl import UUIDGenImpl

def create_flask_app() -> Flask:
    app = Flask(__name__)

    @app.get("/api/v1/health")
    def health():
        return {
            "status": "healthy",
            "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        }

    @app.get("/api/v1/products")
    def list_products():
        sku = request.args.get("sku")
        
        uc = GetProductsUseCase(
            products=ProductRepoImpl(),
            inventory=InventoryRepoImpl()
        )
        
        query = GetProductsQuery(sku=sku)
        response, status_code = uc.execute(query)
        
        return jsonify(response), status_code

    @app.get("/api/v1/products/<sku>/inventory")
    def get_inventory_by_sku(sku: str):
        uc = GetInventoryUseCase(
            products=ProductRepoImpl(),
            inventory=InventoryRepoImpl()
        )
        
        query = GetInventoryQuery(sku=sku)
        response, status_code = uc.execute(query)
        
        return jsonify(response), status_code

    @app.post("/api/v1/orders")
    def create_order():
        idem_key = request.headers.get("Idempotency-Key")
        if not idem_key:
            return jsonify({"detail": "Missing Idempotency-Key header"}), 400

        body = request.get_json(silent=True) or {}
        try:
            customer = CustomerIn(
                user_id=body["customer"]["user_id"],
                email=body["customer"].get("email"),
            )
            items = [
                OrderItemIn(sku=i["sku"], quantity=int(i["quantity"]))
                for i in body["items"]
            ]
        except Exception as e:
            return jsonify({"detail": f"Invalid payload: {e}"}), 400

        uc = CreateOrderUseCase(
            products=ProductRepoImpl(),
            inventory=InventoryRepoImpl(),
            idem=IdempotencyStoreImpl(),
            bus=EventBusKafkaImpl(),
            read_repo=OrderReadRepoImpl(),
            clock=ClockImpl(),
            uuid=UUIDGenImpl(),
        )

        resp, status = uc.execute(
            CreateOrderCommand(idem_key=idem_key, customer=customer, items=items)
        )
        return jsonify(resp), status

    @app.get("/api/v1/orders/<order_id>")
    def get_order(order_id: str):
        uc = GetOrderUseCase(
            order_read_repo=OrderReadRepoImpl()
        )
        
        query = GetOrderQuery(order_id=order_id)
        response, status_code = uc.execute(query)
        
        return jsonify(response), status_code

    @app.get("/api/v1/users/<user_id>/orders")
    def list_user_orders(user_id: str):
        try:
            page = int(request.args.get("page", "1"))
            limit = int(request.args.get("limit", "10"))
        except Exception:
            page, limit = 1, 10
        
        uc = ListUserOrdersUseCase(
            order_read_repo=OrderReadRepoImpl()
        )
        
        query = ListUserOrdersQuery(user_id=user_id, page=page, limit=limit)
        response, status_code = uc.execute(query)
        
        return jsonify(response), status_code

    return app
