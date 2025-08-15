import { Injectable } from '@nestjs/common';

import { OrderEventService } from './orders-events.service';
import { LoggerProviderService } from '@/providers/logger/logger.provider.service';
import { EventType, PaymentStatus } from '@/common/enum';
import { InventoryService } from '@/inventory/inventory.service';
import { OrderEvent } from './orders-events.entity';
import { OrderCreatedItem, OrderEventInterface } from './interfaces/orders-events.interface';
import OrderUtils from '@/common/utils/order.utils';
import { OrdersService } from '@/orders/orders.service';
import { OrderByOrderIdResponseDto } from '@/orders/dto/orders-response.dto';

@Injectable()
export class OrderEventStrategyService {
  private context: string;
  constructor(
    private readonly orderEventService: OrderEventService,
    private readonly orderService: OrdersService,
    private readonly inventoryService: InventoryService,
    private readonly logger: LoggerProviderService,
  ) {
    this.context = OrderEventStrategyService.name;
  }

  private async handleOrderCreated(event: OrderEventInterface) {
    const existing = await this.orderEventService.validateOrderEvents(event.orderId);

    if (existing) {
      this.logger.log(this.context, `Order ${event.orderId} already processed, skipping`);
      return;
    }
    this.logger.log(this.context, 'Reserving inventory...');
    type OrderItemMinimal = Pick<OrderCreatedItem, 'productId' | 'quantity'>;
    const items: OrderItemMinimal[] = (event.orderCreated?.items || []).map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    await this.inventoryService.reserve(items);

    const orderEvents: Partial<OrderEvent> = {
      order_id: event.orderId,
      event_type: event.eventType,
      timestamp: new Date(
        Number(event.timestamp.seconds) * 1000 + event.timestamp.nanos / 1_000_000,
      ),
    };
    const orderEventCreated = await this.orderEventService.saveOrderEvent(orderEvents);
    this.logger.log(
      this.context,
      'Order Events has created',
      this.handleOrderCreated.name,
      orderEventCreated,
    );
    const { subtotal } = OrderUtils.getPricingDetails(
      event.orderCreated?.items as OrderCreatedItem[],
    );
    const order = await this.getProductsByOrder(event.orderId);
    const paymentEvent = {
      eventId: crypto.randomUUID(),
      orderId: event.orderId,
      eventType: EventType.PAYMENT_PROCESSED,
      timestamp: {
        seconds: Math.floor(Date.now() / 1000),
        nanos: (Date.now() % 1000) * 1_000_000,
      },
      paymentProcessed: {
        orderId: event.orderId,
        paymentResult: {
          status: PaymentStatus.PAYMENT_PENDING,
          transaction_id: order.payment.transaction_id,
          amount: subtotal,
        },
      },
    };
    this.logger.log(this.context, 'Sending payment process...');
    await this.orderEventService.sendToKafka('payment-events', paymentEvent);
  }

  private async handleOrderConfirmed(event: OrderEventInterface) {
    this.logger.log(this.context, `Order confirmed ${event.orderId}`);
    await this.orderEventService.saveOrderEvent({
      order_id: event.orderId,
      event_type: EventType.ORDER_CONFIRMED,
      timestamp: new Date(),
    });
    const order = await this.getProductsByOrder(event.orderId);
    const products = order.items.map((item) => ({
      productId: item.product_id,
      quantity: item.quantity,
    }));
    await this.inventoryService.decrementStock(products);
    await this.orderService.completeOrder(event.orderId, EventType.ORDER_CONFIRMED);
  }

  private async handleOrderFailed(event: OrderEventInterface) {
    this.logger.log(this.context, `Order failed ${event.orderId}`);
     const order = await this.getProductsByOrder(event.orderId);
    const products = order.items.map((item) => ({
      productId: item.product_id,
      quantity: item.quantity,
    }));
    await this.inventoryService.revertReservation(products);
    await this.orderEventService.saveOrderEvent({
      order_id: event.orderId,
      event_type: EventType.ORDER_FAILED,
      timestamp: new Date(),
    });
    await this.orderService.completeOrder(event.orderId, EventType.ORDER_FAILED);
    this.logger.log(this.context, `Order failed ${event.orderId}`);
  }

  private async getProductsByOrder(orderId: string) {
    return (await this.orderService.findOrder(orderId)) as OrderByOrderIdResponseDto;
  }
  public async execute(event: OrderEventInterface) {
    const handlers: Record<number, (event: OrderEventInterface) => Promise<void>> = {
      [EventType.ORDER_CREATED]: this.handleOrderCreated.bind(this),
      [EventType.ORDER_CONFIRMED]: this.handleOrderConfirmed.bind(this),
      [EventType.ORDER_FAILED]: this.handleOrderFailed.bind(this),
    };

    const handler = handlers[event.eventType];
    if (handler) {
      await handler(event);
    } else {
      this.logger.warn(this.context, `No handler for event type ${event.eventType}`);
    }
  }
}
