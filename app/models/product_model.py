from pydantic import BaseModel
from typing import Optional

class Product(BaseModel):
    id: str
    sku: str
    name: str
    price: float
    available_quantity: Optional[int] = None

