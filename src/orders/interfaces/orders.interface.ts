export interface OrderCreatedResponse {
  order_id: string;
  status: string;
  message: string;
  estimated_total: number;
  created_at: Date;
}
