const { DataTypes } = require("sequelize");

jest.mock("../../src/utils/db", () => {
  const sequelizeMock = {
    define: jest.fn(),
    NOW: Symbol("NOW"),
  };
  const ProductModelMock = { name: "ProductModel" };
  sequelizeMock.define.mockReturnValue(ProductModelMock);
  return sequelizeMock;
});

describe("Product Sequelize Model", () => {
  let Product;
  let sequelizeMock;

  beforeEach(() => {
    jest.clearAllMocks();
    Product = require("../../src/models/product");
    sequelizeMock = require("../../src/utils/db");
  });

  it("should define the Product model with correct attributes and options", () => {
    expect(sequelizeMock.define).toHaveBeenCalledTimes(1);

    const [modelName, attributes, options] = sequelizeMock.define.mock.calls[0];

    expect(modelName).toBe("Product");

    expect(attributes).toHaveProperty("id");
    expect(attributes.id.type).toBe(DataTypes.UUID);
    expect(attributes.id.primaryKey).toBe(true);
    expect(attributes.id.defaultValue).toBe(DataTypes.UUIDV4);

    expect(attributes).toHaveProperty("sku");
    expect(attributes.sku.type).toStrictEqual(DataTypes.STRING(50));
    expect(attributes.sku.unique).toBe(true);
    expect(attributes.sku.allowNull).toBe(false);

    expect(attributes).toHaveProperty("name");
    expect(attributes.name.type).toStrictEqual(DataTypes.STRING(255));
    expect(attributes.name.allowNull).toBe(false);

    expect(attributes).toHaveProperty("price");
    expect(attributes.price.type).toStrictEqual(DataTypes.DECIMAL(10, 2));
    expect(attributes.price.allowNull).toBe(false);
    expect(attributes.price.validate).toEqual({ min: 0.01 });

    expect(attributes).toHaveProperty("created_at");
    expect(attributes.created_at.type).toBe(DataTypes.DATE);
    expect(attributes.created_at.defaultValue).toBe(sequelizeMock.NOW);

    expect(attributes).toHaveProperty("updated_at");
    expect(attributes.updated_at.type).toBe(DataTypes.DATE);
    expect(attributes.updated_at.defaultValue).toBe(sequelizeMock.NOW);

    expect(options).toEqual({
      tableName: "product",
      timestamps: false,
    });
  });

  it("should export the Product model", () => {
    expect(Product).toBeDefined();
    expect(Product.name).toBe("ProductModel");
  });
});
