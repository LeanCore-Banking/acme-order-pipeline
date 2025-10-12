````markdown
# ACME Order Pipeline

Sistema básico de procesamiento de órdenes con **FastAPI**, **PostgreSQL**, **MongoDB** y **Kafka**.
Simula el flujo de una tienda en línea: creación de orden → validación de inventario → procesamiento de pago → almacenamiento del resultado.

---

## Requisitos

* Docker y Docker Compose
* Python 3.12 (solo si se ejecuta fuera de Docker)
* Puerto **8080** disponible

---

## Levantar el sistema

Para iniciar todos los servicios en modo *detached* (segundo plano):

```bash
sudo docker compose up -d --build
````

Verificar los servicios que se están ejecutando:

```bash
sudo docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

### Endpoints principales

| Método | Ruta | Descripción |
| :--- | :--- | :--- |
| **`GET`** | `/health` | Estado del sistema |
| **`GET`** | `/api/v1/products` | Listar productos |
| **`GET`** | `/api/v1/products/{sku}/inventory` | Consultar inventario |
| **`POST`** | `/api/v1/orders/` | Crear nueva orden |
| **`GET`** | `/api/v1/orders/{order_id}` | Consultar una orden |
| **`GET`** | `/api/v1/users/{user_id}/orders` | Consultar órdenes de un usuario |

### Pruebas con Postman

El archivo `ACME Endpoints.postman_collection.json` contiene todos los endpoints configurados.

Para usarlo:

1.  Abrir Postman.
2.  Ir a **Import** → **File**.
3.  Seleccionar el archivo:
    ```
    ACME Endpoints.postman_collection.json
    ```

Ejecutar las peticiones en orden para probar el flujo completo.

### Ver logs del consumidor

Para monitorear el flujo de datos y el procesamiento de las órdenes:

```bash
sudo docker logs -f ecommerce_consumer
```

### Detener y limpiar el entorno

Para detener los contenedores y eliminar los volúmenes de datos (`-v`):

```bash
sudo docker compose down -v
```

-----

## Estructura del proyecto

```
acme-order-pipeline/
├── app/
│   ├── db/
│   ├── kafka/
│   ├── models/
│   ├── routers/
│   └── main.py
├── init-scripts/
├── proto/
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
├── README.md
└── ACME Endpoints.postman_collection.json
```

-----

## Autor

**Ramses Hidalgo**

Ingeniero de Sistemas – Backend Developer
```
