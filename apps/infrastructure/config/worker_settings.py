"""
Configuración específica para el Worker/Consumer de Kafka.
Hereda de BaseAppSettings y agrega configuraciones específicas del procesamiento asíncrono.
"""
from pydantic import Field
from apps.common.config.base import BaseAppSettings


class WorkerSettings(BaseAppSettings):
    """Configuración específica para el Worker de Kafka."""
    
    kafka_group_id: str = Field("orders-worker", validation_alias="KAFKA_GROUP_ID")
    kafka_auto_offset_reset: str = Field("earliest", validation_alias="KAFKA_AUTO_OFFSET_RESET")
    kafka_enable_auto_commit: bool = Field(True, validation_alias="KAFKA_ENABLE_AUTO_COMMIT")


worker_settings = WorkerSettings()
