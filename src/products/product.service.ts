import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Product } from './product.entity';
import { QueryParams } from './interfaces/product.interface';
import ProductMapper from './mapper/product.mapper';
import { LoggerProviderService } from '@/providers/logger/logger.provider.service';
import { ProductInventoryItemDto } from './dto/product.dto';

@Injectable()
export class ProductService {
  private context: string;
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly logger: LoggerProviderService,
  ) {
    this.context = ProductService.name;
  }

  async findAll(query: QueryParams): Promise<Product[]> {
    this.logger.log(this.context, 'Finding all products with query');
    try {
      const products = await this.productRepository.find({
        where: query,
        relations: ['inventory'],
      });
      return ProductMapper.toProducts(products);
    } catch (error) {
      const traceError = error instanceof Error ? error.message : String(error);
      this.logger.error(this.context, 'Error finding products', traceError);
      throw error;
    }
  }
  async findInventoryBySku(sku: string): Promise<ProductInventoryItemDto> {
    this.logger.log(this.context, `Finding product inventory by SKU: ${sku}`);
    try {
      const product = await this.productRepository.findOne({
        where: { sku },
        relations: ['inventory'],
      });
      if (!product) {
        throw new NotFoundException(`Product with SKU ${sku} not found`);
      }
      return ProductMapper.toProductInventory(product);
    } catch (error) {
      const traceError = error instanceof Error ? error.message : String(error);
      this.logger.error(this.context, `Error finding inventory for SKU ${sku}`, traceError);
      throw error;
    }
  }
  async findBySkus(skus: string[]): Promise<Product[]> {
    this.logger.log(this.context, `Finding products by SKUs: ${skus.join(', ')}`);
    try {
      const products = await this.productRepository.find({
        where: { sku: In(skus) },
        relations: ['inventory'],
      });

      const foundSkus = products.map((p) => p.sku);
      const skusNotFound = skus.filter((sku) => !foundSkus.includes(sku));

      if (skusNotFound.length > 0) {
        throw new NotFoundException({
          error: 'product_not_found',
          message: `Product with SKU ${skusNotFound[0]} not found`,
          code: 404,
        });
      }
      return products;
    } catch (error) {
      const traceError = error instanceof Error ? error.message : String(error);
      this.logger.error(this.context, 'Error finding products by SKUs', traceError);

      throw error;
    }
  }
}
