# Dockerfile para el Sistema de Órdenes
FROM python:3.11-slim

# Instalar uv para manejo de dependencias
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Configurar directorio de trabajo
WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    gcc \
    curl \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

# Copiar archivos de configuración de dependencias
COPY pyproject.toml uv.lock ./

# Instalar dependencias de Python
RUN uv sync --frozen

# Copiar código fuente
COPY . .

# Copiar script de inicio del worker
COPY worker-entrypoint.sh /worker-entrypoint.sh
RUN chmod +x /worker-entrypoint.sh

# Crear directorio para protobuf generados
RUN mkdir -p pkg/generated && touch pkg/generated/__init__.py

# IMPORTANTE: No cambiar a usuario no-root aún
# El worker necesita permisos completos

# Exponer puerto para la API
EXPOSE 8080

# Crear script de inicio que compile protobuf en runtime
RUN echo '#!/bin/bash\n\
echo "Compilando protobuf..."\n\
uv run python -m grpc_tools.protoc \
    --python_out=pkg/generated \
    --proto_path=proto \
    proto/order_events.proto\n\
echo "Protobuf compilado exitosamente"\n\
exec "$@"' > /entrypoint.sh && chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]

# Comando por defecto (puede ser sobrescrito)
CMD ["uv", "run", "gunicorn", "-w", "2", "-b", "0.0.0.0:8080", "apps.api.wsgi:app"]