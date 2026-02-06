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
  Logger,
} from '@nestjs/common';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { Cart } from './entities/cart.entity';
import { User } from 'src/auth/entities/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CartService } from './cart.service';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
  private logger = new Logger(CartController.name);
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@Req() req: { user: User }): Promise<Cart> {
    this.logger.verbose(`Getting cart items... {userId: ${req.user.id}}`);
    return this.cartService.getCartByUserId(req.user.id);
  }

  @Post()
  addItem(
    @Req() req: { user: User },
    @Body() addToCartDto: AddToCartDto,
  ): Promise<void> {
    this.logger.verbose(
      `Adding item to cart... {userId: ${req.user.id}, product: ${addToCartDto.productId}. quantity: ${addToCartDto.quantity}}`,
    );
    return this.cartService.addToCart(req.user, addToCartDto);
  }

  @Delete()
  clearCart(@Req() req: { user: User }): Promise<void> {
    this.logger.verbose(`Clearing a cart... {userId: ${req.user.id}}`);
    return this.cartService.clearCart(req.user.id);
  }

  @Delete(':productId')
  removeItem(
    @Req() req: { user: User },
    @Param('productId', ParseIntPipe) productId: number,
    @Query('removeAll') removeAll: 0 | 1,
  ): Promise<void> {
    const removeAllStatus = Boolean(removeAll);
    this.logger.verbose(
      `Removing item from cart... {userId: ${req.user.id}, productId: ${productId}, removeAll: ${removeAllStatus}}`,
    );
    return this.cartService.removeFromCart(req.user.id, productId, removeAll);
  }
}
