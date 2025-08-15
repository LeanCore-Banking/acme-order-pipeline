import { Module } from '@nestjs/common';
import { HealthModule } from '@/health/health.module';
import { InventoryModule } from '@/inventory/inventory.module';
import OrderEventsModule from '@/orders-events/orders-events.module';
import { OrdersModule } from '@/orders/orders.module';
import { PaymentModule } from '@/payments/payments.module';
import { ProductModule } from '@/products/product.module';

@Module({
  imports: [
    HealthModule,
    ProductModule,
    InventoryModule,
    OrdersModule,
    OrderEventsModule,
    PaymentModule,
  ],
})
export class ApiModule {}
