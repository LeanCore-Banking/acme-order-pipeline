import { ProductInventoryItemDto } from '../dto/product.dto';
import { Product } from '../product.entity';
import { LoggerProviderService } from '@/providers/logger/logger.provider.service';
const logger = new LoggerProviderService();
export default class ProductMapper {
  static context: string = ProductMapper.name;
  static toProducts(productEntity: Partial<Product[]>): Product[] {
    logger.log(this.context, 'Mapping product entity to response format', this.toProducts.name);
    return productEntity.map((product) => {
      return {
        id: product?.id,
        name: product?.name,
        price: Number(product?.price),
        sku: product?.sku,
        available_quantity: product?.inventory?.available_quantity,
      };
    }) as unknown as Product[];
  }

  static toProductInventory(productEntity: Partial<Product>): ProductInventoryItemDto {
    logger.log(
      this.context,
      'Mapping product entity to inventory response format',
      this.toProductInventory.name,
    );
    return {
      sku: productEntity?.sku,
      product_name: productEntity?.name,
      available_quantity: productEntity?.inventory?.available_quantity,
      reserved_quantity: productEntity?.inventory?.reserved_quantity,
    } as ProductInventoryItemDto;
  }
}
