import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { User } from 'src/auth/entities/user.entity';
import { Wallet } from './entites/wallet.entity';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  private logger = new Logger(PaymentsController.name);
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/wallet')
  createWallet(
    @Req() req: { user: User },
    @Body() createWalletDto: CreateWalletDto,
  ): Promise<void> {
    this.logger.verbose(`Creating a wallet... {userId: ${req.user.id}}`);
    return this.paymentsService.createWallet(req.user.id, createWalletDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/wallet')
  getWallet(@Req() req: { user: User }): Promise<Wallet | null> {
    this.logger.verbose(`Getting a wallet... {userId: ${req.user.id}}`);
    return this.paymentsService.getWallet(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/wallet')
  removeWallet(@Req() req: { user: User }): Promise<void> {
    this.logger.verbose(`Deleting a wallet... {userId: ${req.user.id}}`);
    return this.paymentsService.removeWallet(req.user.id);
  }
}
