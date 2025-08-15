import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product.entity';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

import { LoggerProviderModule } from '@/providers/logger/logger.provider.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), LoggerProviderModule],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
