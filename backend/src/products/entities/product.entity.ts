import { Category } from 'src/categories/enteties/category.entity';
import {
  Entity,
  Column,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  DeleteDateColumn,
} from 'typeorm';
import { ProductStock } from './product-stock.entity';

export class ColumnNumericTransformer {
  to(data: number | null): number | null {
    return data;
  }
  from(data: string | null): number | null {
    return data ? parseFloat(data) : null;
  }
}

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  ukrskladId: number;

  @Column()
  code: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  lastSyncedName: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  categoryId: number;

  @ManyToOne(() => Category, (category) => category.products, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @OneToMany(() => ProductStock, (stock) => stock.product, { cascade: true })
  stocks: ProductStock[];

  @Column('decimal', {
    precision: 10,
    scale: 2,
    transformer: new ColumnNumericTransformer(),
  })
  price: number;

  @Column('decimal', {
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: new ColumnNumericTransformer(),
  })
  pricePromo: number;

  @Column()
  unitsOfMeasurments: string;

  @Column()
  imagePath: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isPromo: boolean;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
