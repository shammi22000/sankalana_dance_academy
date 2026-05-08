import type {
  ContactInquiryResponseDTO,
  CreateContactInquiryDTO,
} from "../dto/CreateContactInquiryDTO";
import { ValidationError } from "../errors/ApplicationError";
import { ContactInquiry } from "../../domain/entities/ContactInquiry";
import type { ContactInquiryRepository } from "../../domain/repositories/ContactInquiryRepository";

export class CreateContactInquiryUseCase {
  constructor(private readonly contactInquiryRepository: ContactInquiryRepository) {}

  async execute(dto: CreateContactInquiryDTO): Promise<ContactInquiryResponseDTO> {
    const normalized = {
      name: dto.name?.trim() ?? "",
      email: dto.email?.trim().toLowerCase() ?? "",
      message: dto.message?.trim() ?? "",
      source: dto.source?.trim() || undefined,
    };

    const errors = this.validate(normalized);
    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors);
    }

    const contactInquiry = ContactInquiry.create(normalized);
    const savedInquiry = await this.contactInquiryRepository.save(contactInquiry);

    return savedInquiry.toJSON();
  }

  private validate(dto: CreateContactInquiryDTO): Record<string, string> {
    const errors: Record<string, string> = {};

    if (!dto.name || dto.name.length < 2) {
      errors.name = "Name must be at least 2 characters.";
    }

    if (!dto.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dto.email)) {
      errors.email = "A valid email address is required.";
    }

    if (!dto.message || dto.message.length < 10) {
      errors.message = "Message must be at least 10 characters.";
    }

    return errors;
  }
}

