import type { NextFunction, Request, Response } from "express";
import type { ManageEnrolmentApplicationsUseCase } from "../../application/use-cases/ManageEnrolmentApplicationsUseCase";

export interface StudentAuthenticatedRequest extends Request {
  studentId?: string;
}

export interface TeacherAuthenticatedRequest extends Request {
  teacherId?: string;
}

export class EnrolmentApplicationController {
  constructor(private readonly manageEnrolmentApplicationsUseCase: ManageEnrolmentApplicationsUseCase) {}

  listForStudent = async (request: StudentAuthenticatedRequest, response: Response, next: NextFunction) => {
    try {
      const applications = await this.manageEnrolmentApplicationsUseCase.listForStudent(this.getStudentId(request));

      response.json({
        success: true,
        data: applications,
      });
    } catch (error) {
      next(error);
    }
  };

  createForStudent = async (request: StudentAuthenticatedRequest, response: Response, next: NextFunction) => {
    try {
      const application = await this.manageEnrolmentApplicationsUseCase.create(this.getStudentId(request), {
        data: request.body?.data ?? request.body,
      });

      response.status(201).json({
        success: true,
        data: application,
      });
    } catch (error) {
      next(error);
    }
  };

  listForTeacher = async (request: TeacherAuthenticatedRequest, response: Response, next: NextFunction) => {
    try {
      const applications = await this.manageEnrolmentApplicationsUseCase.listForTeacher(this.getTeacherId(request));

      response.json({
        success: true,
        data: applications,
      });
    } catch (error) {
      next(error);
    }
  };

  updateTeacherDecision = async (request: TeacherAuthenticatedRequest, response: Response, next: NextFunction) => {
    try {
      const application = await this.manageEnrolmentApplicationsUseCase.updateTeacherDecision(
        this.getTeacherId(request),
        request.params.applicationId,
        request.body,
      );

      response.json({
        success: true,
        data: application,
      });
    } catch (error) {
      next(error);
    }
  };

  private getStudentId(request: StudentAuthenticatedRequest): string {
    return request.studentId ?? "";
  }

  private getTeacherId(request: TeacherAuthenticatedRequest): string {
    return request.teacherId ?? "";
  }
}
