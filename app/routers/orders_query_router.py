from fastapi import APIRouter, HTTPException, Query
from app.db.mongodb import get_mongo_connection

router = APIRouter(prefix="/api/v1", tags=["Order Queries"])


@router.get("/orders/{order_id}")
def get_order_by_id(order_id: str):
    """
    Consulta una orden por su ID en MongoDB
    """
    db = get_mongo_connection()
    order = db.orders.find_one({"order_id": order_id}, {"_id": 0})

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return order


@router.get("/users/{user_id}/orders")
def get_orders_by_user(
    user_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(10, le=100)
):
    """
    Lista las órdenes de un usuario con paginación
    """
    db = get_mongo_connection()

    skip = (page - 1) * limit
    cursor = db.orders.find(
        {"customer.user_id": user_id},
        {"_id": 0, "order_id": 1, "status": 1, "payment.status": 1, "created_at": 1, "pricing.total": 1}
    ).skip(skip).limit(limit)

    orders = list(cursor)
    total = db.orders.count_documents({"customer.user_id": user_id})
    has_more = total > page * limit

    if not orders:
        raise HTTPException(status_code=404, detail="No orders found for this user")

    return {
        "orders": orders,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "has_more": has_more
        }
    }
