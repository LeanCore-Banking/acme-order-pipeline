import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsUUID,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsNumber,
  IsOptional,
  IsPositive,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CustomerDto {
  @ApiProperty({
    example: 'user_12345',
    description: 'ID único del usuario',
  })
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({
    example: 'customer@example.com',
    description: 'Email del cliente',
  })
  @IsEmail()
  email: string;
}

export class OrderItemDto {
  @ApiProperty({ example: 'LAPTOP001', description: 'SKU del producto' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ example: 1, description: 'Cantidad solicitada del producto' })
  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUUID()
  product_id?: string;
}

export class OrderPricingDto {
  @IsNumber()
  @IsPositive()
  subtotal: number;

  @IsNumber()
  @IsPositive()
  tax: number;

  @IsNumber()
  @IsPositive()
  total: number;
}

export class OrderPaymentDto {
  @IsString()
  status: string;

  @IsString()
  transaction_id: string;

  @IsDateString()
  processed_at: Date;
}

export class OrdersCreateDto {
  @IsOptional()
  @IsString()
  order_id?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({
    type: CustomerDto,
    description: 'Información del cliente',
  })
  @ValidateNested()
  @Type(() => CustomerDto)
  customer: CustomerDto;

  @ApiProperty({
    type: [OrderItemDto],
    description: 'Lista de productos en la orden',
    minItems: 1,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => OrderPricingDto)
  pricing?: OrderPricingDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => OrderPaymentDto)
  payment?: OrderPaymentDto;
}
