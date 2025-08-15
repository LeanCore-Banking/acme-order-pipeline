import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductContract } from './contract/product.contract';
import { Product, QueryParams } from './interfaces/product.interface';
import { ProductService } from './product.service';
import { ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  ProductDto,
  ProductInventoryItemDto,
  ProductInventoryItemNotFoundResponse,
} from './dto/product.dto';
import { LoggerProviderService } from '@/providers/logger/logger.provider.service';

@ApiTags('Products')
@Controller('products')
export class ProductController implements ProductContract {
  private context: string;
  constructor(
    private productService: ProductService,
    private logger: LoggerProviderService,
  ) {
    this.context = ProductController.name;
  }

  @ApiResponse({
    status: 200,
    description: 'Products list',
    type: [ProductDto],
  })
  @ApiQuery({
    name: 'sku',
    required: false,
    description: 'filter by SKU',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'filter by name',
  })
  @Get('/')
  async getProducts(@Query() query: QueryParams): Promise<Partial<Product[]>> {
    this.logger.log(this.context, 'Getting all products with query', null, query);
    const entities = await this.productService.findAll(query);
    return entities as unknown as Partial<Product[]>;
  }
  @Get('/:sku/inventory')
  @ApiResponse({
    type: ProductInventoryItemDto,
    status: 200,
  })
  @ApiResponse({
    type: ProductInventoryItemNotFoundResponse,
    status: 404,
  })
  async getProductInventory(
    @Param('sku') sku: string,
  ): Promise<ProductInventoryItemDto | ProductInventoryItemNotFoundResponse> {
    this.logger.log(this.context, `Getting inventory for product with SKU ${sku}`);
    const product = await this.productService.findInventoryBySku(sku);
    if (!product) {
      throw new Error(`Product with SKU ${sku} not found`);
    }
    return product;
  }
}
