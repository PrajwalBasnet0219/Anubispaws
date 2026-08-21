// lib/types.ts

export enum PaymentMethod {
  KHALTI = "KHALTI",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export interface PaymentRequestData {
  orderId: number;
  amount: string;
  method: PaymentMethod;
  userEmail?: string;
  userName?: string;
  userPhone?: string;
}

export interface KhaltiConfig {
  return_url: string;
  website_url: string;
  amount: number;
  purchase_order_id: string;
  purchase_order_name: string;
  customer_info?: {
    name: string;
    email: string;
    phone: string;
  };
}