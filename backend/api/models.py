from pydantic import BaseModel
from typing import List

class OrderItem(BaseModel):
    id: int
    quantity: int

class OrderRequest(BaseModel):
    items: List[OrderItem]
