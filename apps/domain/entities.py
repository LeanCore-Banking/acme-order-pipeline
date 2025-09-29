from dataclasses import dataclass
from decimal import Decimal

@dataclass(frozen=True)
class ProductEntity:
    id: str
    sku: str
    name: str
    price: Decimal

@dataclass(frozen=True)
class InventoryQuoteItem:
    product_id: str
    sku: str
    name: str
    unit_price: Decimal
    quantity: int
