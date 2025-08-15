export enum EventType {
  ORDER_CREATED = 0,
  PAYMENT_PROCESSED = 1,
  ORDER_CONFIRMED = 2,
  ORDER_FAILED = 3,
}

export enum PaymentStatus {
  PAYMENT_PENDING = 0,
  PAYMENT_COMPLETED = 1,
  PAYMENT_FAILED = 2,
}
