jest.mock("../../src/repositories/inventoriesRepository", () => ({
  getInventoryProductBySku: jest.fn(),
  getAllProducts: jest.fn(),
}));

const {
  getInventoryProductBySku,
  getAllProducts,
} = require("../../src/repositories/inventoriesRepository");

const {
  getInventoryProductBySkuService,
  getAllInventoryProductsService,
} = require("../../src/services/inventoriesService");

describe("inventoriesService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getInventoryProductBySkuService", () => {
    it("should return product data if found", async () => {
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
      getInventoryProductBySku.mockResolvedValue(mockProduct);

      const result = await getInventoryProductBySkuService("sku");

      expect(getInventoryProductBySku).toHaveBeenCalledWith("sku");
      expect(result).toBe(mockProduct);
    });

    it("should return null if product not found", async () => {
      getInventoryProductBySku.mockResolvedValue(null);

      const result = await getInventoryProductBySkuService("UNKNOWN");

      expect(getInventoryProductBySku).toHaveBeenCalledWith("UNKNOWN");
      expect(result).toBeNull();
    });
  });

  describe("getAllInventoryProductsService", () => {
    it("should return all product data if any found", async () => {
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
      getAllProducts.mockResolvedValue(mockProducts);

      const result = await getAllInventoryProductsService();

      expect(getAllProducts).toHaveBeenCalled();
      expect(result).toBe(mockProducts);
    });

    it("should return null if no product data found", async () => {
      getAllProducts.mockResolvedValue(null);

      const result = await getAllInventoryProductsService();

      expect(getAllProducts).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });
});
