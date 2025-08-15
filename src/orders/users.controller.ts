import { LoggerProviderService } from '@/providers/logger/logger.provider.service';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { PaginationDto } from './dto/query.dto';
import { OrdersPaginatedResponseDto } from './dto/order-summary.dto';
import { ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Users') // Agrupa en Swagger
@Controller('users')
export class UserController {
  private context = UserController.name;

  constructor(
    private readonly logger: LoggerProviderService,
    private readonly orderService: OrdersService,
  ) {}

  @Get('/:user_id')
  @ApiParam({
    name: 'user_id',
    description: 'User identifier',
    example: 'user_12345',
  })
  @ApiQuery({ name: 'page', required: false, example: 1, type: Number })
  @ApiQuery({ name: 'limit', required: false, example: 10, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of user orders',
    type: OrdersPaginatedResponseDto,
  })
  async getOrdersByUser(
    @Param('user_id') userId: string,
    @Query() query: Partial<PaginationDto>,
  ): Promise<OrdersPaginatedResponseDto> {
    this.logger.log(
      this.context,
      `Fetching orders for user_id=${userId} with pagination ${JSON.stringify(query)}`,
    );

    const response = await this.orderService.findByUser(userId, query);

    this.logger.log(this.context, `Found ${response.orders.length} orders for user_id=${userId}`);

    return response;
  }
}
