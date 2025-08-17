const axios = require("axios");

const INVENTORIES_API_URL =
  process.env.INVENTORIES_API_URL || "http://inventories:3002";

async function getProductBySku(sku) {
  const response = await axios.get(
    `${INVENTORIES_API_URL}/inventory/products/${sku}`
  );
  return response.data;
}

module.exports = { getProductBySku };
