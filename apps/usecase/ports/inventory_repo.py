from __future__ import annotations
from dataclasses import dataclass
from decimal import Decimal
from typing import Protocol

@dataclass
class ItemEnriched:
    product_id: str
    sku: str
    name: str
    unit_price: Decimal
    quantity: int

@dataclass
class InventoryInfo:
    product_id: str
    available_quantity: int
    reserved_quantity: int

class InventoryRepo(Protocol):
    def reserve(self, pairs: list[tuple[str, int]]) -> tuple[list[ItemEnriched], Decimal]:
        """Reserva stock (available -= qty, reserved += qty) en una sola TX y devuelve ítems enriquecidos + subtotal."""
        ...

    def consume(self, items: list[ItemEnriched]) -> None:
        """Confirma la venta: reserved -= qty (no toca available)."""
        ...

    def release(self, items: list[ItemEnriched]) -> None:
        """Libera la reserva por fallo/cancelación: available += qty, reserved -= qty."""
        ...
    
    def get_by_product_id(self, product_id: str) -> InventoryInfo | None:
        """Obtiene información de inventario por ID de producto."""
        ...
