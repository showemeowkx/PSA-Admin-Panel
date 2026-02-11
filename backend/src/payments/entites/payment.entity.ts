import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from 'src/orders/entities/order.entity';

export enum PaymentStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'LIQPAY_TOKEN' })
  provider: string;

  @Column()
  transactionId: string;

  @Column({ type: 'enum', enum: PaymentStatus })
  status: PaymentStatus;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @OneToOne(() => Order, (order) => order.payment)
  order: Order;

  @CreateDateColumn()
  createdAt: Date;
}
