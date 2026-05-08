import type { NextFunction, Request, Response } from "express";
import type { CreateTeacherRegistrationUseCase } from "../../application/use-cases/CreateTeacherRegistrationUseCase";

export class TeacherRegistrationController {
  constructor(private readonly createTeacherRegistrationUseCase: CreateTeacherRegistrationUseCase) {}

  create = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const teacherRegistration = await this.createTeacherRegistrationUseCase.execute(request.body);

      response.status(201).json({
        success: true,
        data: teacherRegistration,
      });
    } catch (error) {
      next(error);
    }
  };
}
