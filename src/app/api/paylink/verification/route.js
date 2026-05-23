import { handlePaymentVerification } from "@/features/payment/api/verify-payment";

export async function GET(request) {
  return handlePaymentVerification(request);
}
