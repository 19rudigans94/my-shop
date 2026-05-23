import { handleCreatePayLink } from "@/features/payment/api/create-paylink";

export const dynamic = 'force-dynamic';

export async function POST(request) {
  return handleCreatePayLink(request);
}
