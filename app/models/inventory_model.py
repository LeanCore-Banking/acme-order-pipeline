from pydantic import BaseModel

class Inventory(BaseModel):
    sku: str
    product_name: str
    available_quantity: int
    reserved_quantity: int

