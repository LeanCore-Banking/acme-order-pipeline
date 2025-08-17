const {
  createOrderService,
  getOrderByIdService,
  getOrdersByUserIdService,
} = require("../services/ordersService");

async function createOrder(req, res) {
  const orderData = req.body;

  try {
    if (!orderData.items || !orderData.customer) {
      throw new Error("Missing required data");
    }
    const result = await createOrderService(orderData);
    res.status(201).json({
      message: "Order processed successfully",
      order: result,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

async function getOrderById(req, res) {
  try {
    const params = req.params;
    const { orderId } = params;
    if (!orderId) {
      throw new Error("Missing orderId");
    }
    const result = await getOrderByIdService(orderId);
    res.status(200).json({
      message: "Order found",
      order: result,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getOrdersByUserId(req, res) {
  try {
    const params = req.params;
    const { userId } = params;
    const result = await getOrdersByUserIdService(userId);
    res.status(200).json({
      message: "Orders found",
      order: result,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { createOrder, getOrderById, getOrdersByUserId };
