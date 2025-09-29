from typing import Sequence

class EventBus:
    def publish_order_created(self, order_id: str, customer: dict, items: Sequence[dict]) -> None:
        raise NotImplementedError
