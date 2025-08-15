import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Inventory } from './inventory.entity';
import { InventoryService } from './inventory.service';
import { LoggerProviderModule } from '@/providers/logger/logger.provider.module';

@Module({
  imports: [TypeOrmModule.forFeature([Inventory]), LoggerProviderModule],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
