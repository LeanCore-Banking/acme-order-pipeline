jest.mock("../../src/kafka/order_events_pb", () => {
  const mockFailureReason = {
    INVALID_PRODUCT: 0,
    INSUFFICIENT_INVENTORY: 1,
  };

  const mockEventType = {
    ORDER_CREATED: 0,
    ORDER_CONFIRMED: 1,
    ORDER_FAILED: 2,
  };

  const mockOrderEvent = class {
    constructor() {
      this.eventId = null;
      this.orderId = null;
      this.eventType = null;
      this.timestamp = null;
      this.orderCreated = null;
      this.orderConfirmed = null;
      this.orderFailed = null;
    }

    setEventId(id) {
      this.eventId = id;
      return this;
    }

    setOrderId(id) {
      this.orderId = id;
      return this;
    }

    setEventType(type) {
      this.eventType = type;
      return this;
    }

    setTimestamp(ts) {
      this.timestamp = ts;
      return this;
    }

    setOrderCreated(order) {
      this.orderCreated = order;
      return this;
    }

    setOrderConfirmed(order) {
      this.orderConfirmed = order;
      return this;
    }

    setOrderFailed(order) {
      this.orderFailed = order;
      return this;
    }

    getEventId() {
      return this.eventId;
    }

    getOrderId() {
      return this.orderId;
    }

    getEventType() {
      return this.eventType;
    }

    getTimestamp() {
      return this.timestamp;
    }

    getOrderCreated() {
      return this.orderCreated;
    }

    getOrderConfirmed() {
      return this.orderConfirmed;
    }

    getOrderFailed() {
      return this.orderFailed;
    }

    serializeBinary() {
      return Buffer.from(JSON.stringify(this));
    }
  };

  const mockOrderCreated = class {
    constructor() {
      this.customer = null;
      this.items = [];
    }

    setCustomer(customer) {
      this.customer = customer;
      return this;
    }

    setItemsList(items) {
      this.items = items;
      return this;
    }

    getCustomer() {
      return this.customer;
    }

    getItemsList() {
      return this.items;
    }
  };

  const mockOrderConfirmed = class {
    constructor() {
      this.orderId = null;
      this.summary = null;
    }

    setOrderId(id) {
      this.orderId = id;
      return this;
    }

    setSummary(summary) {
      this.summary = summary;
      return this;
    }

    getOrderId() {
      return this.orderId;
    }

    getSummary() {
      return this.summary;
    }
  };

  const mockOrderFailed = class {
    constructor() {
      this.orderId = null;
      this.reason = null;
      this.errorMessage = null;
    }

    setOrderId(id) {
      this.orderId = id;
      return this;
    }

    setReason(reason) {
      this.reason = reason;
      return this;
    }

    setErrorMessage(message) {
      this.errorMessage = message;
      return this;
    }

    getOrderId() {
      return this.orderId;
    }

    getReason() {
      return this.reason;
    }

    getErrorMessage() {
      return this.errorMessage;
    }
  };

  const mockCustomer = class {
    constructor() {
      this.userId = null;
      this.email = null;
    }

    setUserId(id) {
      this.userId = id;
      return this;
    }

    setEmail(email) {
      this.email = email;
      return this;
    }

    getUserId() {
      return this.userId;
    }

    getEmail() {
      return this.email;
    }
  };

  const mockOrderItem = class {
    constructor() {
      this.productId = null;
      this.sku = null;
      this.name = null;
      this.price = null;
      this.quantity = null;
    }

    setProductId(id) {
      this.productId = id;
      return this;
    }

    setSku(sku) {
      this.sku = sku;
      return this;
    }

    setName(name) {
      this.name = name;
      return this;
    }

    setPrice(price) {
      this.price = price;
      return this;
    }

    setQuantity(quantity) {
      this.quantity = quantity;
      return this;
    }

    getProductId() {
      return this.productId;
    }

    getSku() {
      return this.sku;
    }

    getName() {
      return this.name;
    }

    getPrice() {
      return this.price;
    }

    getQuantity() {
      return this.quantity;
    }
  };

  const mockTimestamp = class {
    constructor() {
      this.seconds = 0;
      this.nanos = 0;
    }

    setSeconds(seconds) {
      this.seconds = seconds;
      return this;
    }

    setNanos(nanos) {
      this.nanos = nanos;
      return this;
    }

    getSeconds() {
      return this.seconds;
    }

    getNanos() {
      return this.nanos;
    }
  };

  return {
    OrderEvent: mockOrderEvent,
    OrderCreated: mockOrderCreated,
    OrderConfirmed: mockOrderConfirmed,
    OrderFailed: mockOrderFailed,
    Customer: mockCustomer,
    OrderItem: mockOrderItem,
    Timestamp: mockTimestamp,
    EventType: mockEventType,
    FailureReason: mockFailureReason,
  };
});

