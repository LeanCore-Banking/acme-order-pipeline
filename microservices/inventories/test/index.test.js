jest.mock("express", () => {
  const mExpress = {
    get: jest.fn(),
    listen: jest.fn((port, cb) => cb()),
    use: jest.fn(),
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

describe("Inventories Service app", () => {
  let express;
  let app;
  let sequelize;
  let controllers;
  const PORT = process.env.PORT || 3002;

  beforeEach(() => {
    jest.resetModules();

    express = require("express");
    sequelize = require("../src/utils/db");
    controllers = require("../src/controllers/inventoriesController");

    app = express();
  });

  it("should set up routes properly and start server on successful DB connect", async () => {
    sequelize.authenticate.mockResolvedValue();
    sequelize.sync.mockResolvedValue();

    require("../src/index");

    await new Promise(process.nextTick);

    expect(app.get).toHaveBeenCalledWith(
      "/inventory/products",
      controllers.getAllInventoryProducts
    );
    expect(app.get).toHaveBeenCalledWith(
      "/inventory/products/:sku",
      controllers.getInventoryProductBySku
    );
    expect(app.get).toHaveBeenCalledWith("/", expect.any(Function));

    expect(sequelize.authenticate).toHaveBeenCalled();
    expect(sequelize.sync).toHaveBeenCalledWith({ alter: true });

    expect(app.listen).toHaveBeenCalledWith(PORT, expect.any(Function));
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
    expect(sequelize.sync).not.toHaveBeenCalled();
    expect(app.listen).not.toHaveBeenCalled();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "PostgreSQL connection error:",
      error
    );

    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });
});
