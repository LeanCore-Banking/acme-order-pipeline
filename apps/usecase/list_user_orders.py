from apps.usecase.commands import ListUserOrdersQuery
from apps.usecase.ports.order_read_repo import OrderReadRepo

class ListUserOrdersUseCase:
    def __init__(self, order_read_repo: OrderReadRepo):
        self.order_read_repo = order_read_repo

    def execute(self, query: ListUserOrdersQuery) -> tuple[dict, int]:
        try:
            if query.page < 1 or query.limit < 1 or query.limit > 100:
                return {
                    "error": "invalid_pagination",
                    "message": "Page must be >= 1, limit must be between 1 and 100"
                }, 400

            items, total = self.order_read_repo.list_by_user(query.user_id, query.page, query.limit)

            summaries = []
            for order in items:
                total_amount = (order.get("pricing") or {}).get("total")
                created = order.get("created_at")
                summaries.append({
                    "order_id": order.get("order_id"),
                    "status": order.get("status"),
                    "total": float(total_amount) if total_amount is not None else None,
                    "created_at": created,
                })

            has_more = query.page * query.limit < total
            return {
                "orders": summaries,
                "pagination": {
                    "page": query.page,
                    "limit": query.limit,
                    "total": total,
                    "has_more": has_more
                }
            }, 200

        except Exception as e:
            return {
                "error": "internal_server_error",
                "message": f"Error retrieving user orders: {str(e)}"
            }, 500
