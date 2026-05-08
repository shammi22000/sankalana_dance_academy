export interface ContactFormValues {
  name: string;
  email: string;
  message: string;
}

export interface ContactPayload extends ContactFormValues {
  source?: string;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  message: string;
  source?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: unknown;
  };
}

export type SubmissionState = "idle" | "submitting" | "success" | "error";

