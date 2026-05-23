import { handlePaymentVerification } from "@/features/payment/api/verify-payment";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  return handlePaymentVerification(request);
}
