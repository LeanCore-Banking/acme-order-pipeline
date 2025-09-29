from dataclasses import dataclass

@dataclass(frozen=True)
class CustomerIn:
    user_id: str
    email: str | None = None

@dataclass(frozen=True)
class OrderItemIn:
    sku: str
    quantity: int

@dataclass(frozen=True)
class CreateOrderCommand:
    idem_key: str
    customer: CustomerIn
    items: list[OrderItemIn]

@dataclass(frozen=True)
class GetProductsQuery:
    sku: str | None = None

@dataclass(frozen=True)
class GetInventoryQuery:
    sku: str

@dataclass(frozen=True)
class GetOrderQuery:
    order_id: str

@dataclass(frozen=True)
class ListUserOrdersQuery:
    user_id: str
    page: int = 1
    limit: int = 10
