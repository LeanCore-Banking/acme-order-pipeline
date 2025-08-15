import { ApiProperty } from '@nestjs/swagger';
import { Product } from '../interfaces/product.interface';

export class ProductDto implements Product {
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'ID único del producto',
  })
  id: string;

  @ApiProperty({
    type: String,
    description: 'SKU único del producto',
    maxLength: 50,
  })
  sku: string;

  @ApiProperty({
    type: String,
    description: 'Nombre del producto',
    maxLength: 255,
  })
  name: string;

  @ApiProperty({
    type: Number,
    description: 'Precio del producto',
    example: '1299.99',
  })
  price: number;

  @ApiProperty({
    type: Number,
    description: 'Cantidad disponible del producto',
    example: 100,
  })
  available_quantity: number;
}
export class ProductInventoryItemDto {
  @ApiProperty({ example: 'LAPTOP001', description: 'SKU del producto' })
  sku: string;

  @ApiProperty({ example: 'Gaming Laptop Pro', description: 'Nombre del producto' })
  product_name: string;

  @ApiProperty({ example: 14, description: 'Cantidad disponible en inventario' })
  available_quantity: number;

  @ApiProperty({ example: 0, description: 'Cantidad reservada del inventario' })
  reserved_quantity: number;
}

export class ProductInventoryItemNotFoundResponse {
  @ApiProperty({
    example: `Not Found`,
    description: 'error name',
  })
  error: string;
  @ApiProperty({
    example: 'Product with SKU LAPTOP002 not found',
    description: 'error message',
  })
  message: string;
  @ApiProperty({
    example: 404,
    description: 'status code',
  })
  code: number;
}
