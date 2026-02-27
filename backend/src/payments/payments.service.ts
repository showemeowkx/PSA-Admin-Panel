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

  async createWallet(userId: number, createWalletDto: CreateWalletDto) {
    let wallet = await this.walletRepository.findOne({
      where: { userId },
    });

    if (!wallet) {
      wallet = this.walletRepository.create({ userId });
    }

    wallet.bankToken = createWalletDto.bankToken;
    wallet.maskedCard = createWalletDto.maskedCard;
    wallet.cardHolderFirstName = createWalletDto.cardHolderFirstName || null;
    wallet.cardHolderLastName = createWalletDto.cardHolderLastName || null;

    await this.walletRepository.save(wallet);
  }

  async getWallet(userId: number): Promise<Wallet | null> {
    return await this.walletRepository.findOne({ where: { userId } });
  }

  async removeWallet(userId: number): Promise<void> {
    const wallet = await this.getWallet(userId);

    if (wallet) {
      await this.walletRepository.delete(wallet.id);
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
