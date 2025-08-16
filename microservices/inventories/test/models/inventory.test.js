const { DataTypes } = require("sequelize");

jest.mock("../../src/utils/db", () => {
  const sequelizeMock = {
    define: jest.fn(),
    NOW: Symbol("NOW"),
  };
  const InventoryModelMock = { name: "InventoryModel", belongsTo: jest.fn() };
  sequelizeMock.define.mockReturnValue(InventoryModelMock);
  return sequelizeMock;
});

jest.mock("../../src/models/product", () => {
  return {
    hasOne: jest.fn(),
  };
});

describe("Inventory Sequelize Model", () => {
  let Inventory;
  let sequelizeMock;
  let ProductMock;
  let InventoryModelMock;

  beforeAll(() => {
    Inventory = require("../../src/models/inventory");
    sequelizeMock = require("../../src/utils/db");
    ProductMock = require("../../src/models/product");
    InventoryModelMock = sequelizeMock.define.mock.results[0].value;
  });

  it("should define Inventory model with correct schema and options", () => {
    expect(sequelizeMock.define).toHaveBeenCalledTimes(1);

    const [modelName, attributes, options] = sequelizeMock.define.mock.calls[0];

    expect(modelName).toBe("Inventory");

    expect(attributes).toHaveProperty("id");
    expect(attributes.id.type).toBe(DataTypes.UUID);
    expect(attributes.id.primaryKey).toBe(true);
    expect(attributes.id.defaultValue).toBe(DataTypes.UUIDV4);

    expect(attributes).toHaveProperty("product_id");
    expect(attributes.product_id.type).toBe(DataTypes.UUID);
    expect(attributes.product_id.allowNull).toBe(false);
    expect(attributes.product_id.references).toEqual({
      model: "product",
      key: "id",
    });

    expect(attributes).toHaveProperty("available_quantity");
    expect(attributes.available_quantity.type).toBe(DataTypes.INTEGER);
    expect(attributes.available_quantity.allowNull).toBe(false);
    expect(attributes.available_quantity.validate).toEqual({ min: 0 });

    expect(attributes).toHaveProperty("reserved_quantity");
    expect(attributes.reserved_quantity.defaultValue).toBe(0);
    expect(attributes.reserved_quantity.validate).toEqual({ min: 0 });

    expect(attributes).toHaveProperty("last_updated");
    expect(attributes.last_updated.type).toBe(DataTypes.DATE);
    expect(attributes.last_updated.defaultValue).toBe(sequelizeMock.NOW);

    expect(options).toEqual({
      tableName: "inventory",
      timestamps: false,
    });
  });

  it("should setup associations with Product model", () => {
    expect(ProductMock.hasOne).toHaveBeenCalledTimes(1);
    expect(ProductMock.hasOne).toHaveBeenCalledWith(InventoryModelMock, {
      foreignKey: "product_id",
    });
    expect(typeof Inventory.belongsTo).toBe("function");
  });

  it("should export the Inventory model", () => {
    expect(Inventory).toBe(InventoryModelMock);
  });
});
