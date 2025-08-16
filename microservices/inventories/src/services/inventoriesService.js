const {
  getInventoryProductBySku,
  getAllProducts,
} = require("../repositories/inventoriesRepository");

async function getInventoryProductBySkuService(sku) {
  const productData = await getInventoryProductBySku(sku);
  if (!productData) return null;
  return productData;
}

async function getAllInventoryProductsService() {
  const productData = await getAllProducts();
  if (!productData) return null;
  return productData;
}

module.exports = {
  getInventoryProductBySkuService,
  getAllInventoryProductsService,
};
