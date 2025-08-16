jest.mock("express", () => {
  const mExpress = {
    use: jest.fn(),
    post: jest.fn(),
    get: jest.fn(),
    listen: jest.fn((port, cb) => cb(Function)),
  };
  return Object.assign(() => mExpress, {
    json: jest.fn(() => "json-middleware-mock"),
  });
});

jest.mock("../src/utils/db", () => jest.fn(() => Promise.resolve()));

jest.mock("../src/controllers/ordersController", () => ({
  createOrder: jest.fn(),
  getOrderById: jest.fn(),
  getAllOrders: jest.fn(),
}));

describe("Orders Service app", () => {
  let express, app, connectDB, controllers;
  const PORT = Number(process.env.PORT) || 3001;

  beforeEach(() => {
    jest.resetModules();
    express = require("express");
    app = express();
    connectDB = require("../src/utils/db");
    controllers = require("../src/controllers/ordersController");
  });

  it("should set up middleware and routes, start server after DB connection", async () => {
    require("../src/index");
    await new Promise(process.nextTick);

    expect(app.use).toHaveBeenCalledWith("json-middleware-mock");
    expect(app.post).toHaveBeenCalledWith("/orders", controllers.createOrder);
    expect(app.get).toHaveBeenCalledWith("/orders", controllers.getAllOrders);
    expect(app.get).toHaveBeenCalledWith(
      "/orders/:orderId",
      controllers.getOrderById
    );
    expect(app.get).toHaveBeenCalledWith("/", expect.any(Function));
    expect(connectDB).toHaveBeenCalled();
    expect(app.listen).toHaveBeenCalledWith(
      PORT.toString(),
      expect.any(Function)
    );
  });

  it("should log message when server starts", async () => {
    const consoleLogSpy = jest
      .spyOn(console, "log")
      .mockImplementation(() => {});
    require("../src/index");
    await new Promise(process.nextTick);
    expect(consoleLogSpy).toHaveBeenCalledWith(
      `Orders Service running on port ${PORT}`
    );
    consoleLogSpy.mockRestore();
  });
});
