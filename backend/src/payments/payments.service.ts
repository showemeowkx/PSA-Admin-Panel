import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { User } from 'src/auth/entities/user.entity';
import { Wallet } from './entites/wallet.entity';
import { Payment, PaymentStatus } from './entites/payment.entity';

@Injectable()
export class PaymentsService {
  private logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async addWallet(user: User, createWalletDto: CreateWalletDto): Promise<void> {
    // MOCK
    const bankResponse = {
      status: 'success',
      token: `tok_pb_${Math.random().toString(36).substr(2, 9)}`,
      last4: createWalletDto.cardNumber.slice(-4),
    };

    const wallet = this.walletRepository.create({
      user,
      bankToken: bankResponse.token,
      cardHolderFirstName: createWalletDto.cardHolderFirstName.toUpperCase(),
      cardHolderLastName: createWalletDto.cardHolderLastName.toUpperCase(),
      maskedCard: `**** **** **** ${bankResponse.last4}`,
    });

    await this.walletRepository.save(wallet);
  }

  async getWallet(userId: number): Promise<Wallet | null> {
    return await this.walletRepository.findOne({ where: { userId } });
  }

  async removeWallet(userId: number): Promise<void> {
    const wallet = await this.getWallet(userId);

    if (wallet) {
      await this.walletRepository.delete(wallet);
    }
  }

  async chargeWallet(user: User, amount: number): Promise<Payment> {
    const wallet = await this.getWallet(user.id);
    if (!wallet) {
      this.logger.error(`No wallet attached {userId: ${user.id}}`);
      throw new BadRequestException(
        'Відсутній спосіб оплати. Будь ласка, додайте платіжну картку.',
      );
    }

    this.logger.debug(
      `Attempting to charge Wallet ${wallet.id} for ${amount} UAH`,
    );

    // MOCK
    const isSuccess = true;
    const transactionId = `liqpay_${Math.floor(Math.random() * 1000000)}`;

    if (!isSuccess) {
      this.logger.error(`Payment declined {userId: ${user.id}}`);
      throw new BadRequestException(
        "Оплата відмовлена. Спробуйте іншу картку або зв'яжіться з банком.",
      );
    }

    const payment = this.paymentRepository.create({
      provider: 'LIQPAY_TOKEN',
      transactionId: transactionId,
      status: PaymentStatus.SUCCESS,
      amount: amount,
      wallet: wallet,
    });

    return payment;
  }
}
