import { Entity, ObjectIdColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ObjectId } from 'mongodb';
export class Customer {
  @Column()
  user_id: string;

  @Column()
  email: string;
}

export class OrderItem {
  @Column()
  product_id: string;

  @Column()
  sku: string;

  @Column()
  name: string;

  @Column()
  price: number;

  @Column()
  quantity: number;
}

export class Pricing {
  @Column()
  subtotal: number;

  @Column()
  tax: number;

  @Column()
  total: number;
}

export class Payment {
  @Column()
  status: string;

  @Column({ nullable: true })
  transaction_id?: string;

  @Column({ nullable: true })
  processed_at?: Date;
}

@Entity('orders')
export class Order {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  order_id: string;

  @Column()
  customer: Customer;

  @Column()
  items: OrderItem[];

  @Column()
  pricing: Pricing;

  @Column()
  payment: Payment;

  @Column()
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
