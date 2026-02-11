import { User } from 'src/auth/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderItem } from './order-item.entity';
import { Store } from 'src/store/entities/store.entity';
import { Payment } from 'src/payments/entites/payment.entity';

export enum OrderStatus {
  CANCELLED = 'CANCELLED',
  IN_PROCESS = 'IN PROCESS',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: true })
  orderNumber: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @Column({ nullable: true })
  storeId: number;

  @ManyToOne(() => Store, (store) => store.orders, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'storeId' })
  store: Store;

  @Column({ nullable: true })
  paymentId: string;

  @OneToOne(() => Payment, (payment) => payment.order, { cascade: true })
  @JoinColumn({ name: 'paymentId' })
  payment: Payment;

  @Column('enum', { enum: OrderStatus })
  status: OrderStatus;

  @CreateDateColumn()
  createdAt: Date;
}
