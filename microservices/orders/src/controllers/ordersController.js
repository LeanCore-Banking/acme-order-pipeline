const {
  createOrderService,
  getOrderByIdService,
  getAllOrdersService,
} = require("../services/ordersService");

async function createOrder(req, res) {
  const orderData = req.body;

  try {
    if (
      !orderData.order_id ||
      !orderData.pricing ||
      !orderData.items ||
      !orderData.customer
    ) {
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
  const params = req.params;
  const { orderId } = params;

  try {
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

async function getAllOrders(req, res) {
  try {
    const result = await getAllOrdersService();
    res.status(200).json({
      message: "Orders found",
      order: result,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { createOrder, getOrderById, getAllOrders };
