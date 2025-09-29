from apps.usecase.ports.idempotency_store import IdempotencyStore
from apps.domain.errors import IdempotencyConflict
from .session import get_session
from .models import IdempotencyKey

class IdempotencyStoreImpl(IdempotencyStore):
    def get(self, key):
        with get_session() as s:
            row = s.get(IdempotencyKey, key)
            if not row:
                return None
            return row.response_status, row.response_body

    def save_first(self, key, request_hash, status, body_json, order_id):
        with get_session() as s:
            s.add(IdempotencyKey(
                key=key,
                order_id=order_id,
                request_hash=request_hash,
                response_status=status,
                response_body=body_json
            ))
            s.commit()

    def ensure_same_payload_or_conflict(self, key, request_hash):
        with get_session() as s:
            row = s.get(IdempotencyKey, key)
            if row and row.request_hash != request_hash:
                raise IdempotencyConflict("Idempotency key used with different payload")
