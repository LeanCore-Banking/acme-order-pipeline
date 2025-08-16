const express = require("express");
const sequelize = require("./utils/db");
const {
  getInventoryProductBySku,
  getAllInventoryProducts,
} = require("./controllers/inventoriesController");

const app = express();
const PORT = process.env.PORT || 3002;

app.get("/inventory/products", getAllInventoryProducts);
app.get("/inventory/products/:sku", getInventoryProductBySku);
app.get("/", (req, res) => res.send("Inventories Service API is running!"));

sequelize
  .authenticate()
  .then(() => {
    console.log("PostgreSQL connection done");
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    app.listen(PORT, () =>
      console.log(`Inventories Service running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("PostgreSQL connection error:", err);
  });
