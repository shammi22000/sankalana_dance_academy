import type { NextFunction, Request, Response } from "express";
import type { CreateTeacherRegistrationUseCase } from "../../application/use-cases/CreateTeacherRegistrationUseCase";
import type { ManageRegistrationApprovalsUseCase } from "../../application/use-cases/ManageRegistrationApprovalsUseCase";

export class AdminRegistrationController {
  constructor(
    private readonly manageRegistrationApprovalsUseCase: ManageRegistrationApprovalsUseCase,
    private readonly createTeacherRegistrationUseCase: CreateTeacherRegistrationUseCase,
  ) {}

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

  listTeacherRegistrations = async (_request: Request, response: Response, next: NextFunction) => {
    try {
      const teachers = await this.manageRegistrationApprovalsUseCase.listTeachers();

      response.status(200).json({
        success: true,
        data: teachers,
      });
    } catch (error) {
      next(error);
    }
  };

  listStudentRegistrations = async (_request: Request, response: Response, next: NextFunction) => {
    try {
      const students = await this.manageRegistrationApprovalsUseCase.listStudents();

      response.status(200).json({
        success: true,
        data: students,
      });
    } catch (error) {
      next(error);
    }
  };

  createTeacherRegistration = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const teacherRegistration = await this.createTeacherRegistrationUseCase.execute(request.body);
      const approvedTeacher = await this.manageRegistrationApprovalsUseCase.updateTeacherStatus(
        teacherRegistration.id,
        "approved",
      );

      response.status(201).json({
        success: true,
        data: approvedTeacher,
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

  updateStudentProfile = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const student = await this.manageRegistrationApprovalsUseCase.updateStudentProfile(
        request.params.id,
        request.body,
      );

      response.status(200).json({
        success: true,
        data: student,
      });
    } catch (error) {
      next(error);
    }
  };

  updateStudentPassword = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const student = await this.manageRegistrationApprovalsUseCase.updateStudentPassword(
        request.params.id,
        request.body,
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

  updateTeacherPassword = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const teacher = await this.manageRegistrationApprovalsUseCase.updateTeacherPassword(
        request.params.id,
        request.body,
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
