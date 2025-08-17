jest.mock("express", () => {
  const mExpress = {
    get: jest.fn(),
    listen: jest.fn((port, cb) => cb()),
    use: jest.fn(),
    Router: jest.fn(() => ({
      get: jest.fn(),
      use: jest.fn(),
    })),
  };
  return jest.fn(() => mExpress);
});

jest.mock("../src/utils/db", () => ({
  authenticate: jest.fn(),
  sync: jest.fn(),
}));

jest.mock("../src/controllers/inventoriesController", () => ({
  getInventoryProductBySku: jest.fn(),
  getAllInventoryProducts: jest.fn(),
}));

jest.mock("../src/kafka/consumerEventOrderCreated", () => ({
  listenEventOrderCreated: jest.fn(),
}));

describe("Inventories Service app", () => {
  let express;
  let app;
  let sequelize;
  let controllers;
  let kafkaConsumer;
  let v1Router;
  const PORT = process.env.PORT || 3002;

  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();

    express = require("express");
    sequelize = require("../src/utils/db");
    controllers = require("../src/controllers/inventoriesController");
    kafkaConsumer = require("../src/kafka/consumerEventOrderCreated");

    app = express();
    v1Router = express.Router();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should set up routes properly and start server on successful DB connect", async () => {
    sequelize.authenticate.mockResolvedValue();
    sequelize.sync.mockResolvedValue();
    kafkaConsumer.listenEventOrderCreated.mockResolvedValue();

    require("../src/index");

    await new Promise(process.nextTick);

    // Verify route setup
    expect(app.get).toHaveBeenCalledWith("/", expect.any(Function));
    expect(v1Router.get).toHaveBeenCalledWith(
      "/products",
      controllers.getAllInventoryProducts
    );
    expect(v1Router.get).toHaveBeenCalledWith(
      "/products/:sku/inventory",
      controllers.getInventoryProductBySku
    );

    // Verify middleware setup
    expect(app.use).toHaveBeenCalledWith("/api/v1", v1Router);

    // Verify database operations
    expect(sequelize.authenticate).toHaveBeenCalled();
    expect(sequelize.authenticate).toHaveBeenCalledTimes(1);
    expect(sequelize.sync).toHaveBeenCalledWith({ alter: true });
    expect(sequelize.sync).toHaveBeenCalledTimes(1);

    // Verify Kafka consumer setup
    expect(kafkaConsumer.listenEventOrderCreated).toHaveBeenCalled();
    expect(kafkaConsumer.listenEventOrderCreated).toHaveBeenCalledTimes(1);

    // Verify server startup
    expect(app.listen).toHaveBeenCalledWith(PORT, expect.any(Function));
    expect(app.listen).toHaveBeenCalledTimes(1);
  });

  it("should log error and not start server on DB connection failure", async () => {
    const error = new Error("DB Connection Failed");
    sequelize.authenticate.mockRejectedValue(error);

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const consoleLogSpy = jest
      .spyOn(console, "log")
      .mockImplementation(() => {});

    require("../src/index");

    await new Promise(process.nextTick);

    expect(sequelize.authenticate).toHaveBeenCalled();
    expect(sequelize.authenticate).toHaveBeenCalledTimes(1);
    expect(sequelize.sync).not.toHaveBeenCalled();
    expect(kafkaConsumer.listenEventOrderCreated).not.toHaveBeenCalled();
    expect(app.listen).not.toHaveBeenCalled();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "PostgreSQL connection error:",
      error
    );
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  it("should handle DB sync failure", async () => {
    sequelize.authenticate.mockResolvedValue();
    const syncError = new Error("DB Sync Failed");
    sequelize.sync.mockRejectedValue(syncError);

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const consoleLogSpy = jest
      .spyOn(console, "log")
      .mockImplementation(() => {});

    require("../src/index");

    await new Promise(process.nextTick);

    expect(sequelize.authenticate).toHaveBeenCalled();
    expect(sequelize.sync).toHaveBeenCalledWith({ alter: true });
    expect(kafkaConsumer.listenEventOrderCreated).not.toHaveBeenCalled();
    expect(app.listen).not.toHaveBeenCalled();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "PostgreSQL connection error:",
      syncError
    );

    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  it("should handle Kafka consumer setup failure", async () => {
    sequelize.authenticate.mockResolvedValue();
    sequelize.sync.mockResolvedValue();
    const kafkaError = new Error("Kafka Consumer Failed");
    kafkaConsumer.listenEventOrderCreated.mockRejectedValue(kafkaError);

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const consoleLogSpy = jest
      .spyOn(console, "log")
      .mockImplementation(() => {});

    require("../src/index");

    await new Promise(process.nextTick);

    expect(sequelize.authenticate).toHaveBeenCalled();
    expect(sequelize.sync).toHaveBeenCalled();
    expect(kafkaConsumer.listenEventOrderCreated).toHaveBeenCalled();
    expect(app.listen).not.toHaveBeenCalled();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "PostgreSQL connection error:",
      kafkaError
    );

    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  it("should handle server startup failure", async () => {
    sequelize.authenticate.mockResolvedValue();
    sequelize.sync.mockResolvedValue();
    kafkaConsumer.listenEventOrderCreated.mockResolvedValue();

    const serverError = new Error("Server Startup Failed");
    app.listen.mockImplementation((port, callback) => {
      callback(serverError);
    });

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const consoleLogSpy = jest
      .spyOn(console, "log")
      .mockImplementation(() => {});

    require("../src/index");

    await new Promise(process.nextTick);

    expect(sequelize.authenticate).toHaveBeenCalled();
    expect(sequelize.sync).toHaveBeenCalled();
    expect(kafkaConsumer.listenEventOrderCreated).toHaveBeenCalled();
    expect(app.listen).toHaveBeenCalled();

    // Server startup error should not be logged as DB connection error
    expect(consoleErrorSpy).not.toHaveBeenCalledWith(
      "PostgreSQL connection error:",
      serverError
    );

    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  it("should use correct port from environment variable", async () => {
    const customPort = "4000";
    process.env.PORT = customPort;

    sequelize.authenticate.mockResolvedValue();
    sequelize.sync.mockResolvedValue();
    kafkaConsumer.listenEventOrderCreated.mockResolvedValue();

    require("../src/index");

    await new Promise(process.nextTick);

    expect(app.listen).toHaveBeenCalledWith(customPort, expect.any(Function));

    // Reset environment variable
    delete process.env.PORT;
  });

  it("should handle multiple rapid startup attempts", async () => {
    sequelize.authenticate.mockResolvedValue();
    sequelize.sync.mockResolvedValue();
    kafkaConsumer.listenEventOrderCreated.mockResolvedValue();

    // Simulate multiple rapid calls
    require("../src/index");
    require("../src/index");

    await new Promise(process.nextTick);

    expect(sequelize.authenticate).toHaveBeenCalledTimes(2);
    expect(sequelize.sync).toHaveBeenCalledTimes(2);
    expect(kafkaConsumer.listenEventOrderCreated).toHaveBeenCalledTimes(2);
    expect(app.listen).toHaveBeenCalledTimes(2);
  });

  it("should handle undefined environment variables gracefully", async () => {
    const originalEnv = { ...process.env };
    delete process.env.PORT;
    delete process.env.PG_DATABASE;
    delete process.env.PG_USER;
    delete process.env.PG_PASSWORD;
    delete process.env.PG_HOST;

    sequelize.authenticate.mockResolvedValue();
    sequelize.sync.mockResolvedValue();
    kafkaConsumer.listenEventOrderCreated.mockResolvedValue();

    require("../src/index");

    await new Promise(process.nextTick);

    expect(app.listen).toHaveBeenCalledWith(3002, expect.any(Function));

    // Restore environment variables
    process.env = originalEnv;
  });

  it("should handle route handler execution", async () => {
    sequelize.authenticate.mockResolvedValue();
    sequelize.sync.mockResolvedValue();
    kafkaConsumer.listenEventOrderCreated.mockResolvedValue();

    require("../src/index");

    await new Promise(process.nextTick);

    // Get the root route handler
    const rootRouteCall = app.get.mock.calls.find((call) => call[0] === "/");
    expect(rootRouteCall).toBeDefined();

    const rootHandler = rootRouteCall[1];
    expect(typeof rootHandler).toBe("function");

    // Test the root route handler
    const mockReq = {};
    const mockRes = {
      send: jest.fn(),
    };

    rootHandler(mockReq, mockRes);

    expect(mockRes.send).toHaveBeenCalledWith(
      "Inventories Service API is running!"
    );
    expect(mockRes.send).toHaveBeenCalledTimes(1);
  });
});