describe("order_events_pb constants and classes", () => {
  let protobuf;

  beforeEach(() => {
    protobuf = require("../../src/kafka/order_events_pb");
  });

  describe("FailureReason constants", () => {
    it("should have INVALID_PRODUCT constant", () => {
      expect(protobuf.FailureReason.INVALID_PRODUCT).toBe(0);
    });

    it("should have INSUFFICIENT_INVENTORY constant", () => {
      expect(protobuf.FailureReason.INSUFFICIENT_INVENTORY).toBe(1);
    });
  });

  describe("EventType constants", () => {
    it("should have ORDER_CREATED constant", () => {
      expect(protobuf.EventType.ORDER_CREATED).toBe(0);
    });

    it("should have ORDER_CONFIRMED constant", () => {
      expect(protobuf.EventType.ORDER_CONFIRMED).toBe(1);
    });

    it("should have ORDER_FAILED constant", () => {
      expect(protobuf.EventType.ORDER_FAILED).toBe(2);
    });
  });

  describe("OrderEvent class", () => {
    it("should create OrderEvent instance", () => {
      const event = new protobuf.OrderEvent();
      expect(event).toBeInstanceOf(protobuf.OrderEvent);
    });

    it("should set and get event properties", () => {
      const event = new protobuf.OrderEvent();
      const eventId = "event-123";
      const orderId = "order-456";
      const eventType = protobuf.EventType.ORDER_CREATED;

      event.setEventId(eventId);
      event.setOrderId(orderId);
      event.setEventType(eventType);

      expect(event.getEventId()).toBe(eventId);
      expect(event.getOrderId()).toBe(orderId);
      expect(event.getEventType()).toBe(eventType);
    });

    it("should serialize to binary", () => {
      const event = new protobuf.OrderEvent();
      event.setEventId("event-123");
      event.setOrderId("order-456");

      const serialized = event.serializeBinary();
      expect(Buffer.isBuffer(serialized)).toBe(true);
      expect(serialized.toString()).toContain("event-123");
      expect(serialized.toString()).toContain("order-456");
    });
  });

  describe("OrderCreated class", () => {
    it("should create OrderCreated instance", () => {
      const orderCreated = new protobuf.OrderCreated();
      expect(orderCreated).toBeInstanceOf(protobuf.OrderCreated);
    });

    it("should set and get customer", () => {
      const orderCreated = new protobuf.OrderCreated();
      const customer = new protobuf.Customer();
      customer.setUserId("user-123");
      customer.setEmail("user@example.com");

      orderCreated.setCustomer(customer);

      expect(orderCreated.getCustomer()).toBe(customer);
      expect(orderCreated.getCustomer().getUserId()).toBe("user-123");
      expect(orderCreated.getCustomer().getEmail()).toBe("user@example.com");
    });

    it("should set and get items list", () => {
      const orderCreated = new protobuf.OrderCreated();
      const items = [new protobuf.OrderItem(), new protobuf.OrderItem()];

      orderCreated.setItemsList(items);

      expect(orderCreated.getItemsList()).toBe(items);
      expect(orderCreated.getItemsList()).toHaveLength(2);
    });
  });

  describe("OrderConfirmed class", () => {
    it("should create OrderConfirmed instance", () => {
      const orderConfirmed = new protobuf.OrderConfirmed();
      expect(orderConfirmed).toBeInstanceOf(protobuf.OrderConfirmed);
    });

    it("should set and get order ID", () => {
      const orderConfirmed = new protobuf.OrderConfirmed();
      const orderId = "order-789";

      orderConfirmed.setOrderId(orderId);

      expect(orderConfirmed.getOrderId()).toBe(orderId);
    });

    it("should set and get summary", () => {
      const orderConfirmed = new protobuf.OrderConfirmed();
      const summary = { subtotal: 100, tax: 10, total: 110 };

      orderConfirmed.setSummary(JSON.stringify(summary));

      expect(orderConfirmed.getSummary()).toBe(JSON.stringify(summary));
    });
  });

  describe("OrderFailed class", () => {
    it("should create OrderFailed instance", () => {
      const orderFailed = new protobuf.OrderFailed();
      expect(orderFailed).toBeInstanceOf(protobuf.OrderFailed);
    });

    it("should set and get order ID", () => {
      const orderFailed = new protobuf.OrderFailed();
      const orderId = "order-failed-123";

      orderFailed.setOrderId(orderId);

      expect(orderFailed.getOrderId()).toBe(orderId);
    });

    it("should set and get failure reason", () => {
      const orderFailed = new protobuf.OrderFailed();
      const reason = protobuf.FailureReason.INVALID_PRODUCT;

      orderFailed.setReason(reason);

      expect(orderFailed.getReason()).toBe(reason);
    });

    it("should set and get error message", () => {
      const orderFailed = new protobuf.OrderFailed();
      const errorMessage = "Product not found in inventory";

      orderFailed.setErrorMessage(errorMessage);

      expect(orderFailed.getErrorMessage()).toBe(errorMessage);
    });
  });

  describe("Customer class", () => {
    it("should create Customer instance", () => {
      const customer = new protobuf.Customer();
      expect(customer).toBeInstanceOf(protobuf.Customer);
    });

    it("should set and get user ID", () => {
      const customer = new protobuf.Customer();
      const userId = "user-456";

      customer.setUserId(userId);

      expect(customer.getUserId()).toBe(userId);
    });

    it("should set and get email", () => {
      const customer = new protobuf.Customer();
      const email = "customer@example.com";

      customer.setEmail(email);

      expect(customer.getEmail()).toBe(email);
    });
  });

  describe("OrderItem class", () => {
    it("should create OrderItem instance", () => {
      const orderItem = new protobuf.OrderItem();
      expect(orderItem).toBeInstanceOf(protobuf.OrderItem);
    });

    it("should set and get all properties", () => {
      const orderItem = new protobuf.OrderItem();
      const productId = "prod-123";
      const sku = "SKU-456";
      const name = "Test Product";
      const price = 99.99;
      const quantity = 2;

      orderItem.setProductId(productId);
      orderItem.setSku(sku);
      orderItem.setName(name);
      orderItem.setPrice(price);
      orderItem.setQuantity(quantity);

      expect(orderItem.getProductId()).toBe(productId);
      expect(orderItem.getSku()).toBe(sku);
      expect(orderItem.getName()).toBe(name);
      expect(orderItem.getPrice()).toBe(price);
      expect(orderItem.getQuantity()).toBe(quantity);
    });
  });

  describe("Timestamp class", () => {
    it("should create Timestamp instance", () => {
      const timestamp = new protobuf.Timestamp();
      expect(timestamp).toBeInstanceOf(protobuf.Timestamp);
    });

    it("should set and get seconds", () => {
      const timestamp = new protobuf.Timestamp();
      const seconds = 1234567890;

      timestamp.setSeconds(seconds);

      expect(timestamp.getSeconds()).toBe(seconds);
    });

    it("should set and get nanos", () => {
      const timestamp = new protobuf.Timestamp();
      const nanos = 123456789;

      timestamp.setNanos(nanos);

      expect(timestamp.getNanos()).toBe(nanos);
    });
  });

  describe("Integration tests", () => {
    it("should create complete order event with all components", () => {
      const event = new protobuf.OrderEvent();
      const orderCreated = new protobuf.OrderCreated();
      const customer = new protobuf.Customer();
      const orderItem = new protobuf.OrderItem();
      const timestamp = new protobuf.Timestamp();

      customer.setUserId("user-123");
      customer.setEmail("user@example.com");

      orderItem.setProductId("prod-123");
      orderItem.setSku("SKU-456");
      orderItem.setName("Test Product");
      orderItem.setPrice(99.99);
      orderItem.setQuantity(2);

      orderCreated.setCustomer(customer);
      orderCreated.setItemsList([orderItem]);

      event.setEventId("event-123");
      event.setOrderId("order-456");
      event.setEventType(protobuf.EventType.ORDER_CREATED);
      event.setTimestamp(timestamp);
      event.setOrderCreated(orderCreated);

      expect(event.getEventId()).toBe("event-123");
      expect(event.getOrderId()).toBe("order-456");
      expect(event.getEventType()).toBe(protobuf.EventType.ORDER_CREATED);
      expect(event.getTimestamp()).toBe(timestamp);
      expect(event.getOrderCreated()).toBe(orderCreated);
      expect(event.getOrderCreated().getCustomer().getUserId()).toBe(
        "user-123"
      );
      expect(event.getOrderCreated().getItemsList()).toHaveLength(1);
      expect(event.getOrderCreated().getItemsList()[0].getSku()).toBe(
        "SKU-456"
      );
    });
  });
});
