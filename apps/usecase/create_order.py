import json
import hashlib
from dataclasses import asdict
from decimal import Decimal
from apps.usecase.commands import CreateOrderCommand
from apps.usecase.ports.product_repo import ProductRepo
from apps.domain.errors import ProductNotFound, InsufficientInventory, IdempotencyConflict
from apps.usecase.ports.inventory_repo import InventoryRepo
from apps.usecase.ports.idempotency_store import IdempotencyStore
from apps.usecase.ports.event_bus import EventBus
from apps.usecase.ports.order_read_repo import OrderReadRepo
from apps.usecase.ports.clock import Clock
from apps.usecase.ports.uuid_gen import UUIDGen

class CreateOrderUseCase:
    """
    Caso de uso para crear una orden. Orquesta la reserva de inventario, persistencia de snapshot,
    manejo de idempotencia y publicación de eventos.
    """
    def __init__(
        self,
        products: ProductRepo,
        inventory: InventoryRepo,
        idem: IdempotencyStore,
        bus: EventBus,
        read_repo: OrderReadRepo,
        clock: Clock,
        uuid: UUIDGen
    ):
        self.products = products
        self.inventory = inventory
        self.idem = idem
        self.bus = bus
        self.read_repo = read_repo
        self.clock = clock
        self.uuid = uuid

    def execute(self, cmd: CreateOrderCommand) -> tuple[dict, int]:
        """
        Ejecuta el flujo de creación de orden:
        1. Verifica idempotencia.
        2. Reserva inventario.
        3. Persiste snapshot inicial en MongoDB.
        4. Publica evento de orden creada.
        5. Devuelve respuesta y guarda registro de idempotencia.
        """
        try:
            request_hash = self._hash_payload(cmd)
            existente = self.idem.get(cmd.idem_key)
            if existente:
                status, body_json = existente
                return json.loads(body_json), status
            self.idem.ensure_same_payload_or_conflict(cmd.idem_key, request_hash)

            pares = [(i.sku, i.quantity) for i in cmd.items]
            items_enriquecidos, subtotal = self.inventory.reserve(pares)

            order_id = self.uuid.new_order_id()
            created_dt = self.clock.now_utc().replace(microsecond=0)
            created_at = created_dt.isoformat().replace("+00:00", "Z")

            items_para_evento = [{
                "product_id": it.product_id,
                "sku": it.sku,
                "name": it.name,
                "price": float(it.unit_price),
                "quantity": it.quantity,
            } for it in items_enriquecidos]
            cliente = {
                "user_id": cmd.customer.user_id,
                "email": cmd.customer.email or ""
            }

            try:
                self.read_repo.save_pending_snapshot({
                    "order_id": order_id,
                    "status": "pending",
                    "customer": cliente,
                    "items": items_para_evento,
                    "pricing": {
                        "subtotal": float(subtotal),
                        "tax": 0.0,
                        "total": float(subtotal),
                    },
                    "payment": {"status": "pending"},
                    "created_at": created_dt,
                    "updated_at": created_dt,
                })
            except Exception:
                try:
                    self.inventory.release(items_enriquecidos)
                finally:
                    raise

            try:
                self.bus.publish_order_created(order_id, cliente, items_para_evento)
            except Exception:
                try:
                    self.inventory.release(items_enriquecidos)
                finally:
                    raise

            resp = {
                "order_id": order_id,
                "status": "pending",
                "message": "Orden creada exitosamente y encolada para procesamiento",
                "estimated_total": float(subtotal),
                "created_at": created_at,
            }
            body_json = json.dumps(resp)

            self.idem.save_first(cmd.idem_key, request_hash, 202, body_json, order_id)

            return resp, 202
            
        except ProductNotFound as e:
            return {
                "error": "product_not_found",
                "message": str(e)
            }, 404
        except InsufficientInventory as e:
            return {
                "error": "insufficient_inventory",
                "message": str(e)
            }, 400
        except IdempotencyConflict as e:
            return {
                "error": "idempotency_conflict",
                "message": str(e)
            }, 409

    @staticmethod
    def _hash_payload(cmd: CreateOrderCommand) -> str:
        """
        Calcula un hash SHA-256 del payload relevante de la orden para asegurar idempotencia.
        """
        payload = {
            "customer": asdict(cmd.customer),
            "items": [asdict(i) for i in cmd.items],
        }
        norm = json.dumps(payload, sort_keys=True, separators=(",", ":")).encode()
        return hashlib.sha256(norm).hexdigest()