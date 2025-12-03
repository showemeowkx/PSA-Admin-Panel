import { Cart } from 'src/cart/entities/cart.entity';
import { Store } from 'src/store/entities/store.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  password: string;

  @Column({ unique: true })
  phone: string;

  @Column({ unique: true })
  email: string;

  @OneToOne(() => Cart)
  @JoinColumn()
  cart: Cart;

  @ManyToOne(() => Store, { nullable: true })
  @JoinColumn({ name: 'selectedStoreId' })
  selectedStore: Store;

  @Column({ nullable: true })
  selectedStoreId: number;

  // PLACEHOLDER
  @Column()
  wallet: string;

  @Column({ default: false })
  isAdmin: boolean;
}
