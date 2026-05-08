import type { NextFunction, Request, Response } from "express";
import type { CreateStudentRegistrationUseCase } from "../../application/use-cases/CreateStudentRegistrationUseCase";

export class StudentRegistrationController {
  constructor(private readonly createStudentRegistrationUseCase: CreateStudentRegistrationUseCase) {}

  create = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const studentRegistration = await this.createStudentRegistrationUseCase.execute(request.body);

      response.status(201).json({
        success: true,
        data: studentRegistration,
      });
    } catch (error) {
      next(error);
    }
  };
}

