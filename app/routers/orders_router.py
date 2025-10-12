from fastapi import APIRouter, HTTPException
from app.models.order_model import OrderCreate
from app.db.postgres import get_postgres_connection
from app.kafka.producer import publish_order_event
import uuid, datetime

router = APIRouter(prefix="/api/v1/orders", tags=["Orders"])

@router.post("", response_model=dict)
@router.post("/", response_model=dict)
def create_order(order: OrderCreate):
    conn = get_postgres_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection failed")

    cursor = conn.cursor()

    try:
        for item in order.items:
            cursor.execute("""
                SELECT p.id, i.available_quantity
                FROM product p
                JOIN inventory i ON p.id = i.product_id
                WHERE p.sku = %s
            """, (item.sku,))
            result = cursor.fetchone()

            if not result:
                raise HTTPException(status_code=404, detail=f"Product {item.sku} not found")

            available = result["available_quantity"]
            if available < item.quantity:
                raise HTTPException(status_code=400, detail=f"Insufficient inventory for {item.sku}")

        order_id = f"ORD-{datetime.datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6]}"

        order_data = {
            "order_id": order_id,
            "user_id": order.customer.user_id,
            "email": order.customer.email,
            "items": [i.dict() for i in order.items],
            "created_at": datetime.datetime.utcnow().isoformat()
        }

        publish_order_event(order_data)

        return {
            "order_id": order_id,
            "status": "pending",
            "message": "Order created successfully and queued for processing",
            "created_at": order_data["created_at"]
        }

    finally:
        cursor.close()
        conn.close()

