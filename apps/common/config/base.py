"""
Configuración base compartida entre todos los componentes del sistema.
Contiene configuraciones comunes como bases de datos, Kafka, etc.
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class BaseAppSettings(BaseSettings):
    """Configuración base compartida entre API y Worker."""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )
    
    postgres_dsn: str = Field(
        "postgresql+psycopg://postgres:postgres123@localhost:5432/ecommerce_inventory",
        validation_alias="POSTGRES_DSN"
    )
    
    mongo_uri: str = Field(
        "mongodb://admin:admin123@localhost:57017/?authSource=admin",
        validation_alias="MONGO_URI"
    )
    mongo_db: str = Field("ecommerce_orders", validation_alias="MONGO_DB")
    
    kafka_brokers: str = Field("localhost:9092", validation_alias="KAFKA_BROKERS")
    kafka_topic_orders_created: str = Field(
        "orders.created", 
        validation_alias="KAFKA_TOPIC_ORDERS_CREATED"
    )
    
    tax_rate: float = Field(0.08, validation_alias="TAX_RATE")
