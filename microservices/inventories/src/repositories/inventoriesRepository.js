const Product = require("../models/product");
const Inventory = require("../models/inventory");

async function getInventoryProductBySku(sku) {
  return await Product.findOne({
    where: { sku },
    include: [{ model: Inventory }],
  });
}

async function getAllProducts() {
  return await Product.findAll({
    include: [{ model: Inventory }],
  });
}

module.exports = {
  getInventoryProductBySku,
  getAllProducts,
};
