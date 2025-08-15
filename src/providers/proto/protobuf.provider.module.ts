import { Global, Module } from '@nestjs/common';
import * as path from 'path';
import * as protobuf from 'protobufjs';
import {
  PROTOBUF_ROOT,
  PB_ORDER_EVENT,
  PB_ORDER_CREATED,
  PB_PAYMENT_PROCESSED,
  PB_ORDER_CONFIRMED,
  PB_ORDER_FAILED,
} from '@/config/queue/protobuf/protobuf.token';

@Global()
@Module({
  providers: [
    // Root protobuf
    {
      provide: PROTOBUF_ROOT,
      useFactory: async () => {
        const protoPath = path.resolve(process.cwd(), 'proto', 'order_events.proto');
        return protobuf.load(protoPath);
      },
    },
    // Tipo padre: OrderEvent
    {
      provide: PB_ORDER_EVENT,
      useFactory: (root: protobuf.Root) => root.lookupType('ecommerce.orders.OrderEvent'),
      inject: [PROTOBUF_ROOT],
    },
    // Tipos hijos
    {
      provide: PB_ORDER_CREATED,
      useFactory: (root: protobuf.Root) => root.lookupType('ecommerce.orders.OrderCreated'),
      inject: [PROTOBUF_ROOT],
    },
    {
      provide: PB_PAYMENT_PROCESSED,
      useFactory: (root: protobuf.Root) => root.lookupType('ecommerce.orders.PaymentProcessed'),
      inject: [PROTOBUF_ROOT],
    },
    {
      provide: PB_ORDER_CONFIRMED,
      useFactory: (root: protobuf.Root) => root.lookupType('ecommerce.orders.OrderConfirmed'),
      inject: [PROTOBUF_ROOT],
    },
    {
      provide: PB_ORDER_FAILED,
      useFactory: (root: protobuf.Root) => root.lookupType('ecommerce.orders.OrderFailed'),
      inject: [PROTOBUF_ROOT],
    },
  ],
  exports: [
    PROTOBUF_ROOT,
    PB_ORDER_EVENT,
    PB_ORDER_CREATED,
    PB_PAYMENT_PROCESSED,
    PB_ORDER_CONFIRMED,
    PB_ORDER_FAILED,
  ],
})
export class ProtobufModule {}
