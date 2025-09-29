# 🛒 Sistema de Procesamiento de Órdenes - Arquitectura Hexagonal

Sistema de e-commerce moderno construido con **Arquitectura Hexagonal (Clean Architecture)** que maneja el flujo completo desde la creación de órdenes hasta su confirmación mediante procesamiento asíncrono.

## 🏗️ Arquitectura del Sistema

### Flujo Principal
```
API REST → Validación → Kafka → Procesamiento Asíncrono → Confirmación
```

### Diagrama de Arquitectura
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │    MongoDB      │    │     Kafka       │
│   (Inventory)   │    │   (Orders)      │    │   (Events)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Application    │
                    │  (REST API)     │
                    └─────────────────┘
```

## 🎯 Características Principales

### ✅ **Arquitectura Hexagonal (Clean Architecture)**
- **Dominio**: Entidades, errores y lógica de negocio pura
- **Casos de Uso**: Orquestación de la lógica de aplicación
- **Puertos**: Interfaces/contratos para servicios externos
- **Adaptadores**: Implementaciones concretas (PostgreSQL, MongoDB, Kafka)

### ✅ **Patrones Implementados**
- **Repository Pattern**: Abstracción de persistencia
- **Command/Query Separation**: Separación de escritura y lectura
- **Event Sourcing**: Eventos de dominio para comunicación asíncrona
- **Dependency Injection**: Inversión de dependencias
- **Idempotencia**: Manejo de requests duplicados

### ✅ **Características Avanzadas**
- **Persistencia Polyglot**: PostgreSQL + MongoDB según necesidades
- **Procesamiento Asíncrono**: Kafka con Protobuf
- **Manejo de Errores**: Excepciones de dominio tipadas
- **Transaccionalidad**: Reserva de inventario con rollback
- **Idempotencia**: Tabla dedicada para evitar procesamiento duplicado
- **Configuración Modular**: Base compartida + específica por componente

## 📁 Estructura del Proyecto

```
apps/
├── common/                          # 🔧 Código compartido
│   └── config/
│       └── base.py                  # Configuración base (DB, Kafka, etc.)
├── domain/                          # 🏛️ Capa de Dominio
│   ├── entities.py                  # Entidades de negocio
│   └── errors.py                    # Excepciones de dominio
├── usecase/                         # 📋 Casos de Uso
│   ├── commands.py                  # DTOs de entrada
│   ├── create_order.py              # Crear orden (Command)
│   ├── get_products.py              # Obtener productos (Query)
│   ├── get_inventory.py             # Consultar inventario (Query)
│   ├── get_order.py                 # Obtener orden (Query)
│   ├── list_user_orders.py          # Listar órdenes (Query)
│   └── ports/                       # 🔌 Puertos (Interfaces)
│       ├── product_repo.py
│       ├── inventory_repo.py
│       ├── order_read_repo.py
│       ├── event_bus.py
│       ├── idempotency_store.py
│       ├── payment_gateway.py
│       ├── clock.py
│       └── uuid_gen.py
├── infrastructure/                  # 🔧 Adaptadores
│   ├── config/
│   │   └── worker_settings.py       # Configuración específica del worker
│   ├── http/
│   │   └── flask_app.py             # Controlador REST
│   ├── persistence/
│   │   ├── postgres/                # Adaptador PostgreSQL
│   │   │   ├── models.py
│   │   │   ├── session.py
│   │   │   ├── product_repo_impl.py
│   │   │   ├── inventory_repo_impl.py
│   │   │   └── idempotency_store_impl.py
│   │   └── mongo/                   # Adaptador MongoDB
│   │       ├── client.py
│   │       └── order_read_repo_impl.py
│   ├── messaging/
│   │   └── kafka/
│   │       └── publisher_impl.py    # Publicador de eventos
│   └── services/
│       ├── clock_impl.py            # Servicio de tiempo
│       └── uuid_impl.py             # Generador de UUIDs
├── api/                             # 🌐 Punto de entrada API
│   └── wsgi.py
└── worker/                          # ⚙️ Procesador asíncrono
    └── main.py
```

## 🚀 Configuración y Setup

### Prerrequisitos
- **Docker & Docker Compose**
- **Python 3.11+**
- **uv** (gestor de dependencias)

### 1. Iniciar Todo el Sistema
```bash
# Un solo comando para levantar todo el sistema completo
docker compose up --build -d
```

¡Eso es todo! El sistema se encarga automáticamente de:
- ✅ Levantar PostgreSQL con datos iniciales
- ✅ Levantar MongoDB 
- ✅ Levantar Kafka y crear topics automáticamente
- ✅ Construir y levantar la API REST
- ✅ Construir y levantar el Worker asíncrono
- ✅ Configurar todas las dependencias y health checks

### 2. Configuración de la Aplicación

#### Variables de Entorno (opcional)
Crear archivo `.env` en la raíz del proyecto:
```env
# ===================================
# Variables de Entorno - Sistema de Órdenes
# ===================================

