const express = require("express");
const sequelize = require("./utils/db");
const {
  getInventoryProductBySku,
  getAllInventoryProducts,
} = require("./controllers/inventoriesController");
const {
  listenEventOrderCreated,
} = require("./kafka/consumerEventOrderCreated");

const app = express();
const PORT = process.env.PORT || 3002;

const v1Router = express.Router();

v1Router.get("/products", getAllInventoryProducts);
v1Router.get("/products/:sku/inventory", getInventoryProductBySku);
v1Router.get("/", (req, res) =>
  res.send("Inventories Service API is running!")
);

app.use("/api/v1", v1Router);

sequelize
  .authenticate()
  .then(() => {
    console.log("PostgreSQL connection done");
    return sequelize.sync({ alter: true });
  })
  .then(() => {
    listenEventOrderCreated();
  })
  .then(() => {
    app.listen(PORT, () =>
      console.log(`Inventories Service running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("PostgreSQL connection error:", err);
  });
