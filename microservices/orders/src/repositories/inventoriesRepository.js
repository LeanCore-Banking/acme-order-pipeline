const axios = require("axios");

const INVENTORIES_API_URL =
  process.env.INVENTORIES_API_URL || "http://inventories:3002/api/v1";

async function getProductBySku(sku) {
  const response = await axios.get(
    `${INVENTORIES_API_URL}/products/${sku}/inventory`
  );
  return response.data;
}

module.exports = { getProductBySku };