# === BASE DE DATOS ===
# PostgreSQL (inventario, productos, idempotencia)
POSTGRES_DSN=postgresql+psycopg://postgres:postgres123@localhost:5432/ecommerce_inventory

# MongoDB (órdenes completadas)
MONGO_URI=mongodb://admin:admin123@localhost:57017/?authSource=admin
MONGO_DB=ecommerce_orders

# === KAFKA ===
# Brokers y topic principal
KAFKA_BROKERS=localhost:9092
KAFKA_TOPIC_ORDERS_CREATED=orders.created

# === WORKER KAFKA CONSUMER ===
# Configuración específica del consumer
KAFKA_GROUP_ID=orders-worker
KAFKA_AUTO_OFFSET_RESET=earliest
KAFKA_ENABLE_AUTO_COMMIT=true

# === NEGOCIO ===
# Tasa de impuesto (8%)
TAX_RATE=0.08
```

> **Nota**: Todas estas variables tienen valores por defecto en el código, por lo que el archivo `.env` es completamente opcional. Solo créalo si necesitas sobrescribir algún valor.

### 2. Verificar que Todo Funciona
```bash
# Ver estado de todos los servicios
docker compose ps

# Ver logs en tiempo real
docker compose logs -f

# Probar la API
curl http://localhost:8080/api/v1/health
```

### 3. Detener el Sistema
```bash
# Detener todos los servicios
docker compose down

