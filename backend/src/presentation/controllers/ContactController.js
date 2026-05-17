"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactController = void 0;
class ContactController {
    constructor(createContactInquiryUseCase) {
        this.createContactInquiryUseCase = createContactInquiryUseCase;
        this.create = async (request, response, next) => {
            try {
                const contactInquiry = await this.createContactInquiryUseCase.execute(request.body);
                response.status(201).json({
                    success: true,
                    data: contactInquiry,
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.ContactController = ContactController;
