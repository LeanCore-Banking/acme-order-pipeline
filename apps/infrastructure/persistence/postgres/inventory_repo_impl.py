from __future__ import annotations

from decimal import Decimal
from typing import List, Tuple
from sqlalchemy import text
from apps.infrastructure.persistence.postgres.session import get_session
from apps.usecase.ports.inventory_repo import InventoryRepo, ItemEnriched, InventoryInfo
from apps.domain.errors import ProductNotFound, InsufficientInventory

class InventoryRepoImpl(InventoryRepo):
    def reserve(self, pairs: List[Tuple[str, int]]) -> tuple[list[ItemEnriched], Decimal]:
        """
        Reserva stock por SKU en una sola transacción.
        - Valida existencia de producto + inventario suficiente.
        - Hace available -= qty, reserved += qty.
        """
        items: list[ItemEnriched] = []
        subtotal = Decimal("0")

        with get_session() as s:
            try:
                for sku, qty in pairs:
                    row = s.execute(text("""
                        SELECT p.id AS product_id, p.sku, p.name, p.price,
                               i.available_quantity, i.reserved_quantity
                        FROM product p
                        JOIN inventory i ON i.product_id = p.id
                        WHERE p.sku = :sku
                        FOR UPDATE
                    """), {"sku": sku}).mappings().first()

                    if not row:
                        raise ProductNotFound(f"Product with SKU {sku} not found")

                    if int(row["available_quantity"]) < int(qty):
                        raise InsufficientInventory(
                            f"Not enough inventory for {sku}. Available: {row['available_quantity']}, Requested: {qty}"
                        )

                    s.execute(text("""
                        UPDATE inventory
                        SET available_quantity = available_quantity - :q,
                            reserved_quantity  = reserved_quantity  + :q
                        WHERE product_id = :pid
                    """), {"q": int(qty), "pid": row["product_id"]})

                    price = Decimal(str(row["price"]))
                    items.append(ItemEnriched(
                        product_id=str(row["product_id"]),
                        sku=row["sku"],
                        name=row["name"],
                        unit_price=price,
                        quantity=int(qty),
                    ))
                    subtotal += price * Decimal(int(qty))

                s.commit()
            except Exception:
                s.rollback()
                raise

        return items, subtotal

    def consume(self, items: list[ItemEnriched]) -> None:
        """
        Confirmación: reserved -= qty (ya estaba descontado de available en la reserva).
        """
        with get_session() as s:
            try:
                for it in items:
                    row = s.execute(text("""
                        SELECT p.id AS product_id, i.reserved_quantity
                        FROM product p
                        JOIN inventory i ON i.product_id = p.id
                        WHERE p.sku = :sku
                        FOR UPDATE
                    """), {"sku": it.sku}).mappings().first()

                    if not row:
                        raise RuntimeError(f"product_not_found: {it.sku}")

                    if int(row["reserved_quantity"]) < int(it.quantity):
                        raise RuntimeError(f"reserved_underflow: {it.sku}")

                    s.execute(text("""
                        UPDATE inventory
                        SET reserved_quantity = reserved_quantity - :q
                        WHERE product_id = :pid
                    """), {"q": int(it.quantity), "pid": row["product_id"]})

                s.commit()
            except Exception:
                s.rollback()
                raise

    def release(self, items: list[ItemEnriched]) -> None:
        """
        Fallo/cancelación: devolver reserva (available += qty, reserved -= qty).
        """
        with get_session() as s:
            try:
                for it in items:
                    row = s.execute(text("""
                        SELECT p.id AS product_id, i.reserved_quantity
                        FROM product p
                        JOIN inventory i ON i.product_id = p.id
                        WHERE p.sku = :sku
                        FOR UPDATE
                    """), {"sku": it.sku}).mappings().first()

                    if not row:
                        continue

                    if int(row["reserved_quantity"]) < int(it.quantity):
                        qty = int(row["reserved_quantity"])
                    else:
                        qty = int(it.quantity)

                    if qty > 0:
                        s.execute(text("""
                            UPDATE inventory
                            SET reserved_quantity  = reserved_quantity  - :q,
                                available_quantity = available_quantity + :q
                            WHERE product_id = :pid
                        """), {"q": qty, "pid": row["product_id"]})

                s.commit()
            except Exception:
                s.rollback()
                raise
    
    def get_by_product_id(self, product_id: str) -> InventoryInfo | None:
        """Obtiene información de inventario por ID de producto."""
        with get_session() as s:
            row = s.execute(text("""
                SELECT product_id, available_quantity, reserved_quantity
                FROM inventory
                WHERE product_id = :product_id
            """), {"product_id": product_id}).mappings().first()
            
        if not row:
            return None
            
        return InventoryInfo(
            product_id=str(row["product_id"]),
            available_quantity=int(row["available_quantity"]),
            reserved_quantity=int(row["reserved_quantity"])
        )
