import { BadRequestException, Body, Controller, Get, Param, Post } from '@nestjs/common';
import { OrdersCreateDto, OrderItemDto } from './dto/orders-create.dto';
import { LoggerProviderService } from '@/providers/logger/logger.provider.service';
import { ProductService } from '@/products/product.service';
import { Product } from '@/products/interfaces/product.interface';
import { OrdersService } from './orders.service';
import { ApiResponse } from '@nestjs/swagger';
import {
  OrderBadRequestResponse,
  OrderByOrderIdNotFoundResponse,
  OrderByOrderIdResponseDto,
  OrderNotFoundResponse,
  OrderResponseDto,
} from './dto/orders-response.dto';

@Controller('orders')
export class OrdersController {
  private context: string;
  constructor(
    private readonly logger: LoggerProviderService,
    private readonly productService: ProductService,
    private readonly ordersService: OrdersService,
  ) {
    this.context = OrdersController.name;
  }
  @Post('/')
  @ApiResponse({
    status: 200,
    description: 'Created',
    type: OrderResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
    type: OrderBadRequestResponse,
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found',
    type: OrderNotFoundResponse,
  })
  async createOrder(
    @Body() orderData: OrdersCreateDto,
  ): Promise<OrderResponseDto | OrderBadRequestResponse | OrderNotFoundResponse> {
    this.logger.log(this.context, `Creating order for customer: ${orderData.customer.user_id}`);
    try {
      const skuList: string[] = orderData.items.map((item: OrderItemDto) => item.sku);
      const products: Product[] = await this.productService.findBySkus(skuList);
      const reservedProducts: { id: string; quantity: number }[] = [];

      const newOrderItems = [];

      for (const item of orderData.items) {
        const product = products.find((p) => p.sku === item.sku) as Product;
        item.price = Number(product?.price);
        item.product_id = product?.id;
        item.name = product?.name;
        const availableQuantity: number = Number(product?.inventory?.available_quantity);
        if (item.quantity > availableQuantity) {
          throw new BadRequestException({
            error: 'insufficient_inventory',
            message: `Not enough inventory for ${item.sku}. Available: ${availableQuantity}, Requested: ${item.quantity}`,
            code: 400,
          });
        }
        reservedProducts.push({
          id: String(product?.id),
          quantity: item.quantity,
        });
        newOrderItems.push(item);
      }

      return this.ordersService.createOrder({
        ...orderData,
        items: newOrderItems,
      });
    } catch (error) {
      throw error;
    }
  }
  @Get('/:order_id')
  @ApiResponse({
    status: 200,
    description: 'OK',
    type: OrderByOrderIdResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Not Found',
    type: OrderByOrderIdNotFoundResponse,
  })
  async getOrderByOrderId(
    @Param('order_id') orderId: string,
  ): Promise<OrderByOrderIdResponseDto | OrderByOrderIdNotFoundResponse> {
    this.logger.log(this.context, `Getting order information by orderId: ${orderId} `);
    return (await this.ordersService.findOrder(orderId)) as unknown as OrderByOrderIdResponseDto;
  }
}
