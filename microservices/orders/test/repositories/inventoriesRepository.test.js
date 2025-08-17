jest.mock("axios");

const axios = require("axios");
const {
  getProductBySku,
} = require("../../src/repositories/inventoriesRepository");

describe("inventoriesClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should call axios.get with correct URL and return data", async () => {
    process.env.INVENTORIES_API_URL = "http://localhost:3002";
    const sku = "ABC123";
    const mockData = {
      id: "123",
      sku,
      name: "Product ABC",
      available_quantity: 10,
    };
    axios.get.mockResolvedValue({ data: mockData });

    const result = await getProductBySku(sku);

    expect(axios.get).toHaveBeenCalledWith(
      `http://localhost:3002/inventory/products/${sku}`
    );
    expect(result).toEqual(mockData);
  });

  it("should use environment variable INVENTORIES_API_URL if set", async () => {
    const customUrl = "http://custom-url:4000";
    process.env.INVENTORIES_API_URL = customUrl;

    jest.resetModules(); // <--- limpia el cache

    // Importa AQUÍ después de cambiar env
    const axios = require("axios");
    axios.get.mockClear();

    const {
      getProductBySku,
    } = require("../../src/repositories/inventoriesRepository");

    const sku = "DEF456";
    const mockData = {
      id: "456",
      sku,
      name: "Product DEF",
      available_quantity: 5,
    };
    axios.get.mockResolvedValue({ data: mockData });

    const result = await getProductBySku(sku);

    expect(axios.get).toHaveBeenCalledWith(
      `${customUrl}/inventory/products/${sku}`
    );
    expect(result).toEqual(mockData);
  });

  it("should throw if axios.get rejects", async () => {
    process.env.INVENTORIES_API_URL = "http://localhost:3002";
    const sku = "ERRSKU";
    const error = new Error("Network Error");
    axios.get.mockRejectedValue(error);

    await expect(getProductBySku(sku)).rejects.toThrow("Network Error");
  });
});
