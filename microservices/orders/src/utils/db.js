const mongoose = require("mongoose");

const mongoUri = `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${process.env.MONGO_INITDB_ROOT_PASSWORD}@mongodb:27017/${process.env.MONGO_INITDB_DATABASE}?authSource=admin`;

const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connection establised!");
  } catch (error) {
    console.error("MongoDB wrong connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
