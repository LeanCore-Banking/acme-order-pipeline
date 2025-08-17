const getProductBySku = jest.fn().mockResolvedValue({
  id: "product123",
  name: "Test Product",
  price: 75.0,
  Inventory: {
    available_quantity: 10,
    reserved_quantity: 2,
  },
});

module.exports = {
  getProductBySku,
};
