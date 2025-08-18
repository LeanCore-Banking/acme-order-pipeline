const { customAlphabet } = require("nanoid");
const nanoidNumber = customAlphabet("0123456789", 6);

function buildOrderId() {
  const now = new Date();
  const year = now.getFullYear();
  const complement = nanoidNumber();
  return `ORD-${year}-${complement}`;
}

function buildTransactionId() {
  const complement = nanoidNumber();
  return `txn_${complement}`;
}

module.exports = { buildTransactionId, buildOrderId };
