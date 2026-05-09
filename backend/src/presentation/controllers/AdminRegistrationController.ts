import type { NextFunction, Request, Response } from "express";
import type { ManageRegistrationApprovalsUseCase } from "../../application/use-cases/ManageRegistrationApprovalsUseCase";

export class AdminRegistrationController {
  constructor(private readonly manageRegistrationApprovalsUseCase: ManageRegistrationApprovalsUseCase) {}

  listPendingRegistrations = async (_request: Request, response: Response, next: NextFunction) => {
    try {
      const registrations = await this.manageRegistrationApprovalsUseCase.listPending();

      response.status(200).json({
        success: true,
        data: registrations,
      });
    } catch (error) {
      next(error);
    }
  };

  updateStudentApprovalStatus = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const student = await this.manageRegistrationApprovalsUseCase.updateStudentStatus(
        request.params.id,
        request.body.status,
      );

      response.status(200).json({
        success: true,
        data: student,
      });
    } catch (error) {
      next(error);
    }
  };

  updateTeacherApplicationStatus = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const teacher = await this.manageRegistrationApprovalsUseCase.updateTeacherStatus(
        request.params.id,
        request.body.status,
      );

      response.status(200).json({
        success: true,
        data: teacher,
      });
    } catch (error) {
      next(error);
    }
  };
}
