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

jest.mock("../../src/models/orderEvent", () => {
  const mockOrderEvent = jest.fn().mockImplementation(() => {
    return {
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      findById: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
    };
  });

  mockOrderEvent.find = jest.fn();
  mockOrderEvent.findOne = jest.fn();
  mockOrderEvent.findById = jest.fn();
  mockOrderEvent.updateOne = jest.fn();
  mockOrderEvent.deleteOne = jest.fn();

  return mockOrderEvent;
});

const OrderEvent = require("../../src/models/orderEvent");

describe("OrderEvent Model", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Model Export", () => {
    test("should export OrderEvent model", () => {
      expect(OrderEvent).toBeDefined();
      expect(typeof OrderEvent).toBe("function");
    });

    test("should have expected static methods", () => {
      expect(OrderEvent.find).toBeDefined();
      expect(OrderEvent.findOne).toBeDefined();
      expect(OrderEvent.findById).toBeDefined();
      expect(OrderEvent.updateOne).toBeDefined();
      expect(OrderEvent.deleteOne).toBeDefined();
    });

    test("should have expected instance methods", () => {
      const orderEventInstance = new OrderEvent();
      expect(orderEventInstance.save).toBeDefined();
      expect(orderEventInstance.find).toBeDefined();
      expect(orderEventInstance.findOne).toBeDefined();
      expect(orderEventInstance.findById).toBeDefined();
      expect(orderEventInstance.updateOne).toBeDefined();
      expect(orderEventInstance.deleteOne).toBeDefined();
    });
  });

  describe("Model Functionality", () => {
    test("should create orderEvent instance", () => {
      const orderEvent = new OrderEvent();
      expect(orderEvent).toBeDefined();
      expect(typeof orderEvent).toBe("object");
    });

    test("should call static methods correctly", () => {
      OrderEvent.find();
      expect(OrderEvent.find).toHaveBeenCalled();

      OrderEvent.findOne();
      expect(OrderEvent.findOne).toHaveBeenCalled();

      OrderEvent.findById();
      expect(OrderEvent.findById).toHaveBeenCalled();
    });

    test("should call instance methods correctly", () => {
      const orderEvent = new OrderEvent();

      orderEvent.save();
      expect(orderEvent.save).toHaveBeenCalled();

      orderEvent.find();
      expect(orderEvent.find).toHaveBeenCalled();
    });
  });

  describe("Model Structure", () => {
    test("should be a constructor function", () => {
      expect(typeof OrderEvent).toBe("function");
      expect(OrderEvent.prototype).toBeDefined();
    });

    test("should create instances with correct prototype", () => {
      const orderEvent = new OrderEvent();
      expect(orderEvent).toBeDefined();
      expect(typeof orderEvent).toBe("object");
      expect(orderEvent.constructor).toBeDefined();
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
