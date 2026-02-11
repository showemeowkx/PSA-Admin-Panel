import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet } from './entites/wallet.entity';
import { Payment } from './entites/payment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, Payment])],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
