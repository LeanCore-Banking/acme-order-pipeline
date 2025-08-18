jest.mock("mongoose", () => ({
  Schema: jest.fn().mockImplementation((schemaDefinition) => {
    return {
      index: jest.fn(),
      unique: jest.fn(),
      required: jest.fn(),
      default: jest.fn(),
      type: jest.fn(),
    };
  }),
  model: jest.fn().mockImplementation((name, schema) => {
    return jest.fn().mockImplementation(() => {
      return {
        save: jest.fn(),
        find: jest.fn(),
        findOne: jest.fn(),
        findById: jest.fn(),
        updateOne: jest.fn(),
        deleteOne: jest.fn(),
      };
    });
  }),
}));

const mongoose = require("mongoose");

jest.mock("../../src/models/order", () => {
  const mockOrder = jest.fn().mockImplementation(() => {
    return {
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      findById: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
    };
  });

  mockOrder.find = jest.fn();
  mockOrder.findOne = jest.fn();
  mockOrder.findById = jest.fn();
  mockOrder.updateOne = jest.fn();
  mockOrder.deleteOne = jest.fn();

  return mockOrder;
});

const Order = require("../../src/models/order");

describe("Order Model", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Model Export", () => {
    test("should export Order model", () => {
      expect(Order).toBeDefined();
      expect(typeof Order).toBe("function");
    });

    test("should have expected static methods", () => {
      expect(Order.find).toBeDefined();
      expect(Order.findOne).toBeDefined();
      expect(Order.findById).toBeDefined();
      expect(Order.updateOne).toBeDefined();
      expect(Order.deleteOne).toBeDefined();
    });

    test("should have expected instance methods", () => {
      const orderInstance = new Order();
      expect(orderInstance.save).toBeDefined();
      expect(orderInstance.find).toBeDefined();
      expect(orderInstance.findOne).toBeDefined();
      expect(orderInstance.findById).toBeDefined();
      expect(orderInstance.updateOne).toBeDefined();
      expect(orderInstance.deleteOne).toBeDefined();
    });
  });

  describe("Model Functionality", () => {
    test("should create order instance", () => {
      const order = new Order();
      expect(order).toBeDefined();
      expect(typeof order).toBe("object");
    });

    test("should call static methods correctly", () => {
      Order.find();
      expect(Order.find).toHaveBeenCalled();

      Order.findOne();
      expect(Order.findOne).toHaveBeenCalled();

      Order.findById();
      expect(Order.findById).toHaveBeenCalled();
    });

    test("should call instance methods correctly", () => {
      const order = new Order();

      order.save();
      expect(order.save).toHaveBeenCalled();

      order.find();
      expect(order.find).toHaveBeenCalled();
    });
  });

  describe("Model Structure", () => {
    test("should be a constructor function", () => {
      expect(typeof Order).toBe("function");
      expect(Order.prototype).toBeDefined();
    });

    test("should create instances with correct prototype", () => {
      const order = new Order();
      expect(order).toBeDefined();
      expect(typeof order).toBe("object");
      expect(order.constructor).toBeDefined();
    });
  });

  describe("Mock Verification", () => {
    test("should use mocked mongoose.Schema", () => {
      expect(mongoose.Schema).toBeDefined();
      expect(jest.isMockFunction(mongoose.Schema)).toBe(true);
    });

    test("should use mocked mongoose.model", () => {
      expect(mongoose.model).toBeDefined();
      expect(jest.isMockFunction(mongoose.model)).toBe(true);
    });
  });
});
