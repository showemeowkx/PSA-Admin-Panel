import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Delete,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { Cart } from './entities/cart.entity';
import { User } from 'src/auth/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CartService } from './cart.service';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Req() req: { user: User }): Promise<Cart> {
    return this.cartService.getCartByUserId(req.user.id);
  }

  @Post()
  addItem(
    @Req() req: { user: User },
    @Body() addToCartDto: AddToCartDto,
  ): Promise<void> {
    return this.cartService.addToCart(req.user, addToCartDto);
  }

  @Delete()
  clearCart(@Req() req: { user: User }): Promise<void> {
    return this.cartService.clearCart(req.user.id);
  }

  @Delete(':productId')
  removeItem(
    @Req() req: { user: User },
    @Param('productId', ParseIntPipe) productId: number,
    @Query('removeAll') removeAll: 0 | 1,
  ): Promise<void> {
    return this.cartService.removeFromCart(req.user.id, productId, removeAll);
  }
}
