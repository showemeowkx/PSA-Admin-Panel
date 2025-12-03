import { Category } from 'src/categories/enteties/category.entity';
import {
  Entity,
  Column,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  ukrskladId: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({ nullable: true })
  categoryId: number;

  @ManyToOne(() => Category, (category) => category.products, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'categoryId' })
  category: Category;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('decimal', { precision: 10, scale: 2 })
  pricePromo: number;

  @Column('decimal', { precision: 10, scale: 3, default: 0 })
  stockQty: number;

  @Column()
  unitsOfMeasurement: string;

  @Column()
  imagePath: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isPromo: boolean;

  @UpdateDateColumn()
  updatedAt: Date;
}
