# Order Processing System

A microservices-based order processing system that handles the flow from order creation to confirmation using asynchronous event-driven architecture.

## Business Context

An online store needs to process simple orders. Each order must:

- Validate inventory availability
- Process payment asynchronously
- Update inventory
- Confirm the order

## System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │    MongoDB      │    │     Kafka       │
│   (Inventory)   │    │   (Orders)      │    │   (Events)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Microservices  │
                    │  (REST APIs)    │
                    └─────────────────┘
```

## Business Logic Flow

### 1. Order Creation
- The **Orders Microservice** receives a request to create an order
- Validates the information and creates the order in the database
- Emits an `ORDER_CREATED` event to Kafka with order data, customer information, and items

### 2. Inventory Validation
- The **Inventories Microservice** consumes the `ORDER_CREATED` event
- Reviews the stock of each requested product
- **If inventory is sufficient**: Updates the stock and emits an internal success event to continue the process
- **If any product has insufficient inventory**: Records the failure and emits an `ORDER_FAILED` event indicating the reason (e.g., `INSUFFICIENT_INVENTORY`)

### 3. Order Processing
- **Orders Microservice** consumes relevant events (`ORDER_CONFIRMED`, `ORDER_FAILED`, etc.)
- Updates the order status accordingly
- Notifies the user of the final result

## Technical Stack

- **Backend**: Node.js + JavaScript
- **Databases**: 
  - PostgreSQL (inventory and products)
  - MongoDB (orders)
- **Message Queue**: Kafka with Protocol Buffers (protobuf)
- **Containerization**: Docker + Docker Compose
- **Testing**: Jest with 100% coverage requirements

## Included Services

| Service | Port | Credentials | Purpose |
|---------|------|-------------|---------|
| PostgreSQL | 5432 | postgres/postgres123 | Inventory and products |
| MongoDB | 27017 | admin/admin123 | Completed orders |
| Kafka | 9092 | - | Asynchronous events |
| Orders MS | 3001 | - | Order management API |
| Inventories MS | 3002 | - | Inventory management API |

## Prerequisites

- Docker & Docker Compose
- Make (optional)
- Node.js 18+ (for local development)

## Getting Started

### 1. Start the System

```bash
# Start all containers
docker compose up -d

# Create Kafka topics
make kafka-create-topics
```

### 2. Verify System Status

```bash
# Check service status
make status

# Get connection information
make info

# View available commands
make help
```

## API Consumption Guide

### Orders Microservice (Port 3001)

#### Create Order
```bash
POST http://localhost:3001/api/v1/orders
Content-Type: application/json

{
  "customer": {
    "user_id": "user123",
    "email": "user@example.com"
  },
  "items": [
    {
      "product_id": "prod001",
      "sku": "LAPTOP001",
      "name": "Gaming Laptop",
      "price": 999.99,
      "quantity": 1
    }
  ]
}
```

#### Get Order Status
```bash
GET http://localhost:3001/api/v1/orders/{order_id}
```

#### Get All Orders
```bash
GET http://localhost:3001/api/v1/orders
```

### Inventories Microservice (Port 3002)

#### Get Product Inventory
```bash
GET http://localhost:3001/api/v1/products/{sku}/inventory
```

#### Get All Products
```bash
GET http://localhost:3001/api/v1/products
```

#### Health Check
```bash
GET http://localhost:3001/api/v1/
```

## Event Flow

### Kafka Topics

| Topic | Event Type | Description |
|-------|------------|-------------|
| `event-order-created` | `ORDER_CREATED` | Order creation event |
| `event-order-confirmed` | `ORDER_CONFIRMED` | Order confirmation event |
| `event-order-failed` | `ORDER_FAILED` | Order failure event |

### Event Structure

#### ORDER_CREATED
```json
{
  "event_id": "uuid",
  "order_id": "order123",
  "event_type": "ORDER_CREATED",
  "customer": {
    "user_id": "user123",
    "email": "user@example.com"
  },
  "items": [
    {
      "product_id": "prod001",
      "sku": "LAPTOP001",
      "name": "Gaming Laptop",
      "price": 999.99,
      "quantity": 1
    }
  ]
}
```

#### ORDER_FAILED
```json
{
  "event_id": "uuid",
  "order_id": "order123",
  "event_type": "ORDER_FAILED",
  "failure_reason": "INSUFFICIENT_INVENTORY",
  "error_message": "Insufficient stock for SKU LAPTOP001"
}
```

## Failure Handling

### Inventory Validation Failures

| Failure Reason | Description |
|----------------|-------------|
| `INVALID_PRODUCT` | Product not found in inventory |
| `INSUFFICIENT_INVENTORY` | Requested quantity exceeds available stock |

### Error Scenarios

1. **Product Not Found**: When a SKU doesn't exist in the inventory
2. **Insufficient Stock**: When available quantity minus reserved quantity is less than requested
3. **Database Connection Issues**: When services can't connect to their respective databases
4. **Kafka Communication Failures**: When event publishing or consumption fails

## Development

### Running Tests

```bash
# Run all tests with coverage
npm run test

# Run tests for specific microservice
cd microservices/orders && npm run test
cd microservices/inventories && npm run test
```

### Code Quality

- **Test Coverage**: 100% required for statements, branches, lines, and functions
- **Linting**: ESLint configuration for JavaScript
- **Mock Strategy**: Comprehensive mocking of external dependencies

### Local Development

```bash
# Start only dependencies
docker compose up -d postgres mongodb kafka

# Run microservices locally
cd microservices/orders && npm start
cd microservices/inventories && npm start
```

## Monitoring and Debugging

### Logs
```bash
# View all service logs
docker compose logs -f

# View specific service logs
docker compose logs -f orders
docker compose logs -f inventories
```

### Database Access
```bash
# PostgreSQL
docker compose exec postgres psql -U postgres -d postgres

# MongoDB
docker compose exec mongodb mongosh -u admin -p admin123
```

### Kafka Topics
```bash
# List topics
docker compose exec kafka kafka-topics --list --bootstrap-server localhost:9092

# View topic details
docker compose exec kafka kafka-topics --describe --topic event-order-created --bootstrap-server localhost:9092
```

## Troubleshooting

### Common Issues

1. **Port Conflicts**: Ensure ports 3001, 3002, 5432, 27017, and 9092 are available
2. **Kafka Topics**: Run `make kafka-create-topics` if events aren't being processed
3. **Database Connections**: Check if PostgreSQL and MongoDB containers are running
4. **Service Dependencies**: Ensure all services start in the correct order

### Health Checks

```bash
# Check if services are responding
curl http://localhost:3001/api/v1/health
curl http://localhost:3002/api/v1/
```

## Contributing

1. Ensure all tests pass with 100% coverage
2. Follow the established code structure and patterns
3. Add comprehensive tests for new functionality
4. Update documentation for any API changes

## License

This project is licensed under the ISC License.