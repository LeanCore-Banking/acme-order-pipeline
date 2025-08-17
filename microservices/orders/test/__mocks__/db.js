// Mock for database connection
const connectDB = jest.fn().mockResolvedValue(true);
const disconnectDB = jest.fn().mockResolvedValue(true);

module.exports = {
  connectDB,
  disconnectDB,
};
