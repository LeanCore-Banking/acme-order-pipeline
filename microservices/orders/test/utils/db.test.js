const mongoose = require("mongoose");

jest.mock("mongoose", () => ({
  connect: jest.fn(),
}));

describe("connectDB", () => {
  let connectDB;
  let originalEnv;
  let logSpy;
  let errorSpy;
  let exitSpy;

  beforeAll(() => {
    originalEnv = { ...process.env };
  });

  beforeEach(() => {
    process.env.MONGO_INITDB_ROOT_USERNAME = "user";
    process.env.MONGO_INITDB_ROOT_PASSWORD = "pass";
    process.env.MONGO_INITDB_DATABASE = "testdb";

    jest.clearAllMocks();
    logSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    exitSpy = jest.spyOn(process, "exit").mockImplementation(() => {});

    connectDB = require("../../src/utils/db");
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test("MongoDB connection establised", async () => {
    mongoose.connect.mockResolvedValueOnce({});
    await connectDB();
    expect(mongoose.connect).toHaveBeenCalledWith(
      "mongodb://user:pass@mongodb:27017/testdb?authSource=admin",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    expect(logSpy).toHaveBeenCalledWith("MongoDB connection establised!");
    expect(exitSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
  });

  test("fallo en la conexión a MongoDB", async () => {
    mongoose.connect.mockRejectedValueOnce(new Error("Connection error"));
    await connectDB();
    expect(errorSpy).toHaveBeenCalledWith(
      "MongoDB wrong connection error:",
      "Connection error"
    );
    expect(exitSpy).toHaveBeenCalledWith(1);
    expect(logSpy).not.toHaveBeenCalled();
  });
});
