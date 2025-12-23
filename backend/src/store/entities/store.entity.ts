import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Store {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  ukrskladId: number;

  @Column({ unique: true })
  address: string;

  @Column({ default: true })
  isActive: boolean;
}
