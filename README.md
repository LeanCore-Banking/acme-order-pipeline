# Sistema de Procesamiento de Órdenes ACME

## 📋 Requisitos Previos
- Docker 20.10+
- Docker Compose 2.0+
- Node.js 20+

## 🚀 Configuración Inicial

```bash
# 1. Clonar el repositorio
git clone https://github.com/migueljalvarez/acme-order-pipeline.git
cd acme-order-pipeline

# 2. Configurar variables de entorno (basado en tu .env.example exacto)
cp src/common/environments/.env.example src/common/environments/.env
````



## ⚙️ Variables de Entorno

Ubicación del archivo: `src/common/environments/.env`.

### Configuración de la Aplicación
```
APP_PORT=9000
APP_URL=http://localhost:9000

KAFKA_BROKERS=kafka:29092
KAFKA_CLIENT_ID=acme-order-pipeline
KAFKA_GROUP_ID=acme-order-service

POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USERNAME=postgres
POSTGRES_PASSWORD=postgres123
POSTGRES_DATABASE=ecommerce_inventory

MONGODB_HOST=mongodb
MONGODB_PORT=27017
MONGODB_USERNAME=admin
MONGODB_PASSWORD=admin123
MONGODB_DATABASE=ecommerce_orders

TAX_RATE= la que corresponda
KAFKAJS_NO_PARTITIONER_WARNING=1

SWAGGER_URL=http://localhost:3000/api/v1
```
```
# Iniciar todos los servicios (incluye Kafka, PostgreSQL y MongoDB)
docker-compose up -d --build

# Verificar que todos los servicios estén funcionando
docker-compose ps

# Detener los servicios
docker-compose down
```
## Servicios incluidos

| Servicio            | Imagen / Build                          | Puertos                  | Notas                                                                                                                                                                              |
| ------------------- | --------------------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **App**             | Build desde Dockerfile (`.`)            | `3000:9000`              | API NestJS principal, depende de Postgres, Kafka y MongoDB. Usa variables de entorno en `src/common/environments/.env`.                                                            |
| **PostgreSQL**      | `postgres:16`                           | `5432:5432`              | Base de datos para inventario. Variables: `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`. Incluye scripts de inicialización en `./init-scripts/postgres`.                     |
| **MongoDB**         | `mongo:7.0`                             | `27017:27017`            | Base de datos para órdenes. Variables: `MONGO_INITDB_ROOT_USERNAME`, `MONGO_INITDB_ROOT_PASSWORD`, `MONGO_INITDB_DATABASE`. Scripts de inicialización en `./init-scripts/mongodb`. |
| **Zookeeper**       | `confluentinc/cp-zookeeper:7.5.0`       | `2181:2181`              | Necesario para Kafka.                                                                                                                                                              |
| **Kafka Broker**    | `confluentinc/cp-kafka:7.5.0`           | `9092:9092`, `9101:9101` | Configurado con listeners PLAINTEXT y PLAINTEXT\_INTERNAL. Depende de Zookeeper.                                                                                                   |
| **Schema Registry** | `confluentinc/cp-schema-registry:7.5.0` | `8081:8081`              | Para gestión de esquemas Protobuf en Kafka. Depende de Kafka.                                                                                                                      |

## Volúmenes persistentes

postgres_data → /var/lib/postgresql/data

mongodb_data → /data/db

zookeeper_data → /var/lib/zookeeper/data

zookeeper_logs → /var/lib/zookeeper/log

kafka_data → /var/lib/kafka/data

### Red de contenedores
Todos los servicios están conectados a la red ecommerce_network (driver bridge), permitiendo comunicación interna entre contenedores usando los nombres de servicio como hostnames (postgres, mongodb, kafka, etc.).

## Documentación de la API
Accede a la interfaz de Swagger UI en:
🔗 http://localhost:9000/api-docs

Endpoints principales:

* POST /api/v1/orders - Crear nueva orden

* GET /api/v1/orders/{id} - Consultar estado de orden

* GET /api/v1/products/{sku}/inventory - Verificar inventario

### Verificar que todo esté funcionando

```bash
# Verificar estado de servicios
make status

# Ver información de conexión
make info
```

### Ver comandos

```bash
make help
```