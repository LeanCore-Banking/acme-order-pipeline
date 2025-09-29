#!/bin/bash

# Filtrar warnings de protobuf para evitar que bloqueen la salida
export PYTHONWARNINGS="ignore::UserWarning"

# Configurar logging sin buffer
export PYTHONUNBUFFERED=1

echo "=== Worker Entrypoint ==="
echo "Configuración:"
echo "  KAFKA_BROKERS: $KAFKA_BROKERS"
echo "  KAFKA_TOPIC_ORDERS_CREATED: $KAFKA_TOPIC_ORDERS_CREATED"
echo "  KAFKA_GROUP_ID: $KAFKA_GROUP_ID"
echo "  MONGO_DB: $MONGO_DB"
echo "  TAX_RATE: $TAX_RATE"
echo

# Esperar un poco para que Kafka esté completamente listo
echo "Esperando a que Kafka esté completamente listo..."
sleep 10

# Ejecutar el worker
echo "Iniciando worker..."
exec uv run python -m apps.worker.main