export interface CreateContactInquiryDTO {
  name: string;
  email: string;
  message: string;
  source?: string;
}

export interface ContactInquiryResponseDTO {
  id: string;
  name: string;
  email: string;
  message: string;
  source?: string;
  createdAt: string;
}

