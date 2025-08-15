import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEvent } from './orders-events.entity';
import { MONGO_DB_TYPE_ORM_NAME } from '@/common/constants';
import { OrderEventsConsumer } from './orders-events.controller';
import { LoggerProviderModule } from '@/providers/logger/logger.provider.module';
import { OrderEventService } from './orders-events.service';
import { OrderEventStrategyService } from './orders-events-strategy.service';
import { InventoryModule } from '@/inventory/inventory.module';
import { OrdersModule } from '@/orders/orders.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEvent], MONGO_DB_TYPE_ORM_NAME),
    InventoryModule,
    LoggerProviderModule,
    OrdersModule,
  ],
  providers: [OrderEventService, OrderEventStrategyService],
  controllers: [OrderEventsConsumer],
  exports: [OrderEventService],
})
export default class OrderEventsModule {}
