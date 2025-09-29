from apps.usecase.commands import GetProductsQuery
from apps.usecase.ports.product_repo import ProductRepo
from apps.usecase.ports.inventory_repo import InventoryRepo
from apps.domain.errors import ProductNotFound


class GetProductsUseCase:
    def __init__(self, products: ProductRepo, inventory: InventoryRepo):
        self.products = products
        self.inventory = inventory

    def execute(self, query: GetProductsQuery) -> tuple[dict, int]:
        try:
            if query.sku:
                product = self.products.get_by_sku(query.sku)
                products = [product]
            else:
                products = self.products.get_all()

            result_products = []
            for product in products:
                inventory_info = self.inventory.get_by_product_id(product.id)
                available_qty = inventory_info.available_quantity if inventory_info else 0
                
                result_products.append({
                    "id": product.id,
                    "sku": product.sku,
                    "name": product.name,
                    "price": float(product.price),
                    "available_quantity": int(available_qty),
                })

            return {"products": result_products}, 200

        except ProductNotFound as e:
            return {
                "error": "product_not_found",
                "message": str(e)
            }, 404
        except Exception as e:
            return {
                "error": "internal_server_error",
                "message": f"Error retrieving products: {str(e)}"
            }, 500
