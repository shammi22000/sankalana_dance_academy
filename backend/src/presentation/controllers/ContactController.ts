import type { NextFunction, Request, Response } from "express";
import type { CreateContactInquiryUseCase } from "../../application/use-cases/CreateContactInquiryUseCase";

export class ContactController {
  constructor(private readonly createContactInquiryUseCase: CreateContactInquiryUseCase) {}

  create = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const contactInquiry = await this.createContactInquiryUseCase.execute(request.body);

      response.status(201).json({
        success: true,
        data: contactInquiry,
      });
    } catch (error) {
      next(error);
    }
  };
}

