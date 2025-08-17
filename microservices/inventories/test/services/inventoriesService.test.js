jest.mock("../../src/repositories/inventoriesRepository", () => ({
  getInventoryProductBySku: jest.fn(),
  getAllProducts: jest.fn(),
  increseReservedQuantityByProductId: jest.fn(),
}));

jest.mock("../../src/kafka/producerEventOrderConfirmed", () => ({
  produceEventOrderConfirmed: jest.fn(),
}));

jest.mock("../../src/kafka/producerEventOrderFailed", () => ({
  produceEventOrderFailed: jest.fn(),
}));

const {
  getInventoryProductBySku,
  getAllProducts,
  increseReservedQuantityByProductId,
} = require("../../src/repositories/inventoriesRepository");

const {
  produceEventOrderConfirmed,
} = require("../../src/kafka/producerEventOrderConfirmed");
const {
  produceEventOrderFailed,
} = require("../../src/kafka/producerEventOrderFailed");

const inventoriesService = require("../../src/services/inventoriesService");

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

      const result = await inventoriesService.getInventoryProductBySkuService(
        "sku"
      );

      expect(getInventoryProductBySku).toHaveBeenCalledWith("sku");
      expect(getInventoryProductBySku).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockProduct);
    });

    it("should return null if product not found", async () => {
      getInventoryProductBySku.mockResolvedValue(null);

      const result = await inventoriesService.getInventoryProductBySkuService(
        "UNKNOWN"
      );

      expect(getInventoryProductBySku).toHaveBeenCalledWith("UNKNOWN");
      expect(getInventoryProductBySku).toHaveBeenCalledTimes(1);
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

      const result = await inventoriesService.getAllInventoryProductsService();

      expect(getAllProducts).toHaveBeenCalled();
      expect(getAllProducts).toHaveBeenCalledTimes(1);
      expect(result).toBe(mockProducts);
    });

    it("should return null if no product data found", async () => {
      getAllProducts.mockResolvedValue(null);

      const result = await inventoriesService.getAllInventoryProductsService();

      expect(getAllProducts).toHaveBeenCalled();
      expect(getAllProducts).toHaveBeenCalledTimes(1);
      expect(result).toBeNull();
    });
  });

  describe("validateItemsStock", () => {
    it("should return no error when all items have sufficient stock", async () => {
      const mockProduct = {
        Inventory: {
          available_quantity: 20,
          reserved_quantity: 5,
        },
      };
      getInventoryProductBySku.mockResolvedValue(mockProduct);

      const items = [
        { sku: "LAPTOP001", quantity: 10 },
        { sku: "MOUSE001", quantity: 5 },
      ];

      const result = await inventoriesService.validateItemsStock(items);

      expect(getInventoryProductBySku).toHaveBeenCalledTimes(2);
      expect(result.error_message).toBe("");
      expect(result.failure_reason).toBe(0);
    });

    it("should return error when product not found", async () => {
      getInventoryProductBySku.mockResolvedValue(null);

      const items = [{ sku: "UNKNOWN", quantity: 1 }];

      const result = await inventoriesService.validateItemsStock(items);

      expect(getInventoryProductBySku).toHaveBeenCalledWith("UNKNOWN");
      expect(produceEventOrderFailed).toHaveBeenCalled();
      expect(result.error_message).toBe(
        "Product with SKU UNKNOWN not found in inventory"
      );
      expect(result.failure_reason).toBe(0); // INVALID_PRODUCT
    });

    it("should return error when product has no inventory", async () => {
      getInventoryProductBySku.mockResolvedValue({ Inventory: null });

      const items = [{ sku: "LAPTOP001", quantity: 1 }];

      const result = await inventoriesService.validateItemsStock(items);

      expect(produceEventOrderFailed).toHaveBeenCalled();
      expect(result.error_message).toBe(
        "Product with SKU LAPTOP001 not found in inventory"
      );
      expect(result.failure_reason).toBe(0); // INVALID_PRODUCT
    });

    it("should return error when available quantity is null", async () => {
      getInventoryProductBySku.mockResolvedValue({
        Inventory: { available_quantity: null, reserved_quantity: 0 },
      });

      const items = [{ sku: "LAPTOP001", quantity: 1 }];

      const result = await inventoriesService.validateItemsStock(items);

      expect(produceEventOrderFailed).toHaveBeenCalled();
      expect(result.error_message).toBe(
        "Product with SKU LAPTOP001 not found in inventory"
      );
      expect(result.failure_reason).toBe(0); // INVALID_PRODUCT
    });

    it("should return error when insufficient stock", async () => {
      const mockProduct = {
        Inventory: {
          available_quantity: 10,
          reserved_quantity: 5,
        },
      };
      getInventoryProductBySku.mockResolvedValue(mockProduct);

      const items = [{ sku: "LAPTOP001", quantity: 10 }];

      const result = await inventoriesService.validateItemsStock(items);

      expect(getInventoryProductBySku).toHaveBeenCalledWith("LAPTOP001");
      expect(result.error_message).toBe(
        "Insufficient stock for SKU LAPTOP001: requested 10, available 10"
      );
      expect(result.failure_reason).toBe(1); // INSUFFICIENT_INVENTORY
    });

    it("should handle multiple items with mixed validation results", async () => {
      getInventoryProductBySku
        .mockResolvedValueOnce({
          Inventory: { available_quantity: 20, reserved_quantity: 5 },
        })
        .mockResolvedValueOnce(null);

      const items = [
        { sku: "LAPTOP001", quantity: 10 },
        { sku: "UNKNOWN", quantity: 5 },
      ];

      const result = await inventoriesService.validateItemsStock(items);

      expect(getInventoryProductBySku).toHaveBeenCalledTimes(2);
      expect(produceEventOrderFailed).toHaveBeenCalled();
      expect(result.error_message).toBe(
        "Product with SKU UNKNOWN not found in inventory"
      );
      expect(result.failure_reason).toBe(0); // INVALID_PRODUCT
    });
  });

  describe("processEventOrderCreated", () => {
    it("should process order successfully when validation passes", async () => {
      const mockProduct = {
        Inventory: {
          available_quantity: 20,
          reserved_quantity: 5,
        },
      };
      getInventoryProductBySku.mockResolvedValue(mockProduct);
      increseReservedQuantityByProductId.mockResolvedValue({});

      const orderData = {
        order_id: "order-123",
        items: [
          { product_id: "prod-1", sku: "LAPTOP001", quantity: 10 },
          { product_id: "prod-2", sku: "MOUSE001", quantity: 5 },
        ],
      };

      await inventoriesService.processEventOrderCreated(orderData);

      expect(getInventoryProductBySku).toHaveBeenCalledTimes(2);
      expect(increseReservedQuantityByProductId).toHaveBeenCalledTimes(2);
      expect(increseReservedQuantityByProductId).toHaveBeenCalledWith(
        "prod-1",
        10
      );
      expect(increseReservedQuantityByProductId).toHaveBeenCalledWith(
        "prod-2",
        5
      );
      expect(produceEventOrderConfirmed).toHaveBeenCalledWith(orderData);
      expect(produceEventOrderFailed).not.toHaveBeenCalled();
    });

    it("should produce failed event when validation fails", async () => {
      getInventoryProductBySku.mockResolvedValue(null);

      const orderData = {
        order_id: "order-123",
        items: [{ product_id: "prod-1", sku: "UNKNOWN", quantity: 1 }],
      };

      await inventoriesService.processEventOrderCreated(orderData);

      expect(getInventoryProductBySku).toHaveBeenCalledWith("UNKNOWN");
      expect(produceEventOrderFailed).toHaveBeenCalledWith(
        orderData,
        0,
        "Product with SKU UNKNOWN not found in inventory"
      );
      expect(produceEventOrderConfirmed).not.toHaveBeenCalled();
      expect(increseReservedQuantityByProductId).not.toHaveBeenCalled();
    });

    it("should handle empty items array", async () => {
      const orderData = {
        order_id: "order-123",
        items: [],
      };

      await inventoriesService.processEventOrderCreated(orderData);

      expect(getInventoryProductBySku).not.toHaveBeenCalled();
      expect(increseReservedQuantityByProductId).not.toHaveBeenCalled();
      expect(produceEventOrderConfirmed).toHaveBeenCalledWith(orderData);
    });
  });
});
