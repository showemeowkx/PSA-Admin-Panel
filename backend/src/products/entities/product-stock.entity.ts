import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Product } from './product.entity';
import { Store } from 'src/store/entities/store.entity';
import { Expose } from 'class-transformer';

export class ColumnNumericTransformer {
  to(data: number | null): number | null {
    return data;
  }
  from(data: string | null): number | null {
    return data ? parseFloat(data) : null;
  }
}

@Entity()
@Unique(['product', 'storeId'])
export class ProductStock {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Product, (product) => product.stocks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column()
  productId: number;

  @ManyToOne(() => Store, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'storeId' })
  store: Store;

  @Column()
  storeId: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  quantity: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    default: 0,
    transformer: new ColumnNumericTransformer(),
  })
  reserved: number;

  @Expose()
  get available(): number {
    const qty = Number(this.quantity) || 0;
    const res = Number(this.reserved) || 0;

    const diff = Math.round((qty - res) * 100) / 100;

    return Math.max(0, diff);
  }
}
