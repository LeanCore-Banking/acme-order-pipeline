import { Inventory } from '@/inventory/interfaces/inventory.interface';

export interface Product {
  id: string;
  name: string;
  price: number;
  sku: string;
  created_at?: Date;
  updated_at?: Date;
  inventory?: Inventory;
}
export interface QueryParams {
  sku?: string;
  name?: string;
}
