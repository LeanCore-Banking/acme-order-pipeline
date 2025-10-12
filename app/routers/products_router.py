from fastapi import APIRouter, HTTPException, Query
from app.db.postgres import get_postgres_connection
from app.models.product_model import Product
from app.models.inventory_model import Inventory

router = APIRouter(prefix="/api/v1/products", tags=["Products"])

# ✅ Obtener todos los productos o buscar por SKU
@router.get("/", response_model=list[Product])
def get_products(sku: str | None = Query(None)):
    conn = get_postgres_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection error")

    cursor = conn.cursor()
    try:
        if sku:
            cursor.execute("""
                SELECT p.id, p.sku, p.name, p.price, i.available_quantity
                FROM product p
                JOIN inventory i ON p.id = i.product_id
                WHERE p.sku = %s
            """, (sku,))
        else:
            cursor.execute("""
                SELECT p.id, p.sku, p.name, p.price, i.available_quantity
                FROM product p
                JOIN inventory i ON p.id = i.product_id
                ORDER BY p.name
            """)

        rows = cursor.fetchall()
        if not rows:
            raise HTTPException(status_code=404, detail="Product not found")

        return rows
    finally:
        cursor.close()
        conn.close()


# ✅ Consultar inventario por SKU
@router.get("/{sku}/inventory", response_model=Inventory)
def get_inventory(sku: str):
    conn = get_postgres_connection()
    if not conn:
        raise HTTPException(status_code=500, detail="Database connection error")

    cursor = conn.cursor()
    try:
        cursor.execute("""
            SELECT p.sku, p.name AS product_name, i.available_quantity, i.reserved_quantity
            FROM product p
            JOIN inventory i ON p.id = i.product_id
            WHERE p.sku = %s
        """, (sku,))
        result = cursor.fetchone()

        if not result:
            raise HTTPException(status_code=404, detail="Product not found")

        return result
    finally:
        cursor.close()
        conn.close()

