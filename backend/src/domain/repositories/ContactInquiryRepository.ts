import { ContactInquiry } from "../entities/ContactInquiry";

export interface ContactInquiryRepository {
  save(contactInquiry: ContactInquiry): Promise<ContactInquiry>;
}
