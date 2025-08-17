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

async function increseReservedQuantityByProductId(
  productId,
  quantityToReserve
) {
  const result = await Inventory.increment(
    { reserved_quantity: quantityToReserve },
    { where: { product_id: productId } }
  );
  return result;
}

module.exports = {
  getInventoryProductBySku,
  getAllProducts,
  increseReservedQuantityByProductId,
};
