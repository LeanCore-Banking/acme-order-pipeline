import random
from apps.usecase.ports.uuid_gen import UUIDGen
from datetime import datetime, timezone

class UUIDGenImpl(UUIDGen):
    def new_order_id(self) -> str:
        today = datetime.now(timezone.utc).strftime("%Y%m%d")
        seq = random.randint(100000, 999999)
        return f"ORD-{today}-{seq}"
