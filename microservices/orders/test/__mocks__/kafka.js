const produceEventOrderCreated = jest.fn().mockResolvedValue(true);
const produceEventOrderConfirmed = jest.fn().mockResolvedValue(true);
const produceEventOrderFailed = jest.fn().mockResolvedValue(true);
const consumerEventOrderCreated = jest.fn();
const consumerEventOrderConfirmed = jest.fn();
const consumerEventOrderFailed = jest.fn();

module.exports = {
  produceEventOrderCreated,
  produceEventOrderConfirmed,
  produceEventOrderFailed,
  consumerEventOrderCreated,
  consumerEventOrderConfirmed,
  consumerEventOrderFailed,
};

module.exports.producerEventOrderCreated = {
  produceEventOrderCreated,
};

module.exports.producerEventOrderConfirmed = {
  produceEventOrderConfirmed,
};

module.exports.producerEventOrderFailed = {
  produceEventOrderFailed,
};
