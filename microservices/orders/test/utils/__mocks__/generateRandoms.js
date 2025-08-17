const buildOrderId = jest.fn(() => "ORD-2024-123456");
const buildTransactionId = jest.fn(() => "txn_123456");

module.exports = {
  buildOrderId,
  buildTransactionId,
};
