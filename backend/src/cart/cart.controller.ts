import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { AuthGuard } from '@nestjs/passport';
import { Cart } from './entities/cart.entity';
import { User } from 'src/auth/entities/user.entity';

@Controller('cart')
@UseGuards(AuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Req() req: { user: User }): Promise<Cart> {
    return this.cartService.getCartByUserId(req.user.id);
  }

  @Post()
  addItem(@Req() req: { user: User }, @Body() addToCartDto: AddToCartDto) {
    return this.cartService.addToCart(req.user.id, addToCartDto);
  }
}
