import {
  Controller,
  Get,
  Post,
  Param,
  Req,
  UseGuards,
  Query,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { User } from 'src/auth/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Order } from './entities/order.entity';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Req() req: { user: User }): Promise<void> {
    return this.ordersService.create(req.user);
  }

  @Get()
  findAll(
    @Req() req: { user: User },
    @Query() paginationOptions: { page: number; limit: number },
  ): Promise<{
    data: Order[];
    metadata: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    return this.ordersService.findAll(req.user.id, paginationOptions);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Order> {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/pay')
  payOrder(@Param('id', ParseIntPipe) orderId: number): Promise<void> {
    return this.ordersService.payOrder(orderId);
  }
}
