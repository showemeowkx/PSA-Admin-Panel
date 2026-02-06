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
  ConflictException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { User } from 'src/auth/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Order } from './entities/order.entity';
import { OrderStatus } from './order-status.enum';
import { AdminGuard } from 'src/auth/guards/admin.guard';

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

  @UseGuards(AdminGuard)
  @Patch(':id/:status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Param('status') status: OrderStatus,
  ): Promise<Order> {
    if (!Object.values(OrderStatus).find((s) => s === status)) {
      throw new ConflictException('Incorrect order status value');
    }

    return this.ordersService.updateStatus(id, status);
  }
}
