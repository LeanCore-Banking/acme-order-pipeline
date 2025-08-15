import { Order } from '../orders.entity';
import { OrderResponseDto } from '../dto/orders-response.dto';
import { OrderSummaryDto } from '../dto/order-summary.dto';

export default class OrderMapper {
  static toResponse(order: Order): OrderResponseDto {
    return {
      order_id: order.order_id,
      status: order.status,
      message: 'Order created successfully and queued for processing',
      estimated_total: order.pricing.total,
      created_at: order.created_at,
    };
  }
  static ordersToUsers(orders: Order[]): OrderSummaryDto[] {
    return orders.map(
      (order: Order): OrderSummaryDto => ({
        order_id: order.order_id,
        status: order.status,
        total: order.pricing.total,
        created_at: order.created_at
      }),
    );
  }
}
