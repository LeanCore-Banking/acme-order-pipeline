// Global test setup for Jest
process.env.NODE_ENV = "test";

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
};

// Increase timeout for async operations
jest.setTimeout(10000);

// Global test utilities
global.testUtils = {
  // Helper to create mock request objects
  createMockRequest: (body = {}, params = {}, query = {}) => ({
    body,
    params,
    query,
    headers: {},
    method: "POST",
    url: "/test",
  }),

  // Helper to create mock response objects
  createMockResponse: () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    res.end = jest.fn().mockReturnValue(res);
    return res;
  },

  // Helper to create mock order data
  createMockOrderData: (overrides = {}) => ({
    items: [
      { sku: "SKU123", quantity: 2 },
      { sku: "SKU456", quantity: 1 },
    ],
    customer: {
      user_id: "user123",
      email: "test@example.com",
    },
    ...overrides,
  }),

  // Helper to create mock product data
  createMockProduct: (overrides = {}) => ({
    id: "product123",
    name: "Test Product",
    price: 75.0,
    Inventory: {
      available_quantity: 10,
      reserved_quantity: 2,
    },
    ...overrides,
  }),

  // Helper to create mock order event data
  createMockOrderEvent: (overrides = {}) => ({
    event_id: "evt_123456",
    order_id: "ORD-2024-123456",
    event_type: "ORDER_CREATED",
    timestamp: new Date("2024-01-01T00:00:00.000Z"),
    ...overrides,
  }),
};

beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});

afterAll(() => {
  jest.clearAllMocks();
  jest.restoreAllMocks();
});