# Detener y eliminar datos (reset completo)
docker compose down -v
```

## 🌐 API Endpoints

### Base URL
```
http://localhost:8080/api/v1
```

### 1. Health Check
```http
GET /health
```

**Respuesta:**
```json
{
  "status": "healthy",
  "timestamp": "2024-08-04T10:30:00Z"
}
```

### 2. Productos

#### Listar todos los productos
```http
GET /products
```

#### Buscar producto por SKU
```http
GET /products?sku=LAPTOP001
```

**Respuesta:**
```json
{
  "products": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "sku": "LAPTOP001",
      "name": "Gaming Laptop Pro",
      "price": 1299.99,
      "available_quantity": 15
    }
  ]
}
```

### 3. Inventario

#### Consultar inventario por SKU
```http
GET /products/{sku}/inventory
```

**Ejemplo:**
```http
GET /products/LAPTOP001/inventory
```

**Respuesta:**
```json
{
  "sku": "LAPTOP001",
  "product_name": "Gaming Laptop Pro",
  "available_quantity": 15,
  "reserved_quantity": 3
}
```

### 4. Órdenes

#### Crear Orden (Idempotente)
```http
POST /orders
Content-Type: application/json
Idempotency-Key: order-12345-67890
```

**Payload:**
```json
{
  "customer": {
    "user_id": "user_12345",
    "email": "customer@example.com"
  },
  "items": [
    {
      "sku": "LAPTOP001",
      "quantity": 1
    },
    {
      "sku": "MOUSE001",
      "quantity": 2
    }
  ]
}
```

**Respuesta:**
```json
{
  "order_id": "ORD-2024-001234",
  "status": "pending",
  "message": "Orden creada exitosamente y encolada para procesamiento",
  "estimated_total": 1459.97,
  "created_at": "2024-08-04T10:25:00Z"
}
```

#### Consultar Estado de Orden
```http
GET /orders/{order_id}
```

**Respuesta:**
```json
{
  "order_id": "ORD-2024-001234",
  "status": "confirmed",
  "customer": {
    "user_id": "user_12345",
    "email": "customer@example.com"
  },
  "items": [
    {
      "sku": "LAPTOP001",
      "name": "Gaming Laptop Pro",
      "price": 1299.99,
      "quantity": 1
    }
  ],
  "pricing": {
    "subtotal": 1459.97,
    "tax": 116.80,
    "total": 1576.77
  },
  "payment": {
    "status": "completed",
    "transaction_id": "txn_abc123xyz"
  },
  "created_at": "2024-08-04T10:25:00Z",
  "updated_at": "2024-08-04T10:30:00Z"
}
```

#### Listar Órdenes por Usuario
```http
GET /users/{user_id}/orders?page=1&limit=10
```

**Respuesta:**
```json
{
  "orders": [
    {
      "order_id": "ORD-2024-001234",
      "status": "confirmed",
      "total": 1576.77,
      "created_at": "2024-08-04T10:25:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "has_more": false
  }
}
```

## 🔄 Flujo de Procesamiento

### 1. Creación de Orden (Síncrono)
1. **Validación**: Datos de entrada y existencia de productos
2. **Reserva de Inventario**: Transacción atómica en PostgreSQL
3. **Snapshot Inicial**: Guardado en MongoDB como "pending"
4. **Publicación de Evento**: Envío a Kafka
5. **Respuesta**: Confirmación inmediata al cliente

### 2. Procesamiento Asíncrono (Worker)
1. **Consumo de Evento**: Lectura desde Kafka
2. **Simulación de Pago**: Procesamiento ficticio
3. **Confirmación/Liberación**: 
   - ✅ **Éxito**: Consume inventario reservado
   - ❌ **Fallo**: Libera reserva de inventario
4. **Actualización**: Estado final en MongoDB

## ⚙️ Configuración Modular

### Estructura de Configuración
```
apps/
├── common/config/base.py           # 🔧 Compartida (DB, Kafka, etc.)
└── infrastructure/config/
    └── worker_settings.py          # ⚙️ Específica del Worker
```

### Configuración Base (Compartida)
```python
class BaseAppSettings(BaseSettings):
    # PostgreSQL
    postgres_dsn: str = "postgresql+psycopg://..."
    
    # MongoDB  
    mongo_uri: str = "mongodb://..."
    mongo_db: str = "ecommerce_orders"
    
    # Kafka
    kafka_brokers: str = "localhost:9092"
    kafka_topic_orders_created: str = "orders.created"
    
    # Negocio
    tax_rate: float = 0.08
```

### Configuración del Worker
```python
class WorkerSettings(BaseAppSettings):  # Hereda de base
    # Kafka Consumer específico
    kafka_group_id: str = "orders-worker"
    kafka_auto_offset_reset: str = "earliest"
    kafka_enable_auto_commit: bool = True
```

## 🛠️ Comandos Útiles

### Docker & Infraestructura
```bash
make up              # Levantar servicios
make down            # Detener servicios
make status          # Ver estado
make logs            # Ver logs
make clean           # Limpiar todo
```

### Kafka
```bash
make kafka-topics                    # Listar topics
make kafka-create-topics            # Crear topics necesarios
make kafka-console-consumer TOPIC=orders.created  # Consumir mensajes
```

### Base de Datos
```bash
make postgres-shell    # Shell de PostgreSQL
make mongodb-shell     # Shell de MongoDB
make test-postgres     # Probar conexión PostgreSQL
make test-mongodb      # Probar conexión MongoDB
```

## 🔍 Casos de Error Manejados

### 1. Producto No Encontrado
```json
{
  "error": "product_not_found",
  "message": "Product with SKU INVALID001 not found"
}
```

### 2. Inventario Insuficiente
```json
{
  "error": "insufficient_inventory", 
  "message": "Not enough inventory for LAPTOP001. Available: 15, Requested: 100"
}
```

### 3. Conflicto de Idempotencia
```json
{
  "error": "idempotency_conflict",
  "message": "Idempotency key used with different payload"
}
```

### 4. Fallo de Pago (Simulado)
```json
{
  "order_id": "ORD-2024-001235",
  "status": "failed",
  "error": "payment_failed",
  "message": "Payment processing failed. Inventory has been released."
}
```

## 🎯 Mejoras Implementadas

### ✅ **Arquitectura**
- **Clean Architecture**: Separación clara de responsabilidades
- **Dependency Inversion**: Puertos e interfaces bien definidos
- **Command/Query Separation**: Casos de uso específicos para cada operación

### ✅ **Manejo de Errores**
- **Excepciones de Dominio**: `ProductNotFound`, `InsufficientInventory`, `IdempotencyConflict`
- **Manejo Centralizado**: Cada caso de uso maneja sus excepciones específicas
- **Mensajes Claros**: Errores descriptivos para el cliente

### ✅ **Configuración**
- **Modular**: Base compartida + específica por componente
- **Herencia**: Configuraciones específicas heredan de la base
- **Variables de Entorno**: Soporte completo con valores por defecto

### ✅ **Casos de Uso**
- **Separados por Responsabilidad**: Un caso de uso por operación
- **Sin Lógica de Infraestructura**: Controllers limpios, solo HTTP
- **Reutilizables**: Misma lógica para diferentes interfaces (REST, GraphQL, etc.)

## 🏆 Beneficios de la Arquitectura

### 🎯 **Mantenibilidad**
- Código organizado por responsabilidades
- Fácil localización y modificación de funcionalidades
- Separación clara entre lógica de negocio e infraestructura

### 🔄 **Escalabilidad**
- Nuevos casos de uso sin afectar existentes
- Cambio de tecnologías sin afectar lógica de negocio
- Adición de nuevas interfaces (GraphQL, gRPC) sin duplicar lógica

### 🛡️ **Robustez**
- Manejo consistente de errores
- Transacciones y rollbacks apropiados
- Idempotencia para operaciones críticas

---

## 📞 Soporte

Para dudas o problemas:
1. Revisar logs con `make logs`
2. Verificar estado de servicios con `make status`
3. Consultar configuración en archivos de settings

¡El sistema está listo para procesar órdenes de forma robusta y escalable! 🚀