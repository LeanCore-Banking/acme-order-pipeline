const {
  getInventoryProductBySku,
  getAllInventoryProducts,
} = require("../../src/controllers/inventoriesController");

jest.mock("../../src/services/inventoriesService", () => ({
  getInventoryProductBySkuService: jest.fn(),
  getAllInventoryProductsService: jest.fn(),
}));

const {
  getInventoryProductBySkuService,
  getAllInventoryProductsService,
} = require("../../src/services/inventoriesService");

describe("inventoriesController", () => {
  let req, res;

  beforeEach(() => {
    req = { params: {}, body: {} };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  describe("getInventoryProductBySku", () => {
    it("should respond with product when it exists", async () => {
      const product = { sku: "LAPTOP001", name: "Laptop" };
      getInventoryProductBySkuService.mockResolvedValue(product);
      req.params.sku = "LAPTOP001";

      await getInventoryProductBySku(req, res);

      expect(getInventoryProductBySkuService).toHaveBeenCalledWith("LAPTOP001");
      expect(res.json).toHaveBeenCalledWith(product);
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should respond with empty object when product not found", async () => {
      getInventoryProductBySkuService.mockResolvedValue(null);
      req.params.sku = "UNKNOWN";

      await getInventoryProductBySku(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({});
    });

    it("should respond with 500 error on exception", async () => {
      const error = new Error("Unexpected error");
      getInventoryProductBySkuService.mockRejectedValue(error);
      req.params.sku = "LAPTOP001";

      await getInventoryProductBySku(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Unexpected error" });
    });
  });

  describe("getAllInventoryProducts", () => {
    it("should respond with list of products when they exist", async () => {
      const products = [{ sku: "LAPTOP001" }, { sku: "MOUSE001" }];
      getAllInventoryProductsService.mockResolvedValue(products);

      await getAllInventoryProducts(req, res);

      expect(getAllInventoryProductsService).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(products);
      expect(res.status).not.toHaveBeenCalled();
    });

    it("should respond with empty array when no products found", async () => {
      getAllInventoryProductsService.mockResolvedValue(null);

      await getAllInventoryProducts(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it("should respond with 500 error on exception", async () => {
      const error = new Error("Critical error");
      getAllInventoryProductsService.mockRejectedValue(error);

      await getAllInventoryProducts(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Critical error" });
    });
  });
});
