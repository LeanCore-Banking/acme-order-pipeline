const {
  getInventoryProductBySku,
  getAllInventoryProducts,
} = require("../../src/controllers/inventoriesController");

// Mock del servicio de inventarios
jest.mock("../../src/services/inventoriesService");

const {
  getInventoryProductBySkuService,
  getAllInventoryProductsService,
} = require("../../src/services/inventoriesService");

describe("Inventories Controller", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    // Limpiar todos los mocks antes de cada prueba
    jest.clearAllMocks();

    // Configurar objetos mock de request y response
    mockReq = {
      body: {},
      params: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe("getInventoryProductBySku", () => {
    test("should get inventory product successfully with valid SKU", async () => {
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

      mockReq.params = { sku };
      getInventoryProductBySkuService.mockResolvedValue(mockProduct);

      await getInventoryProductBySku(mockReq, mockRes);

      expect(getInventoryProductBySkuService).toHaveBeenCalledWith(sku);
      expect(mockRes.json).toHaveBeenCalledWith(mockProduct);
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test("should return empty object when product is not found", async () => {
      const sku = "NONEXISTENT";
      mockReq.params = { sku };
      getInventoryProductBySkuService.mockResolvedValue(null);

      await getInventoryProductBySku(mockReq, mockRes);

      expect(getInventoryProductBySkuService).toHaveBeenCalledWith(sku);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({});
    });

    test("should return empty object when product is undefined", async () => {
      const sku = "UNDEFINED";
      mockReq.params = { sku };
      getInventoryProductBySkuService.mockResolvedValue(undefined);

      await getInventoryProductBySku(mockReq, mockRes);

      expect(getInventoryProductBySkuService).toHaveBeenCalledWith(sku);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({});
    });

    test("should return empty object when product is empty object", async () => {
      const sku = "EMPTY";
      mockReq.params = { sku };
      getInventoryProductBySkuService.mockResolvedValue({});

      await getInventoryProductBySku(mockReq, mockRes);

      expect(getInventoryProductBySkuService).toHaveBeenCalledWith(sku);
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith({});
    });

    test("should handle service errors and return 500", async () => {
      const sku = "ERROR";
      const serviceError = new Error("Database connection failed");
      mockReq.params = { sku };
      getInventoryProductBySkuService.mockRejectedValue(serviceError);

      await getInventoryProductBySku(mockReq, mockRes);

      expect(getInventoryProductBySkuService).toHaveBeenCalledWith(sku);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Database connection failed",
      });
    });

    test("should handle service errors with custom error messages", async () => {
      const sku = "CUSTOM_ERROR";
      const serviceError = new Error("Product validation failed");
      mockReq.params = { sku };
      getInventoryProductBySkuService.mockRejectedValue(serviceError);

      await getInventoryProductBySku(mockReq, mockRes);

      expect(getInventoryProductBySkuService).toHaveBeenCalledWith(sku);
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Product validation failed",
      });
    });

    test("should handle missing SKU parameter gracefully", async () => {
      mockReq.params = {};
      getInventoryProductBySkuService.mockResolvedValue(null);

      await getInventoryProductBySku(mockReq, mockRes);

      expect(getInventoryProductBySkuService).toHaveBeenCalledWith(undefined);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({});
    });

    test("should handle empty string SKU parameter", async () => {
      const sku = "";
      mockReq.params = { sku };
      getInventoryProductBySkuService.mockResolvedValue(null);

      await getInventoryProductBySku(mockReq, mockRes);

      expect(getInventoryProductBySkuService).toHaveBeenCalledWith("");
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({});
    });

    test("should handle null SKU parameter", async () => {
      const sku = null;
      mockReq.params = { sku };
      getInventoryProductBySkuService.mockResolvedValue(null);

      await getInventoryProductBySku(mockReq, mockRes);

      expect(getInventoryProductBySkuService).toHaveBeenCalledWith(null);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({});
    });
  });

  describe("getAllInventoryProducts", () => {
    test("should get all inventory products successfully", async () => {
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

      getAllInventoryProductsService.mockResolvedValue(mockProducts);

      await getAllInventoryProducts(mockReq, mockRes);

      expect(getAllInventoryProductsService).toHaveBeenCalledWith();
      expect(mockRes.json).toHaveBeenCalledWith(mockProducts);
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    test("should return empty array when no products exist", async () => {
      const mockProducts = [];
      getAllInventoryProductsService.mockResolvedValue(mockProducts);

      await getAllInventoryProducts(mockReq, mockRes);

      expect(getAllInventoryProductsService).toHaveBeenCalledWith();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith([]);
    });

    test("should return empty array when products is null", async () => {
      getAllInventoryProductsService.mockResolvedValue(null);

      await getAllInventoryProducts(mockReq, mockRes);

      expect(getAllInventoryProductsService).toHaveBeenCalledWith();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith([]);
    });

    test("should return empty array when products is undefined", async () => {
      getAllInventoryProductsService.mockResolvedValue(undefined);

      await getAllInventoryProducts(mockReq, mockRes);

      expect(getAllInventoryProductsService).toHaveBeenCalledWith();
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith([]);
    });

    test("should handle service errors and return 500", async () => {
      const serviceError = new Error("Database connection failed");
      getAllInventoryProductsService.mockRejectedValue(serviceError);

      await getAllInventoryProducts(mockReq, mockRes);

      expect(getAllInventoryProductsService).toHaveBeenCalledWith();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Database connection failed",
      });
    });

    test("should handle service errors with custom error messages", async () => {
      const serviceError = new Error("Products validation failed");
      getAllInventoryProductsService.mockRejectedValue(serviceError);

      await getAllInventoryProducts(mockReq, mockRes);

      expect(getAllInventoryProductsService).toHaveBeenCalledWith();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Products validation failed",
      });
    });

    test("should handle service errors with complex error messages", async () => {
      const serviceError = new Error("Connection timeout after 30 seconds");
      getAllInventoryProductsService.mockRejectedValue(serviceError);

      await getAllInventoryProducts(mockReq, mockRes);

      expect(getAllInventoryProductsService).toHaveBeenCalledWith();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "Connection timeout after 30 seconds",
      });
    });

    test("should handle service errors with empty error messages", async () => {
      const serviceError = new Error("");
      getAllInventoryProductsService.mockRejectedValue(serviceError);

      await getAllInventoryProducts(mockReq, mockRes);

      expect(getAllInventoryProductsService).toHaveBeenCalledWith();
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: "",
      });
    });
  });
});
