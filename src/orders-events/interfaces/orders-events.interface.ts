import { Long } from 'typeorm';

export interface Timestamp {
  seconds: number | Long; // Long si usas protobufjs Long
  nanos: number;
}

export interface Customer {
  userId: string;
  email: string;
}

export interface OrderCreatedItem {
  productId: string;
  sku: string;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderCreatedPayload {
  orderId: string;
  customer: Customer;
  items: OrderCreatedItem[];
}

export enum PaymentStatus {
  PAYMENT_PENDING = 0,
  PAYMENT_COMPLETED = 1,
  PAYMENT_FAILED = 2,
}

export interface PaymentResult {
  status: PaymentStatus;
  transactionId: string;
  amount: number;
  failureReason?: string;
}

export interface PaymentProcessedPayload {
  orderId: string;
  paymentResult: PaymentResult;
}

export interface OrderSummary {
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
}

export interface OrderConfirmedPayload {
  orderId: string;
  summary: OrderSummary;
}

export enum FailureReason {
  INSUFFICIENT_INVENTORY = 0,
  PAYMENT_DECLINED = 1,
  INVALID_PRODUCT = 2,
  SYSTEM_ERROR = 3,
}

export interface OrderFailedPayload {
  orderId: string;
  reason: FailureReason;
  errorMessage: string;
}

export interface OrderEventInterface {
  eventId: string;
  orderId: string;
  eventType: number; // EventType enum si quieres
  timestamp: Timestamp;
  orderCreated?: OrderCreatedPayload;
  paymentProcessed?: PaymentProcessedPayload;
  orderConfirmed?: OrderConfirmedPayload;
  orderFailed?: OrderFailedPayload;
}
