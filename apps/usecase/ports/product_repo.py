from typing import Sequence
from apps.domain.entities import ProductEntity

class ProductRepo:
    def get_by_skus(self, skus: Sequence[str]) -> dict[str, ProductEntity]:
        raise NotImplementedError
    
    def get_by_sku(self, sku: str) -> ProductEntity:
        """Obtiene un producto por su SKU. Lanza ProductNotFound si no existe."""
        raise NotImplementedError
    
    def get_all(self) -> list[ProductEntity]:
        """Obtiene todos los productos."""
        raise NotImplementedError