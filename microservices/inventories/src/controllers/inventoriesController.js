const {
  getInventoryProductBySkuService,
  getAllInventoryProductsService,
} = require("../services/inventoriesService");

async function getInventoryProductBySku(req, res) {
  const { sku } = req.params;

  try {
    const product = await getInventoryProductBySkuService(sku);
    if (!product) {
      return res.status(200).json({});
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getAllInventoryProducts(req, res) {
  try {
    const product = await getAllInventoryProductsService();
    if (!product) {
      return res.status(200).json([]);
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { getInventoryProductBySku, getAllInventoryProducts };
