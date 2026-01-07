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

  @Column({ unique: true, nullable: true, default: null })
  email: string;

  @OneToOne(() => Cart, (cart) => cart.user)
  cart: Cart;

  @ManyToOne(() => Store, { nullable: true })
  @JoinColumn({ name: 'selectedStoreId' })
  selectedStore: Store;

  @Column({ nullable: true })
  selectedStoreId: number;

  // PLACEHOLDER
  @Column({ default: null, nullable: true })
  wallet: string;

  @Column({ default: false })
  isAdmin: boolean;
}
