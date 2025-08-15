import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PB_ORDER_EVENT } from '@/config/queue/protobuf/protobuf.token';
import { LoggerProviderService } from '@/providers/logger/logger.provider.service';

import { OrderEventStrategyService } from './orders-events-strategy.service';
import { OrderEventInterface } from './interfaces/orders-events.interface';
import * as protobuf from 'protobufjs';
@Controller()
export class OrderEventsConsumer {
  private context: string;
  constructor(
    @Inject(PB_ORDER_EVENT) private readonly orderEventType: protobuf.Type,
    private readonly logger: LoggerProviderService,
    private readonly strategy: OrderEventStrategyService,
  ) {
    this.context = OrderEventsConsumer.name;
  }
  @MessagePattern('order-events')
  async handleOrderCreate(@Payload() message: Base64URLString) {
    const buffer = Buffer.from(message, 'base64');
    const decoded = this.orderEventType.decode(buffer);
    const event = this.orderEventType.toObject(decoded) as OrderEventInterface;

    this.logger.log(this.context, 'Event received', this.handleOrderCreate.name, event);

    await this.strategy.execute(event);
  }
}
