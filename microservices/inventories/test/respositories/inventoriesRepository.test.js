jest.mock("../../src/models/product", () => {
  return {
    findOne: jest.fn(),
    findAll: jest.fn(),
  };
});

jest.mock("../../src/models/inventory", () => ({
  increment: jest.fn(),
}));

const Product = require("../../src/models/product");
const Inventory = require("../../src/models/inventory");

const {
  getInventoryProductBySku,
  getAllProducts,
  increseReservedQuantityByProductId,
} = require("../../src/repositories/inventoriesRepository");

describe("inventoriesRepository", () => {
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
      expect(Product.findOne).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockProduct);
    });

    it("should return null if product not found", async () => {
      Product.findOne.mockResolvedValue(null);

      const result = await getInventoryProductBySku("UNKNOWN");

      expect(Product.findOne).toHaveBeenCalledWith({
        where: { sku: "UNKNOWN" },
        include: [{ model: Inventory }],
      });
      expect(Product.findOne).toHaveBeenCalledTimes(1);
      expect(result).toBeNull();
    });

    it("should handle undefined sku parameter", async () => {
      Product.findOne.mockResolvedValue(null);

      const result = await getInventoryProductBySku(undefined);

      expect(Product.findOne).toHaveBeenCalledWith({
        where: { sku: undefined },
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
      expect(Product.findAll).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockProducts);
    });

    it("should return empty array if no products found", async () => {
      Product.findAll.mockResolvedValue([]);

      const result = await getAllProducts();

      expect(Product.findAll).toHaveBeenCalledWith({
        include: [{ model: Inventory }],
      });
      expect(Product.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it("should return null if no products found", async () => {
      Product.findAll.mockResolvedValue(null);

      const result = await getAllProducts();

      expect(Product.findAll).toHaveBeenCalledWith({
        include: [{ model: Inventory }],
      });
      expect(Product.findAll).toHaveBeenCalledTimes(1);
      expect(result).toBeNull();
    });
  });

  describe("increseReservedQuantityByProductId", () => {
    it("should increment reserved quantity for a product", async () => {
      const mockResult = { reserved_quantity: 15 };
      Inventory.increment.mockResolvedValue(mockResult);

      const productId = "prod-123";
      const quantityToReserve = 5;

      const result = await increseReservedQuantityByProductId(
        productId,
        quantityToReserve
      );

      expect(Inventory.increment).toHaveBeenCalledWith(
        { reserved_quantity: quantityToReserve },
        { where: { product_id: productId } }
      );
      expect(Inventory.increment).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockResult);
    });

    it("should handle zero quantity increment", async () => {
      const mockResult = { reserved_quantity: 10 };
      Inventory.increment.mockResolvedValue(mockResult);

      const productId = "prod-123";
      const quantityToReserve = 0;

      const result = await increseReservedQuantityByProductId(
        productId,
        quantityToReserve
      );

      expect(Inventory.increment).toHaveBeenCalledWith(
        { reserved_quantity: quantityToReserve },
        { where: { product_id: productId } }
      );
      expect(result).toBe(mockResult);
    });

    it("should handle large quantity increment", async () => {
      const mockResult = { reserved_quantity: 1000 };
      Inventory.increment.mockResolvedValue(mockResult);

      const productId = "prod-123";
      const quantityToReserve = 1000;

      const result = await increseReservedQuantityByProductId(
        productId,
        quantityToReserve
      );

      expect(Inventory.increment).toHaveBeenCalledWith(
        { reserved_quantity: quantityToReserve },
        { where: { product_id: productId } }
      );
      expect(result).toBe(mockResult);
    });

    it("should handle undefined productId", async () => {
      const mockResult = { reserved_quantity: 5 };
      Inventory.increment.mockResolvedValue(mockResult);

      const productId = undefined;
      const quantityToReserve = 5;

      const result = await increseReservedQuantityByProductId(
        productId,
        quantityToReserve
      );

      expect(Inventory.increment).toHaveBeenCalledWith(
        { reserved_quantity: quantityToReserve },
        { where: { product_id: productId } }
      );
      expect(result).toBe(mockResult);
    });

    it("should handle database errors", async () => {
      const error = new Error("Database connection failed");
      Inventory.increment.mockRejectedValue(error);

      const productId = "prod-123";
      const quantityToReserve = 5;

      await expect(
        increseReservedQuantityByProductId(productId, quantityToReserve)
      ).rejects.toThrow("Database connection failed");

      expect(Inventory.increment).toHaveBeenCalledWith(
        { reserved_quantity: quantityToReserve },
        { where: { product_id: productId } }
      );
    });
  });
});
