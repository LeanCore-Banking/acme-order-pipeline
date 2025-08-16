jest.mock("../../src/services/ordersService", () => ({
  createOrderService: jest.fn(),
  getOrderByIdService: jest.fn(),
  getAllOrdersService: jest.fn(),
}));

const {
  createOrderService,
  getOrderByIdService,
  getAllOrdersService,
} = require("../../src/services/ordersService");

const {
  createOrder,
  getOrderById,
  getAllOrders,
} = require("../../src/controllers/ordersController");

describe("orderController", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {} };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    jest.clearAllMocks();
  });

  describe("createOrder", () => {
    it("should return 201 and success message when order is processed", async () => {
      const orderData = {
        order_id: "ORD001",
        pricing: {},
        items: [],
        customer: {},
      };
      req.body = orderData;
      createOrderService.mockResolvedValue(orderData);

      await createOrder(req, res);

      expect(createOrderService).toHaveBeenCalledWith(orderData);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Order processed successfully",
        order: orderData,
      });
    });

    it("should return 400 when required data is missing", async () => {
      req.body = {}; // missing data

      await createOrder(req, res);

      expect(createOrderService).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Missing required data" });
    });

    it("should return 400 when service throws error", async () => {
      const orderData = {
        order_id: "ORD001",
        pricing: {},
        items: [],
        customer: {},
      };
      req.body = orderData;
      const error = new Error("Service failure");
      createOrderService.mockRejectedValue(error);

      await createOrder(req, res);

      expect(createOrderService).toHaveBeenCalledWith(orderData);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Service failure" });
    });
  });

  describe("getOrderById", () => {
    it("should return 200 and order when found", async () => {
      const mockOrder = { order_id: "ORD001" };
      req.params.orderId = "ORD001";
      getOrderByIdService.mockResolvedValue(mockOrder);

      await getOrderById(req, res);

      expect(getOrderByIdService).toHaveBeenCalledWith("ORD001");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Order found",
        order: mockOrder,
      });
    });

    it("should return 500 when service throws error", async () => {
      req.params.orderId = "ORD001";
      const error = new Error("DB error");
      getOrderByIdService.mockRejectedValue(error);

      await getOrderById(req, res);

      expect(getOrderByIdService).toHaveBeenCalledWith("ORD001");
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "DB error" });
    });

    it("should return 500 when orderId missing", async () => {
      req.params = {}; // no orderId

      await getOrderById(req, res);

      expect(getOrderByIdService).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Missing orderId" });
    });
  });

  describe("getAllOrders", () => {
    it("should return 200 and orders", async () => {
      const mockOrders = [{ order_id: "ORD001" }, { order_id: "ORD002" }];
      getAllOrdersService.mockResolvedValue(mockOrders);

      await getAllOrders(req, res);

      expect(getAllOrdersService).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Orders found",
        order: mockOrders,
      });
    });

    it("should return 500 when service throws error", async () => {
      const error = new Error("Service failure");
      getAllOrdersService.mockRejectedValue(error);

      await getAllOrders(req, res);

      expect(getAllOrdersService).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Service failure" });
    });
  });
});
