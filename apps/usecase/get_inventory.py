from apps.usecase.commands import GetInventoryQuery
from apps.usecase.ports.product_repo import ProductRepo
from apps.usecase.ports.inventory_repo import InventoryRepo
from apps.domain.errors import ProductNotFound


class GetInventoryUseCase:
    def __init__(self, products: ProductRepo, inventory: InventoryRepo):
        self.products = products
        self.inventory = inventory

    def execute(self, query: GetInventoryQuery) -> tuple[dict, int]:
        try:
            product = self.products.get_by_sku(query.sku)

            inventory_info = self.inventory.get_by_product_id(product.id)
            if not inventory_info:
                return {
                    "error": "inventory_not_found",
                    "message": f"Inventory information for SKU {query.sku} not found"
                }, 404

            return {
                "sku": product.sku,
                "product_name": product.name,
                "available_quantity": int(inventory_info.available_quantity),
                "reserved_quantity": int(inventory_info.reserved_quantity),
            }, 200

        except ProductNotFound as e:
            return {
                "error": "product_not_found",
                "message": str(e)
            }, 404
        except Exception as e:
            return {
                "error": "internal_server_error",
                "message": f"Error retrieving inventory: {str(e)}"
            }, 500
