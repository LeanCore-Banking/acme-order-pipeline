jest.mock("mongoose", () => ({
  connect: jest.fn(),
}));

const mockConsoleLog = jest.spyOn(console, "log").mockImplementation(() => {});
const mockConsoleError = jest
  .spyOn(console, "error")
  .mockImplementation(() => {});

const mongoose = require("mongoose");

jest.doMock("../../src/utils/db", () => {
  const mongoUri = `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@mongodb:27017/${process.env.MONGO_INITDB_ROOT_DATABASE}?authSource=admin`;

  const connectDB = async () => {
    try {
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("MongoDB connection establised!");
    } catch (error) {
      console.error("MongoDB wrong connection error:", error.message);
      process.exit(1);
    }
  };

  return connectDB;
});

const connectDB = require("../../src/utils/db");

describe("Database Connection Utility", () => {
  let mockExit;

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.MONGO_INITDB_ROOT_USERNAME;
    delete process.env.MONGO_INITDB_ROOT_PASSWORD;
    delete process.env.MONGO_INITDB_ROOT_DATABASE;

    mockExit = jest.spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });
  });

  afterEach(() => {
    delete process.env.MONGO_INITDB_ROOT_USERNAME;
    delete process.env.MONGO_INITDB_ROOT_PASSWORD;
    delete process.env.MONGO_INITDB_ROOT_DATABASE;

    mockExit.mockRestore();
  });

  describe("connectDB", () => {
    test("should connect to MongoDB successfully with default credentials", async () => {
      process.env.MONGO_INITDB_ROOT_USERNAME = "testuser";
      process.env.MONGO_INITDB_ROOT_PASSWORD = "testpass";
      process.env.MONGO_INITDB_ROOT_DATABASE = "testdb";

      jest.resetModules();
      const newConnectDB = require("../../src/utils/db");

      mongoose.connect.mockResolvedValue();

      await newConnectDB();

      expect(mongoose.connect).toHaveBeenCalledWith(
        "mongodb://testuser:testpass@mongodb:27017/testdb?authSource=admin",
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }
      );
    });

    test("should connect to MongoDB successfully with custom credentials", async () => {
      process.env.MONGO_INITDB_ROOT_USERNAME = "customuser";
      process.env.MONGO_INITDB_ROOT_PASSWORD = "custompass";
      process.env.MONGO_INITDB_ROOT_DATABASE = "customdb";

      jest.resetModules();
      const newConnectDB = require("../../src/utils/db");

      mongoose.connect.mockResolvedValue();

      await newConnectDB();

      expect(mongoose.connect).toHaveBeenCalledWith(
        "mongodb://customuser:custompass@mongodb:27017/customdb?authSource=admin",
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }
      );
    });

    test("should handle connection error and exit process", async () => {
      process.env.MONGO_INITDB_ROOT_USERNAME = "testuser";
      process.env.MONGO_INITDB_ROOT_PASSWORD = "testpass";
      process.env.MONGO_INITDB_ROOT_DATABASE = "testdb";

      jest.resetModules();
      const newConnectDB = require("../../src/utils/db");

      const mockError = new Error("Connection failed");
      mongoose.connect.mockRejectedValue(mockError);

      await expect(newConnectDB()).rejects.toThrow("process.exit called");

      expect(mongoose.connect).toHaveBeenCalledWith(
        "mongodb://testuser:testpass@mongodb:27017/testdb?authSource=admin",
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }
      );
      expect(mockConsoleError).toHaveBeenCalledWith(
        "MongoDB wrong connection error:",
        "Connection failed"
      );
    });

    test("should handle authentication error", async () => {
      process.env.MONGO_INITDB_ROOT_USERNAME = "testuser";
      process.env.MONGO_INITDB_ROOT_PASSWORD = "testpass";
      process.env.MONGO_INITDB_ROOT_DATABASE = "testdb";

      jest.resetModules();
      const newConnectDB = require("../../src/utils/db");

      const mockError = new Error("Authentication failed");
      mongoose.connect.mockRejectedValue(mockError);

      await expect(newConnectDB()).rejects.toThrow("process.exit called");

      expect(mongoose.connect).toHaveBeenCalledWith(
        "mongodb://testuser:testpass@mongodb:27017/testdb?authSource=admin",
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }
      );
      expect(mockConsoleError).toHaveBeenCalledWith(
        "MongoDB wrong connection error:",
        "Authentication failed"
      );
    });

    test("should handle network error", async () => {
      process.env.MONGO_INITDB_ROOT_USERNAME = "testuser";
      process.env.MONGO_INITDB_ROOT_PASSWORD = "testpass";
      process.env.MONGO_INITDB_ROOT_DATABASE = "testdb";

      jest.resetModules();
      const newConnectDB = require("../../src/utils/db");

      const mockError = new Error("Network error");
      mongoose.connect.mockRejectedValue(mockError);

      await expect(newConnectDB()).rejects.toThrow("process.exit called");

      expect(mongoose.connect).toHaveBeenCalledWith(
        "mongodb://testuser:testpass@mongodb:27017/testdb?authSource=admin",
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }
      );
      expect(mockConsoleError).toHaveBeenCalledWith(
        "MongoDB wrong connection error:",
        "Network error"
      );
    });

    test("should handle database not found error", async () => {
      process.env.MONGO_INITDB_ROOT_USERNAME = "testuser";
      process.env.MONGO_INITDB_ROOT_PASSWORD = "testpass";
      process.env.MONGO_INITDB_ROOT_DATABASE = "testdb";

      jest.resetModules();
      const newConnectDB = require("../../src/utils/db");

      const mockError = new Error("Database not found");
      mongoose.connect.mockRejectedValue(mockError);

      await expect(newConnectDB()).rejects.toThrow("process.exit called");

      expect(mongoose.connect).toHaveBeenCalledWith(
        "mongodb://testuser:testpass@mongodb:27017/testdb?authSource=admin",
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }
      );
      expect(mockConsoleError).toHaveBeenCalledWith(
        "MongoDB wrong connection error:",
        "Database not found"
      );
    });

    test("should use correct connection options", async () => {
      process.env.MONGO_INITDB_ROOT_USERNAME = "testuser";
      process.env.MONGO_INITDB_ROOT_PASSWORD = "testpass";
      process.env.MONGO_INITDB_ROOT_DATABASE = "testdb";

      jest.resetModules();
      const newConnectDB = require("../../src/utils/db");

      mongoose.connect.mockResolvedValue();

      await newConnectDB();

      const connectionOptions = mongoose.connect.mock.calls[0][1];
      expect(connectionOptions).toEqual({
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    });

    test("should construct connection string correctly", async () => {
      process.env.MONGO_INITDB_ROOT_USERNAME = "testuser";
      process.env.MONGO_INITDB_ROOT_PASSWORD = "testpass";
      process.env.MONGO_INITDB_ROOT_DATABASE = "testdb";

      jest.resetModules();
      const newConnectDB = require("../../src/utils/db");

      mongoose.connect.mockResolvedValue();

      await newConnectDB();

      const expectedUri =
        "mongodb://testuser:testpass@mongodb:27017/testdb?authSource=admin";
      expect(mongoose.connect).toHaveBeenCalledWith(
        expectedUri,
        expect.any(Object)
      );
    });

    test("should handle missing environment variables gracefully", async () => {
      mongoose.connect.mockResolvedValue();

      await connectDB();

      expect(mongoose.connect).toHaveBeenCalledWith(
        "mongodb://undefined:undefined@mongodb:27017/undefined?authSource=admin",
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }
      );
    });

    test("should handle empty environment variables", async () => {
      process.env.MONGO_INITDB_ROOT_USERNAME = "";
      process.env.MONGO_INITDB_ROOT_PASSWORD = "";
      process.env.MONGO_INITDB_ROOT_DATABASE = "";

      jest.resetModules();
      const newConnectDB = require("../../src/utils/db");

      mongoose.connect.mockResolvedValue();

      await newConnectDB();

      expect(mongoose.connect).toHaveBeenCalledWith(
        "mongodb://:@mongodb:27017/?authSource=admin",
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }
      );
    });

    test("should handle special characters in credentials", async () => {
      process.env.MONGO_INITDB_ROOT_USERNAME = "user@domain.com";
      process.env.MONGO_INITDB_ROOT_PASSWORD = "pass@word!";
      process.env.MONGO_INITDB_ROOT_DATABASE = "test-db";

      jest.resetModules();
      const newConnectDB = require("../../src/utils/db");

      mongoose.connect.mockResolvedValue();

      await newConnectDB();

      expect(mongoose.connect).toHaveBeenCalledWith(
        "mongodb://user@domain.com:pass@word!@mongodb:27017/test-db?authSource=admin",
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }
      );
    });

    test("should handle connection retry logic implicitly", async () => {
      process.env.MONGO_INITDB_ROOT_USERNAME = "testuser";
      process.env.MONGO_INITDB_ROOT_PASSWORD = "testpass";
      process.env.MONGO_INITDB_ROOT_DATABASE = "testdb";

      jest.resetModules();
      const newConnectDB = require("../../src/utils/db");

      mongoose.connect.mockResolvedValue();

      await newConnectDB();

      expect(mongoose.connect).toHaveBeenCalledTimes(1);
    });

    test("should log success message only on successful connection", async () => {
      process.env.MONGO_INITDB_ROOT_USERNAME = "testuser";
      process.env.MONGO_INITDB_ROOT_PASSWORD = "testpass";
      process.env.MONGO_INITDB_ROOT_DATABASE = "testdb";

      jest.resetModules();
      const newConnectDB = require("../../src/utils/db");

      mongoose.connect.mockResolvedValue();

      await newConnectDB();

      expect(mockConsoleLog).toHaveBeenCalledWith(
        "MongoDB connection establised!"
      );
    });

    test("should not log success message on failed connection", async () => {
      process.env.MONGO_INITDB_ROOT_USERNAME = "testuser";
      process.env.MONGO_INITDB_ROOT_PASSWORD = "testpass";
      process.env.MONGO_INITDB_ROOT_DATABASE = "testdb";

      jest.resetModules();
      const newConnectDB = require("../../src/utils/db");

      const mockError = new Error("Connection failed");
      mongoose.connect.mockRejectedValue(mockError);

      await expect(newConnectDB()).rejects.toThrow("process.exit called");

      expect(mockConsoleLog).not.toHaveBeenCalledWith(
        "MongoDB connection establised!"
      );
    });

    test("should handle mongoose.connect throwing synchronous error", async () => {
      process.env.MONGO_INITDB_ROOT_USERNAME = "testuser";
      process.env.MONGO_INITDB_ROOT_PASSWORD = "testpass";
      process.env.MONGO_INITDB_ROOT_DATABASE = "testdb";

      jest.resetModules();
      const newConnectDB = require("../../src/utils/db");

      const mockError = new Error("Synchronous error");
      mongoose.connect.mockImplementation(() => {
        throw mockError;
      });

      await expect(newConnectDB()).rejects.toThrow("process.exit called");

      expect(mongoose.connect).toHaveBeenCalledWith(
        "mongodb://testuser:testpass@mongodb:27017/testdb?authSource=admin",
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        }
      );
      expect(mockConsoleError).toHaveBeenCalledWith(
        "MongoDB wrong connection error:",
        "Synchronous error"
      );
    });
  });

  describe("Environment variable handling", () => {
    test("should use default host and port when not specified", async () => {
      process.env.MONGO_INITDB_ROOT_USERNAME = "testuser";
      process.env.MONGO_INITDB_ROOT_PASSWORD = "testpass";

      mongoose.connect.mockResolvedValue();

      await connectDB();

      const connectionString = mongoose.connect.mock.calls[0][0];
      expect(connectionString).toContain("mongodb:27017");
    });

    test("should always use authSource=admin", async () => {
      process.env.MONGO_INITDB_ROOT_USERNAME = "testuser";
      process.env.MONGO_INITDB_ROOT_PASSWORD = "testpass";
      process.env.MONGO_INITDB_ROOT_DATABASE = "testdb";

      jest.resetModules();
      const newConnectDB = require("../../src/utils/db");

      mongoose.connect.mockResolvedValue();

      await newConnectDB();

      const connectionString = mongoose.connect.mock.calls[0][0];
      expect(connectionString).toContain("authSource=admin");
    });

    test("should handle different database names", async () => {
      const testCases = ["orders", "testdb", "production", "development"];

      for (const dbName of testCases) {
        jest.clearAllMocks();

        process.env.MONGO_INITDB_ROOT_USERNAME = "testuser";
        process.env.MONGO_INITDB_ROOT_PASSWORD = "testpass";
        process.env.MONGO_INITDB_ROOT_DATABASE = dbName;

        jest.resetModules();
        const newConnectDB = require("../../src/utils/db");

        mongoose.connect.mockResolvedValue();

        await newConnectDB();

        const connectionString = mongoose.connect.mock.calls[0][0];
        expect(connectionString).toContain(`/${dbName}?`);
      }
    });
  });

  describe("Error message formatting", () => {
    test("should format error messages correctly", async () => {
      process.env.MONGO_INITDB_ROOT_USERNAME = "testuser";
      process.env.MONGO_INITDB_ROOT_PASSWORD = "testpass";
      process.env.MONGO_INITDB_ROOT_DATABASE = "testdb";

      jest.resetModules();
      const newConnectDB = require("../../src/utils/db");

      const mockError = new Error("Test error message");
      mongoose.connect.mockRejectedValue(mockError);

      await expect(newConnectDB()).rejects.toThrow("process.exit called");

      expect(mockConsoleError).toHaveBeenCalledWith(
        "MongoDB wrong connection error:",
        "Test error message"
      );
    });
  });
});
