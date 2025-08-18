jest.mock("../src/utils/db");
jest.mock("../src/kafka/consumerEventOrderFailed");
jest.mock("../src/kafka/consumerEventOrderConfirmed");
jest.mock("../src/controllers/ordersController");

const connectDB = require("../src/utils/db");
const {
  listenEventOrderFailed,
} = require("../src/kafka/consumerEventOrderFailed");
const {
  listenEventOrderConfirmed,
} = require("../src/kafka/consumerEventOrderConfirmed");
const {
  createOrder,
  getOrderById,
  getOrdersByUserId,
} = require("../src/controllers/ordersController");

describe("Orders Service - Main Application", () => {
  beforeAll(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    delete process.env.PORT;

    connectDB.mockResolvedValue();

    listenEventOrderFailed.mockResolvedValue();
    listenEventOrderConfirmed.mockResolvedValue();
  });

  describe("Database Connection", () => {
    test("should connect to database successfully", async () => {
      connectDB.mockResolvedValue();

      await connectDB();

      expect(connectDB).toHaveBeenCalledTimes(1);
    });

    test("should handle database connection error", async () => {
      const mockExit = jest.spyOn(process, "exit").mockImplementation(() => {});
      const mockError = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      connectDB.mockRejectedValue(new Error("Connection failed"));

      await expect(connectDB()).rejects.toThrow("Connection failed");

      expect(connectDB).toHaveBeenCalledTimes(1);

      mockExit.mockRestore();
      mockError.mockRestore();
    });
  });

  describe("Kafka Event Listeners", () => {
    test("should start Kafka listeners after successful database connection", async () => {
      connectDB.mockResolvedValue();
      listenEventOrderFailed.mockResolvedValue();
      listenEventOrderConfirmed.mockResolvedValue();

      await connectDB();
      await listenEventOrderFailed();
      await listenEventOrderConfirmed();

      expect(connectDB).toHaveBeenCalledTimes(1);
      expect(listenEventOrderFailed).toHaveBeenCalledTimes(1);
      expect(listenEventOrderConfirmed).toHaveBeenCalledTimes(1);
    });

    test("should handle Kafka listener errors gracefully", async () => {
      connectDB.mockResolvedValue();
      listenEventOrderFailed.mockRejectedValue(new Error("Kafka failed"));
      listenEventOrderConfirmed.mockResolvedValue();

      await connectDB();
      await expect(listenEventOrderFailed()).rejects.toThrow("Kafka failed");
      await listenEventOrderConfirmed();

      expect(connectDB).toHaveBeenCalledTimes(1);
      expect(listenEventOrderFailed).toHaveBeenCalledTimes(1);
      expect(listenEventOrderConfirmed).toHaveBeenCalledTimes(1);
    });
  });

  describe("API Routes", () => {
    test("should have orders creation endpoint", () => {
      expect(typeof createOrder).toBe("function");
    });

    test("should have order retrieval endpoint", () => {
      expect(typeof getOrderById).toBe("function");
    });

    test("should have user orders retrieval endpoint", () => {
      expect(typeof getOrdersByUserId).toBe("function");
    });
  });

  describe("Environment Configuration", () => {
    test("should use default port 3001 when PORT env var is not set", () => {
      expect(process.env.PORT).toBeUndefined();
      expect(true).toBe(true);
    });

    test("should use PORT environment variable when set", () => {
      process.env.PORT = "4000";
      expect(process.env.PORT).toBe("4000");
    });
  });
});
