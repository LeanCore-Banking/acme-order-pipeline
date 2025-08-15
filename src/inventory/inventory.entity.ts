import { Product } from '@/products/product.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  BaseEntity,
} from 'typeorm';

@Entity({ name: 'inventory' })
export class Inventory extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', unique: true })
  product_id!: string;

  @ManyToOne(() => Product, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'product_id' })
  product!: Product;

  @Column({ type: 'integer', name: 'available_quantity' })
  available_quantity!: number;

  @Column({ type: 'integer', name: 'reserved_quantity', default: 0 })
  reserved_quantity!: number;

  @CreateDateColumn({ type: 'timestamp', name: 'last_updated' })
  last_updated!: Date;
}
