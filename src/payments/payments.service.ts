import { Injectable } from '@nestjs/common';
import { EventType, PaymentStatus } from '@/common/enum';
import { OrderEventInterface } from '@/orders-events/interfaces/orders-events.interface';
import { OrderEventService } from '@/orders-events/orders-events.service';
import { LoggerProviderService } from '@/providers/logger/logger.provider.service';

@Injectable()
export class PaymentService {
  private context: string;
  constructor(
    private readonly logger: LoggerProviderService,
    private readonly orderEventService: OrderEventService,
  ) {
    this.context = PaymentService.name;
  }

  async start(event: OrderEventInterface) {
    const paymentSuccess = Math.random() > 0.2;
    const { TAX_RATE } = process.env;

    const subtotal: number = Number(event.paymentProcessed?.paymentResult.amount);
    const tax: number = subtotal * Number(TAX_RATE || 0.1);
    const total: number = subtotal + tax;

    this.logger.log(this.context, 'Starting payment process...');
    await this.orderEventService.saveOrderEvent({
      order_id: event.orderId,
      event_type: EventType.PAYMENT_PROCESSED,
      timestamp: new Date(),
    });
    if (paymentSuccess) {
      const confirmationEvent = {
        eventId: crypto.randomUUID(),
        orderId: event.orderId,
        eventType: EventType.ORDER_CONFIRMED,
        timestamp: {
          seconds: Math.floor(Date.now() / 1000),
          nanos: (Date.now() % 1000) * 1_000_000,
        },
        orderConfirmed: {
          orderId: event.orderId,
          summary: {
            subtotal: subtotal,
            taxAmount: tax,
            totalAmount: Number(total.toFixed(2)),
          },
        },
      };

      this.logger.log(this.context, `Order ${event.orderId} confirmed`);

      await this.orderEventService.sendToKafka('order-events', confirmationEvent);
    } else {
      const failedEvent = {
        eventId: crypto.randomUUID(),
        orderId: event.orderId,
        eventType: EventType.ORDER_FAILED,
        timestamp: {
          seconds: Math.floor(Date.now() / 1000),
          nanos: (Date.now() % 1000) * 1_000_000,
        },
        orderFailed: {
          orderId: event.orderId,
          reason: PaymentStatus.PAYMENT_FAILED,
          errorMessage: 'Simulated payment failure',
        },
      };
      this.logger.log(this.context, `Order ${event.orderId} failed due to payment`);
      await this.orderEventService.sendToKafka('order-events', failedEvent);
    }
  }
}
