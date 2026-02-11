import { User } from 'src/auth/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Payment } from './payment.entity';

@Entity()
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  userId: number;

  @OneToOne(() => User, (user) => user.wallet, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @Column({ unique: true })
  bankToken: string;

  @Column()
  maskedCard: string;

  @Column()
  cardHolderFirstName: string;

  @Column()
  cardHolderLastName: string;

  @OneToMany(() => Payment, (payment) => payment.wallet)
  payments: Payment[];
}
