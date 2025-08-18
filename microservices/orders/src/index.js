require("dotenv").config();
const express = require("express");
const connectDB = require("./utils/db");
const {
  createOrder,
  getOrderById,
  getOrdersByUserId,
} = require("./controllers/ordersController");
const { listenEventOrderFailed } = require("./kafka/consumerEventOrderFailed");
const {
  listenEventOrderConfirmed,
} = require("./kafka/consumerEventOrderConfirmed");

const app = express();
const PORT = process.env.PORT || 3001;
app.use(express.json());
const v1Router = express.Router();

v1Router.post("/orders", createOrder);
v1Router.get("/orders/:orderId", getOrderById);
v1Router.get("/users/:userId/orders", getOrdersByUserId);
v1Router.get("/", (req, res) => res.send("Orders Service API is running"));

app.use("/api/v1", v1Router);

connectDB()
  .then(() => {
    listenEventOrderFailed();
    listenEventOrderConfirmed();
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Orders Service running on port ${PORT}`);
    });
  });
