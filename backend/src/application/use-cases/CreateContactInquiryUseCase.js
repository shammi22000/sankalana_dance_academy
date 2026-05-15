"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateContactInquiryUseCase = void 0;
const ApplicationError_1 = require("../errors/ApplicationError");
const ContactInquiry_1 = require("../../domain/entities/ContactInquiry");
class CreateContactInquiryUseCase {
    constructor(contactInquiryRepository) {
        this.contactInquiryRepository = contactInquiryRepository;
    }
    async execute(dto) {
        const normalized = {
            name: dto.name?.trim() ?? "",
            email: dto.email?.trim().toLowerCase() ?? "",
            message: dto.message?.trim() ?? "",
            source: dto.source?.trim() || undefined,
        };
        const errors = this.validate(normalized);
        if (Object.keys(errors).length > 0) {
            throw new ApplicationError_1.ValidationError(errors);
        }
        const contactInquiry = ContactInquiry_1.ContactInquiry.create(normalized);
        const savedInquiry = await this.contactInquiryRepository.save(contactInquiry);
        return savedInquiry.toJSON();
    }
    validate(dto) {
        const errors = {};
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
exports.CreateContactInquiryUseCase = CreateContactInquiryUseCase;
