from apps.usecase.commands import GetOrderQuery
from apps.usecase.ports.order_read_repo import OrderReadRepo


class GetOrderUseCase:
    def __init__(self, order_read_repo: OrderReadRepo):
        self.order_read_repo = order_read_repo

    def execute(self, query: GetOrderQuery) -> tuple[dict, int]:
        try:
            doc = self.order_read_repo.get_by_id(query.order_id)
            if not doc:
                return {
                    "error": "order_not_found",
                    "message": f"La orden {query.order_id} no fue encontrada"
                }, 404

            return doc, 200

        except Exception as e:
            return {
                "error": "internal_server_error",
                "message": f"Error al recuperar la orden: {str(e)}"
            }, 500
