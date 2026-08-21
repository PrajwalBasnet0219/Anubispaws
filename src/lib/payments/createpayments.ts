type PaymentMethod = "khalti";

interface NormalizePaymentPayloadInput {
  amount: number;
  orderId: number;
  itemName: string;
  method: PaymentMethod;
  itemType: "pet" | "product" | "mixed";
}

export function normalizePaymentPayload(input: NormalizePaymentPayloadInput) {
  const { amount, orderId, itemName, method, itemType } = input;

  return {
    amount: Number(amount), // 🔴 FIXES string → number error
    orderId,
    itemName,
    paymentMethod: method,
    itemType,
  };
}
