import { ApiProperty } from '@nestjs/swagger';

export class OrderSummaryDto {
  @ApiProperty({ example: 'ORD-2024-001234' })
  order_id: string;

  @ApiProperty({ example: 'confirmed' })
  status: string;

  @ApiProperty({ example: 1576.77 })
  total: number;

  @ApiProperty({ example: '2024-08-04T10:25:00Z' })
  created_at: Date;
}
export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 1 })
  total: number;

  @ApiProperty({ example: false })
  has_more: boolean;
}

export class OrdersPaginatedResponseDto {
  @ApiProperty({ type: [OrderSummaryDto] })
  orders: OrderSummaryDto[];

  @ApiProperty({ type: PaginationMetaDto })
  pagination: PaginationMetaDto;
}