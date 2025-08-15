import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

import { PB_ORDER_EVENT } from '@/config/queue/protobuf/protobuf.token';

import { LoggerProviderService } from '@/providers/logger/logger.provider.service';
import * as protobuf from 'protobufjs';
import { OrderEventInterface } from '@/orders-events/interfaces/orders-events.interface';
import { PaymentService } from './payments.service';

@Controller()
export class PaymentConsumer {
  private context: string;
  constructor(
    @Inject(PB_ORDER_EVENT) private readonly orderEventType: protobuf.Type,
    private readonly logger: LoggerProviderService,
    private readonly paymentService: PaymentService,
  ) {
    this.context = PaymentConsumer.name;
  }
  @MessagePattern('payment-events')
  async handlePaymentProcess(@Payload() message: Base64URLString) {
    const buffer = Buffer.from(message, 'base64');

    try {
      const decoded = this.orderEventType.decode(buffer);
      const event = this.orderEventType.toObject(decoded) as OrderEventInterface;
      this.logger.log(
        this.context,
        'Payment process received',
        this.handlePaymentProcess.name,
        event,
      );

      await this.paymentService.start(event);
    } catch (error) {
      console.log(error);
      this.logger.error(this.context, JSON.stringify(error));
    }
  }
}
