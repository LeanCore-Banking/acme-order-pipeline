require("dotenv").config();
const express = require("express");
const connectDB = require("./utils/db");
const {
  createOrder,
  getOrderById,
  getAllOrders,
} = require("./controllers/ordersController");

const app = express();
const PORT = process.env.PORT || 3001;
app.use(express.json());

app.post("/orders", createOrder);
app.get("/orders", getAllOrders);
app.get("/orders/:orderId", getOrderById);
app.get("/", (req, res) => res.send("Orders Service API is running"));

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Orders Service running on port ${PORT}`);
  });
});
