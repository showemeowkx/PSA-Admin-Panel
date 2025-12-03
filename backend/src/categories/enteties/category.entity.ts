import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  ukrskladId: number;

  @Column()
  name: string;

  @Column()
  iconPath: string;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
