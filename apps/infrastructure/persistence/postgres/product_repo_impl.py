from decimal import Decimal
from sqlalchemy import select
from apps.usecase.ports.product_repo import ProductRepo
from apps.domain.entities import ProductEntity
from apps.domain.errors import ProductNotFound
from .session import get_session
from .models import Product

class ProductRepoImpl(ProductRepo):
    def get_by_skus(self, skus):
        with get_session() as s:
            rows = s.execute(
                select(Product).where(Product.sku.in_(list(skus)))
            ).scalars().all()
        return {
            r.sku: ProductEntity(id=str(r.id), sku=r.sku, name=r.name, price=Decimal(str(r.price)))
            for r in rows
        }
    
    def get_by_sku(self, sku: str) -> ProductEntity:
        """Obtiene un producto por su SKU. Lanza ProductNotFound si no existe."""
        with get_session() as s:
            row = s.execute(
                select(Product).where(Product.sku == sku)
            ).scalar_one_or_none()
            
        if not row:
            raise ProductNotFound(f"Product with SKU {sku} not found")
            
        return ProductEntity(
            id=str(row.id), 
            sku=row.sku, 
            name=row.name, 
            price=Decimal(str(row.price))
        )
    
    def get_all(self) -> list[ProductEntity]:
        """Obtiene todos los productos."""
        with get_session() as s:
            rows = s.execute(select(Product)).scalars().all()
            
        return [
            ProductEntity(
                id=str(r.id), 
                sku=r.sku, 
                name=r.name, 
                price=Decimal(str(r.price))
            )
            for r in rows
        ]