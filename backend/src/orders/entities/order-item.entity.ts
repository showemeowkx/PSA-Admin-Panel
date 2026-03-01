import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Order } from './order.entity';
import { Product } from 'src/products/entities/product.entity';

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order: Order;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  product: Product;

  @Column()
  productImagePath: string;

  @Column()
  productName: string;

  @Column()
  productCode: string;

  @Column({ nullable: true })
  categoryName: string;

  @Column()
  productUnitsOfMeasurments: string;

  @Column('decimal')
  priceAtPurchase: number;

  @Column('decimal')
  quantity: number;
}
