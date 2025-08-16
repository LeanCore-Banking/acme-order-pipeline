jest.mock("sequelize", () => {
  const SequelizeMock = jest.fn().mockImplementation(() => ({
    authenticate: jest.fn(),
    sync: jest.fn(),
  }));
  return { Sequelize: SequelizeMock };
});

describe("Sequelize instance", () => {
  let Sequelize;
  let originalEnv;
  let sequelizeInstance;

  beforeAll(() => {
    originalEnv = { ...process.env };

    process.env.PG_DATABASE = "test_db";
    process.env.PG_USER = "test_user";
    process.env.PG_PASSWORD = "test_password";
    process.env.PG_HOST = "test_host";

    Sequelize = require("sequelize").Sequelize;
    sequelizeInstance = require("../../src/utils/db");
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should create Sequelize instance with correct config", () => {
    expect(Sequelize).toHaveBeenCalledWith(
      "test_db",
      "test_user",
      "test_password",
      expect.objectContaining({
        host: "test_host",
        dialect: "postgres",
        logging: false,
      })
    );
  });

  it("should export the Sequelize instance", () => {
    expect(sequelizeInstance).toBeDefined();
    expect(typeof sequelizeInstance).toBe("object");
  });
});
