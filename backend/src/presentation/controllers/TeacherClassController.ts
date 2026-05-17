import type { NextFunction, Request, Response } from "express";
import type { ManageTeacherClassesUseCase } from "../../application/use-cases/ManageTeacherClassesUseCase";

export interface TeacherAuthenticatedRequest extends Request {
  teacherId?: string;
}

export class TeacherClassController {
  constructor(private readonly manageTeacherClassesUseCase: ManageTeacherClassesUseCase) {}

  listAll = async (_request: Request, response: Response, next: NextFunction) => {
    try {
      const teacherClasses = await this.manageTeacherClassesUseCase.listAll();

      response.json({
        success: true,
        data: teacherClasses,
      });
    } catch (error) {
      next(error);
    }
  };

  listMine = async (request: TeacherAuthenticatedRequest, response: Response, next: NextFunction) => {
    try {
      const teacherClasses = await this.manageTeacherClassesUseCase.listForTeacher(this.getTeacherId(request));

      response.json({
        success: true,
        data: teacherClasses,
      });
    } catch (error) {
      next(error);
    }
  };

  create = async (request: TeacherAuthenticatedRequest, response: Response, next: NextFunction) => {
    try {
      const teacherClass = await this.manageTeacherClassesUseCase.create(this.getTeacherId(request), request.body);

      response.status(201).json({
        success: true,
        data: teacherClass,
      });
    } catch (error) {
      next(error);
    }
  };

  update = async (request: TeacherAuthenticatedRequest, response: Response, next: NextFunction) => {
    try {
      const teacherClass = await this.manageTeacherClassesUseCase.update(
        this.getTeacherId(request),
        request.params.id,
        request.body,
      );

      response.json({
        success: true,
        data: teacherClass,
      });
    } catch (error) {
      next(error);
    }
  };

  delete = async (request: TeacherAuthenticatedRequest, response: Response, next: NextFunction) => {
    try {
      await this.manageTeacherClassesUseCase.delete(this.getTeacherId(request), request.params.id);

      response.json({
        success: true,
        data: {
          id: request.params.id,
        },
      });
    } catch (error) {
      next(error);
    }
  };

  private getTeacherId(request: TeacherAuthenticatedRequest): string {
    return request.teacherId ?? "";
  }
}
