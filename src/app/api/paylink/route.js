import { handleCreatePayLink } from "@/features/payment/api/create-paylink";

export async function POST(request) {
  return handleCreatePayLink(request);
}
