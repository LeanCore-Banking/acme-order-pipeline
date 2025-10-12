

# ACME Order Pipeline
## Estructura del proyecto

```text
acme-order-pipeline/
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── utils.py
│   ├── api/
│   │   ├── __init__.py
│   │   ├── db.py
│   │   ├── main.py
│   │   ├── models.py
│   ├── consumer/
│   │   ├── __init__.py
│   │   ├── main.py
│   ├── proto/
│   │   └── order.proto
├── db/
│   ├── ddl.sql
│   ├── schema.js
├── init-scripts/
│   ├── mongodb/01-init.js
│   ├── postgres/01-init.sql
├── proto/
│   └── order_events.proto
├── docker-compose.yml
├── Makefile
├── README.md
```


Proyecto de prueba técnica: pipeline de órdenes con FastAPI, Kafka, PostgreSQL y MongoDB.

---

## Servicios

- **FastAPI API**: expone endpoint `/orders` para crear órdenes.
- **Worker**: procesa órdenes de Kafka y las guarda en PostgreSQL y MongoDB.
- **Kafka + Zookeeper**: manejo de mensajes de órdenes.
- **PostgreSQL**: inventario de productos.
- **MongoDB**: historial de órdenes.

---

## Requisitos

- Docker y Docker Compose instalados.
- Puerto 8000 disponible para la API.
- Puertos 5432 (PostgreSQL), 27017 (MongoDB), 9092 (Kafka).

---

## Levantar la aplicación

Desde la raíz del proyecto:

```bash
docker compose up -d
```

Verifica los contenedores:

```bash
docker compose ps
```

---

## Endpoints

### Crear orden (POST)

```
POST http://localhost:8000/orders
Content-Type: application/json
```

Body de ejemplo:

```json
{
   "items": [
      {"id": 1, "quantity": 2},
      {"id": 2, "quantity": 1}
   ]
}
```

Respuesta esperada:

```json
{
   "message": "Orden recibida",
   "order_id": "UUID_GENERADO"
}
```


### Documentación interactiva

Abre en tu navegador:

```
http://localhost:8000/docs#/default/create_order_orders_post
```

---

## Ver órdenes en MongoDB

```bash
docker exec -it ecommerce_mongodb mongosh -u admin -p admin123 --authenticationDatabase admin
```

En mongosh:

```js
use ecommerce_orders
db.orders.find().pretty()
```

---

## Ver inventario en PostgreSQL

```bash
docker exec -it ecommerce_postgres psql -U postgres -d ecommerce_inventory
```

Consultar productos:

```sql
SELECT * FROM products;
```

---

## Logs y debugging

API:

```bash
docker logs -f ecommerce_api
```

Worker:

```bash
docker logs -f ecommerce_worker
```

---

## Validaciones implementadas

- Verificación de stock disponible.
- Manejo de errores: producto inexistente, stock insuficiente.
- Worker registra órdenes en MongoDB y actualiza stock en PostgreSQL.

---

## Reiniciar la aplicación

```bash
docker compose down
docker compose up -d
```