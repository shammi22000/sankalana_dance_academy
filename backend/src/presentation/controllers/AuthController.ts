import type { NextFunction, Request, Response } from "express";
import type { AuthenticateAdminUseCase } from "../../application/use-cases/AuthenticateAdminUseCase";
import type { AuthenticateStudentUseCase } from "../../application/use-cases/AuthenticateStudentUseCase";
import type { AuthenticateTeacherUseCase } from "../../application/use-cases/AuthenticateTeacherUseCase";

export class AuthController {
  constructor(
    private readonly authenticateStudentUseCase: AuthenticateStudentUseCase,
    private readonly authenticateTeacherUseCase: AuthenticateTeacherUseCase,
    private readonly authenticateAdminUseCase: AuthenticateAdminUseCase,
  ) {}

  loginStudent = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const authentication = await this.authenticateStudentUseCase.execute(request.body);

      response.status(200).json({
        success: true,
        data: authentication,
      });
    } catch (error) {
      next(error);
    }
  };

  loginTeacher = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const authentication = await this.authenticateTeacherUseCase.execute(request.body);

      response.status(200).json({
        success: true,
        data: authentication,
      });
    } catch (error) {
      next(error);
    }
  };

  loginAdmin = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const authentication = await this.authenticateAdminUseCase.execute(request.body);

      response.status(200).json({
        success: true,
        data: authentication,
      });
    } catch (error) {
      next(error);
    }
  };
}
