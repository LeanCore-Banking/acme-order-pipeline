const customAlphabet = jest.fn(() => jest.fn(() => "123456"));

const buildOrderId = jest.fn(() => "ORD-2024-123456");
const buildTransactionId = jest.fn(() => "txn_123456");

module.exports = {
  customAlphabet,
  nanoid: jest.fn(() => "mock-id-123"),
  urlAlphabet: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  buildOrderId,
  buildTransactionId,
};

module.exports.default = module.exports;
