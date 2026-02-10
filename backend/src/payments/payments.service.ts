import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { User } from 'src/auth/entities/user.entity';
import { Wallet } from './entites/wallet.entity';

@Injectable()
export class PaymentsService {
  private logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
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
}
