const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db");
const Product = require("./product");

const Inventory = sequelize.define(
  "Inventory",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "product", key: "id" },
    },
    available_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 0 },
    },
    reserved_quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { min: 0 },
    },
    last_updated: {
      type: DataTypes.DATE,
      defaultValue: sequelize.NOW,
    },
  },
  {
    tableName: "inventory",
    timestamps: false,
  }
);

// Asociaciones
Product.hasOne(Inventory, { foreignKey: "product_id" });
Inventory.belongsTo(Product, { foreignKey: "product_id" });

module.exports = Inventory;
