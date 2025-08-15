import { ApiProperty } from '@nestjs/swagger';
import { CustomerDto } from './orders-create.dto';
export class OrderItemResponseDto {
  @ApiProperty({ example: 'LAPTOP001' })
  sku: string;

  @ApiProperty({ example: 'Gaming Laptop Pro' })
  name: string;

  @ApiProperty({ example: 1299.99 })
  price: number;

  @ApiProperty({ example: 1 })
  quantity: number;

  product_id: string;
}
export class PricingDto {
  @ApiProperty({ example: 1459.97 })
  subtotal: number;

  @ApiProperty({ example: 116.8 })
  tax: number;

  @ApiProperty({ example: 1576.77 })
  total: number;
}
export class OrderResponseDto {
  @ApiProperty({
    example: 'ORD-2024-001234',
    description: 'ID único de la orden',
  })
  order_id: string;

  @ApiProperty({
    example: 'pending',
    description: 'Estado de la orden',
    enum: ['pending', 'confirmed', 'failed'],
  })
  status: string;

  @ApiProperty({
    example: 'Order created successfully and queued for processing',
    description: 'Mensaje descriptivo del estado',
  })
  message: string;

  @ApiProperty({
    example: 1459.97,
    description: 'Total estimado de la orden',
  })
  estimated_total: number;

  @ApiProperty({
    example: '2024-08-04T10:25:00Z',
    description: 'Fecha de creación en formato ISO',
  })
  created_at: Date;
}
export class PaymentDto {
  @ApiProperty({ example: 'completed' })
  status: string;

  @ApiProperty({ example: 'txn_abc123xyz' })
  transaction_id: string;
}
export class OrderBadRequestResponse {
  @ApiProperty({
    example: 'insufficient_inventory',
    description: 'error name',
  })
  error: string;
  @ApiProperty({
    example: `Not enough inventory for LAPTOP001. Available: 2, Requested: 5`,
    description: 'error message',
  })
  message: string;
  @ApiProperty({
    example: 400,
    description: 'status code',
  })
  code: number;
}

export class OrderNotFoundResponse {
  @ApiProperty({
    example: 'product_not_found',
    description: 'error name',
  })
  error: string;
  @ApiProperty({
    example: `Product with SKU LAPTOP001 not found`,
    description: 'error message',
  })
  message: string;
  @ApiProperty({
    example: 404,
    description: 'status code',
  })
  code: number;
}


export class OrderByOrderIdResponseDto {
  @ApiProperty({ example: 'ORD-2024-001234' })
  order_id: string;

  @ApiProperty({ example: 'confirmed' })
  status: string;

  @ApiProperty({ type: CustomerDto })
  customer: CustomerDto;

  @ApiProperty({ type: [OrderItemResponseDto] })
  items: OrderItemResponseDto[];

  @ApiProperty({ type: PricingDto })
  pricing: PricingDto;

  @ApiProperty({ type: PaymentDto })
  payment: PaymentDto;

  @ApiProperty({ example: '2024-08-04T10:25:00Z' })
  created_at: string;

  @ApiProperty({ example: '2024-08-04T10:30:00Z' })
  updated_at: string;
}

export class OrderByOrderIdNotFoundResponse {
  @ApiProperty({
    example: `Not Found`,
    description: 'error name',
  })
  error: string;
  @ApiProperty({
    example: `Order with OrderId ORD-2024-001234 not found`,
    description: 'error message',
  })
  message: string;
  @ApiProperty({
    example: 404,
    description: 'status code',
  })
  code: number;
}
