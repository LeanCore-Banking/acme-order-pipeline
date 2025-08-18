const {
  getInventoryProductBySkuService,
  getAllInventoryProductsService,
  processEventOrderCreated,
} = require("../../src/services/inventoriesService");

jest.mock("../../src/kafka/producerEventOrderConfirmed");
jest.mock("../../src/kafka/producerEventOrderFailed");
jest.mock("../../src/kafka/order_events_pb");

jest.mock("../../src/repositories/inventoriesRepository");

const {
  produceEventOrderConfirmed,
} = require("../../src/kafka/producerEventOrderConfirmed");
const {
  produceEventOrderFailed,
} = require("../../src/kafka/producerEventOrderFailed");
const {
  getInventoryProductBySku,
  getAllProducts,
  increseReservedQuantityByProductId,
} = require("../../src/repositories/inventoriesRepository");
const { FailureReason } = require("../../src/kafka/order_events_pb");

describe("Inventories Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    FailureReason.INVALID_PRODUCT = 1;
    FailureReason.INSUFFICIENT_INVENTORY = 2;
  });

  describe("getInventoryProductBySkuService", () => {
    test("should return product data when product exists", async () => {
      const sku = "SKU123";
      const mockProduct = {
        id: 1,
        sku: "SKU123",
        name: "Test Product",
        Inventory: {
          available_quantity: 100,
          reserved_quantity: 10,
        },
      };

      getInventoryProductBySku.mockResolvedValue(mockProduct);

      const result = await getInventoryProductBySkuService(sku);

      expect(getInventoryProductBySku).toHaveBeenCalledWith(sku);
      expect(result).toEqual(mockProduct);
    });

    test("should return null when product does not exist", async () => {
      const sku = "NONEXISTENT";
      getInventoryProductBySku.mockResolvedValue(null);

      const result = await getInventoryProductBySkuService(sku);

      expect(getInventoryProductBySku).toHaveBeenCalledWith(sku);
      expect(result).toBeNull();
    });

    test("should return null when product is undefined", async () => {
      const sku = "UNDEFINED";
      getInventoryProductBySku.mockResolvedValue(undefined);

      const result = await getInventoryProductBySkuService(sku);

      expect(getInventoryProductBySku).toHaveBeenCalledWith(sku);
      expect(result).toBeNull();
    });

    test("should handle repository errors", async () => {
      const sku = "ERROR";
      const error = new Error("Database connection failed");
      getInventoryProductBySku.mockRejectedValue(error);

      await expect(getInventoryProductBySkuService(sku)).rejects.toThrow(
        "Database connection failed"
      );
      expect(getInventoryProductBySku).toHaveBeenCalledWith(sku);
    });
  });

  describe("getAllInventoryProductsService", () => {
    test("should return all products when they exist", async () => {
      const mockProducts = [
        {
          id: 1,
          sku: "SKU123",
          name: "Product 1",
          Inventory: {
            available_quantity: 100,
            reserved_quantity: 10,
          },
        },
        {
          id: 2,
          sku: "SKU456",
          name: "Product 2",
          Inventory: {
            available_quantity: 50,
            reserved_quantity: 5,
          },
        },
      ];

      getAllProducts.mockResolvedValue(mockProducts);

      const result = await getAllInventoryProductsService();

      expect(getAllProducts).toHaveBeenCalledWith();
      expect(result).toEqual(mockProducts);
    });

    test("should return null when no products exist", async () => {
      getAllProducts.mockResolvedValue(null);

      const result = await getAllInventoryProductsService();

      expect(getAllProducts).toHaveBeenCalledWith();
      expect(result).toBeNull();
    });

    test("should return null when products is undefined", async () => {
      getAllProducts.mockResolvedValue(undefined);

      const result = await getAllInventoryProductsService();

      expect(getAllProducts).toHaveBeenCalledWith();
      expect(result).toBeNull();
    });

    test("should handle repository errors", async () => {
      const error = new Error("Database connection failed");
      getAllProducts.mockRejectedValue(error);

      await expect(getAllInventoryProductsService()).rejects.toThrow(
        "Database connection failed"
      );
      expect(getAllProducts).toHaveBeenCalledWith();
    });
  });

  describe("processEventOrderCreated", () => {
    test("should process order successfully when all validations pass", async () => {
      const orderData = {
        order_id: "ORD-123",
        items: [
          { sku: "SKU123", product_id: 1, quantity: 5 },
          { sku: "SKU456", product_id: 2, quantity: 3 },
        ],
      };

      const mockProduct1 = {
        id: 1,
        sku: "SKU123",
        Inventory: {
          available_quantity: 100,
          reserved_quantity: 10,
        },
      };

      const mockProduct2 = {
        id: 2,
        sku: "SKU456",
        Inventory: {
          available_quantity: 50,
          reserved_quantity: 5,
        },
      };

      getInventoryProductBySku
        .mockResolvedValueOnce(mockProduct1)
        .mockResolvedValueOnce(mockProduct2);
      increseReservedQuantityByProductId.mockResolvedValue();
      produceEventOrderConfirmed.mockResolvedValue();

      await processEventOrderCreated(orderData);

      expect(getInventoryProductBySku).toHaveBeenCalledTimes(2);
      expect(increseReservedQuantityByProductId).toHaveBeenCalledTimes(2);
      expect(increseReservedQuantityByProductId).toHaveBeenNthCalledWith(
        1,
        1,
        5
      );
      expect(increseReservedQuantityByProductId).toHaveBeenNthCalledWith(
        2,
        2,
        3
      );
      expect(produceEventOrderConfirmed).toHaveBeenCalledWith(orderData);
      expect(produceEventOrderFailed).not.toHaveBeenCalled();
    });

    test("should produce failed event when product is not found", async () => {
      const orderData = {
        order_id: "ORD-123",
        items: [{ sku: "INVALID", product_id: 1, quantity: 5 }],
      };

      getInventoryProductBySku.mockResolvedValue(null);
      produceEventOrderFailed.mockResolvedValue();

      await expect(processEventOrderCreated(orderData)).rejects.toThrow();

      expect(getInventoryProductBySku).toHaveBeenCalledWith("INVALID");
      expect(produceEventOrderFailed).toHaveBeenCalledWith();
      expect(increseReservedQuantityByProductId).not.toHaveBeenCalled();
      expect(produceEventOrderConfirmed).not.toHaveBeenCalled();
    });

    test("should produce failed event when product has no Inventory", async () => {
      const orderData = {
        order_id: "ORD-123",
        items: [{ sku: "NOINVENTORY", product_id: 1, quantity: 5 }],
      };

      const mockProduct = {
        id: 1,
        sku: "NOINVENTORY",
        name: "Product without inventory",
      };

      getInventoryProductBySku.mockResolvedValue(mockProduct);
      produceEventOrderFailed.mockResolvedValue();

      await expect(processEventOrderCreated(orderData)).rejects.toThrow();

      expect(getInventoryProductBySku).toHaveBeenCalledWith("NOINVENTORY");
      expect(produceEventOrderFailed).toHaveBeenCalledWith();
      expect(increseReservedQuantityByProductId).not.toHaveBeenCalled();
      expect(produceEventOrderConfirmed).not.toHaveBeenCalled();
    });

    test("should produce failed event when product has no available_quantity", async () => {
      const orderData = {
        order_id: "ORD-123",
        items: [{ sku: "NOQUANTITY", product_id: 1, quantity: 5 }],
      };

      const mockProduct = {
        id: 1,
        sku: "NOQUANTITY",
        name: "Product without quantity",
        Inventory: {
          reserved_quantity: 10,
        },
      };

      getInventoryProductBySku.mockResolvedValue(mockProduct);
      produceEventOrderFailed.mockResolvedValue();

      await processEventOrderCreated(orderData);

      expect(getInventoryProductBySku).toHaveBeenCalledWith("NOQUANTITY");
      expect(produceEventOrderFailed).toHaveBeenCalledWith(
        orderData,
        FailureReason.INVALID_PRODUCT,
        "Product with SKU NOQUANTITY not found in inventory"
      );
      expect(increseReservedQuantityByProductId).not.toHaveBeenCalled();
      expect(produceEventOrderConfirmed).not.toHaveBeenCalled();
    });

    test("should produce failed event when insufficient stock", async () => {
      const orderData = {
        order_id: "ORD-123",
        items: [{ sku: "LOWSTOCK", product_id: 1, quantity: 20 }],
      };

      const mockProduct = {
        id: 1,
        sku: "LOWSTOCK",
        name: "Low stock product",
        Inventory: {
          available_quantity: 10,
          reserved_quantity: 5,
        },
      };

      getInventoryProductBySku.mockResolvedValue(mockProduct);
      produceEventOrderFailed.mockResolvedValue();

      await processEventOrderCreated(orderData);

      expect(getInventoryProductBySku).toHaveBeenCalledWith("LOWSTOCK");
      expect(produceEventOrderFailed).toHaveBeenCalledWith(
        orderData,
        FailureReason.INSUFFICIENT_INVENTORY,
        "Insufficient stock for SKU LOWSTOCK: requested 20, available 10"
      );
      expect(increseReservedQuantityByProductId).not.toHaveBeenCalled();
      expect(produceEventOrderConfirmed).not.toHaveBeenCalled();
    });

    test("should handle repository errors during quantity increase", async () => {
      const orderData = {
        order_id: "ORD-123",
        items: [{ sku: "SKU123", product_id: 1, quantity: 5 }],
      };

      const mockProduct = {
        id: 1,
        sku: "SKU123",
        Inventory: {
          available_quantity: 100,
          reserved_quantity: 10,
        },
      };

      getInventoryProductBySku.mockResolvedValue(mockProduct);
      increseReservedQuantityByProductId.mockRejectedValue(
        new Error("Database error")
      );
      produceEventOrderConfirmed.mockResolvedValue();

      await expect(processEventOrderCreated(orderData)).rejects.toThrow(
        "Database error"
      );

      expect(getInventoryProductBySku).toHaveBeenCalledWith("SKU123");
      expect(increseReservedQuantityByProductId).toHaveBeenCalledWith(1, 5);
      expect(produceEventOrderConfirmed).not.toHaveBeenCalled();
    });

    test("should handle empty items array", async () => {
      const orderData = {
        order_id: "ORD-123",
        items: [],
      };

      await processEventOrderCreated(orderData);

      expect(getInventoryProductBySku).not.toHaveBeenCalled();
      expect(increseReservedQuantityByProductId).not.toHaveBeenCalled();
      expect(produceEventOrderConfirmed).toHaveBeenCalledWith(orderData);
      expect(produceEventOrderFailed).not.toHaveBeenCalled();
    });

    test("should handle undefined items", async () => {
      const orderData = {
        order_id: "ORD-123",
        items: undefined,
      };

      await expect(processEventOrderCreated(orderData)).rejects.toThrow();
    });
  });
});
