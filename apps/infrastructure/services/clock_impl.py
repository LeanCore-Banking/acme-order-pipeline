from datetime import datetime, timezone
from apps.usecase.ports.clock import Clock

class ClockImpl(Clock):
    def now_utc(self) -> datetime:
        return datetime.now(timezone.utc)
