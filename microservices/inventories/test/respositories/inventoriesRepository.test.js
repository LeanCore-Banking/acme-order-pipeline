jest.mock("../../src/models/product", () => {
  return {
    findOne: jest.fn(),
    findAll: jest.fn(),
  };
});

jest.mock("../../src/models/inventory", () => ({}));

const Product = require("../../src/models/product");
const Inventory = require("../../src/models/inventory");

const {
  getInventoryProductBySku,
  getAllProducts,
} = require("../../src/repositories/inventoriesRepository");

describe("productsRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getInventoryProductBySku", () => {
    it("should return product with inventory when found", async () => {
      const mockProduct = {
        id: "id",
        sku: "sku",
        name: "name",
        price: "price",
        created_at: "created_at",
        updated_at: "updated_at",
        Inventory: {
          id: "id",
          product_id: "product_id",
          available_quantity: 10,
          reserved_quantity: 10,
          last_updated: "last_updated",
        },
      };
      Product.findOne.mockResolvedValue(mockProduct);

      const result = await getInventoryProductBySku("sku");

      expect(Product.findOne).toHaveBeenCalledWith({
        where: { sku: "sku" },
        include: [{ model: Inventory }],
      });
      expect(result).toBe(mockProduct);
    });

    it("should return null if product not found", async () => {
      Product.findOne.mockResolvedValue(null);

      const result = await getInventoryProductBySku("UNKNOWN");

      expect(Product.findOne).toHaveBeenCalledWith({
        where: { sku: "UNKNOWN" },
        include: [{ model: Inventory }],
      });
      expect(result).toBeNull();
    });
  });

  describe("getAllProducts", () => {
    it("should return list of products with inventory", async () => {
      const mockProducts = [
        {
          id: "id1",
          sku: "sku",
          name: "name",
          price: "price",
          created_at: "created_at",
          updated_at: "updated_at",
          Inventory: {
            id: "id1",
            product_id: "product_id1",
            available_quantity: 10,
            reserved_quantity: 10,
            last_updated: "last_updated",
          },
        },
        {
          id: "id2",
          sku: "sku",
          name: "name",
          price: "price",
          created_at: "created_at",
          updated_at: "updated_at",
          Inventory: {
            id: "id2",
            product_id: "product_id2",
            available_quantity: 10,
            reserved_quantity: 10,
            last_updated: "last_updated",
          },
        },
      ];
      Product.findAll.mockResolvedValue(mockProducts);

      const result = await getAllProducts();

      expect(Product.findAll).toHaveBeenCalledWith({
        include: [{ model: Inventory }],
      });
      expect(result).toBe(mockProducts);
    });

    it("should return empty array if no products found", async () => {
      Product.findAll.mockResolvedValue([]);

      const result = await getAllProducts();

      expect(Product.findAll).toHaveBeenCalledWith({
        include: [{ model: Inventory }],
      });
      expect(result).toEqual([]);
    });
  });
});
