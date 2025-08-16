const mongoose = require("mongoose");
const { Schema } = mongoose;

jest.mock("mongoose", () => {
  const originalMongoose = jest.requireActual("mongoose");

  const SchemaMock = function (definition, options) {
    this.definition = definition;
    this.options = options;
  };

  const modelMock = jest.fn((name, schema) => ({
    name,
    schema,
  }));

  return {
    ...originalMongoose,
    Schema: SchemaMock,
    model: modelMock,
  };
});

describe("Order Mongoose Model", () => {
  let Order;
  let OrderSchema;

  beforeAll(() => {
    Order = require("../../src/models/order");
    OrderSchema = Order.schema;
  });

  it("should create OrderSchema with correct structure", () => {
    const def = OrderSchema.definition;

    expect(def.order_id).toMatchObject({
      type: String,
      required: true,
      unique: true,
      index: true,
    });
    expect(def.customer).toBeDefined();
    expect(def.items).toBeDefined();
    expect(def.pricing).toBeDefined();
    expect(def.payment).toBeDefined();
    expect(def.status).toMatchObject({ type: String, index: true });
    expect(def.created_at).toMatchObject({
      type: Date,
      default: expect.any(Function),
      index: -1,
    });
    expect(def.updated_at).toMatchObject({
      type: Date,
      default: expect.any(Function),
    });

    const custDef = def.customer.definition || def.customer;
    expect(custDef.user_id).toMatchObject({ type: String, required: true });
    expect(custDef.email).toMatchObject({ type: String, required: true });

    expect(Array.isArray(def.items)).toBe(true);
    expect(def.items.length).toBe(1);

    const pricingDef = def.pricing.definition || def.pricing;
    expect(pricingDef.subtotal).toMatchObject({ type: Number, required: true });
    expect(pricingDef.tax).toMatchObject({ type: Number, required: true });
    expect(pricingDef.total).toMatchObject({ type: Number, required: true });

    const paymentDef = def.payment.definition || def.payment;
    expect(paymentDef.status).toMatchObject({ type: String, required: true });
    expect(paymentDef.transaction_id).toMatchObject({ type: String });
    expect(paymentDef.processed_at).toMatchObject({ type: Date });
  });

  it("should call mongoose.model with 'Order' and the schema", () => {
    expect(mongoose.model).toHaveBeenCalledWith("Order", expect.anything());
  });

  it("should export the Order model", () => {
    expect(Order.name).toBe("Order");
    expect(Order.schema).toBe(OrderSchema);
  });
});
