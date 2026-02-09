import { Order } from 'src/orders/entities/order.entity';
import {
  Column,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Store {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  ukrskladId: number;

  @Column({ unique: true })
  address: string;

  @Column({ nullable: true })
  lastSyncedAddress: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Order, (order) => order.store)
  orders: Order[];

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
