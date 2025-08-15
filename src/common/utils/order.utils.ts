import { OrderItemDto, OrderPricingDto } from '../../orders/dto/orders-create.dto';
const { TAX_RATE } = process.env;
export default class OrderUtils {
  static getPricingDetails(items: OrderItemDto[]): OrderPricingDto {
    const subtotal = this.calculateSubTotal(items);
    const tax = subtotal * Number(TAX_RATE || 0.1);

    return {
      subtotal,
      tax,
      total: Number(Math.round(subtotal + tax).toFixed(2)),
    };
  }

  static calculateSubTotal(items: OrderItemDto[]): number {
    return items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  }
}
