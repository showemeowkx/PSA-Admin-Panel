import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Product } from '../../products/entities/product.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  ukrskladId: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  lastSyncedName: string;

  @Column()
  iconPath: string;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];

  @Column()
  isActive: boolean;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
