export interface Inventory {
  id: string;
  product_id: string;
  available_quantity: number;
  reserved_quantity: number;
  last_updated: Date;
}
