from apps.usecase.ports.order_read_repo import OrderReadRepo
from apps.infrastructure.persistence.mongo.client import orders_col

class OrderReadRepoImpl(OrderReadRepo):
    def save_pending_snapshot(self, doc: dict) -> None:
        col = orders_col()
        col.update_one({"order_id": doc["order_id"]}, {"$set": doc}, upsert=True)

    def get_by_id(self, order_id: str) -> dict | None:
        col = orders_col()
        doc = col.find_one({"order_id": order_id}, {"_id": 0})
        return doc

    def list_by_user(self, user_id: str, page: int, limit: int) -> tuple[list[dict], int]:
        col = orders_col()
        q = {"customer.user_id": user_id}
        skip = (page - 1) * limit
        cursor = (
            col.find(q, {"_id": 0})
               .sort("created_at", -1)
               .skip(skip)
               .limit(limit)
        )
        items = list(cursor)
        total = col.count_documents(q)
        return items, total
