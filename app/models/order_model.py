from pydantic import BaseModel, Field, EmailStr
from typing import List

class OrderItem(BaseModel):
    sku: str
    quantity: int

class Customer(BaseModel):
    user_id: str
    email: EmailStr

class OrderCreate(BaseModel):
    customer: Customer
    items: List[OrderItem]

