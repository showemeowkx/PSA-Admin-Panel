import { User } from 'src/auth/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderItem } from './order-item.entity';
import { OrderStatus } from '../order-status.enum';
import { Store } from 'src/store/entities/store.entity';

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

  @Column('enum', { enum: OrderStatus })
  status: OrderStatus;

  @CreateDateColumn()
  createdAt: Date;
}
