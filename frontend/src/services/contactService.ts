import type { ApiResponse, ContactInquiry, ContactPayload } from "../types/contact";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";

export async function submitContactInquiry(payload: ContactPayload): Promise<ContactInquiry> {
  const response = await fetch(`${API_BASE_URL}/contact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = (await response.json().catch(() => null)) as ApiResponse<ContactInquiry> | null;

  if (!response.ok || !result?.success || !result.data) {
    throw new Error(result?.error?.message ?? "Unable to submit your inquiry right now.");
  }

  return result.data;
}

