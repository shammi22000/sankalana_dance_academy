import type { NextFunction, Request, Response } from "express";
import type { ManageAttendanceRecordsUseCase } from "../../application/use-cases/ManageAttendanceRecordsUseCase";

export interface AttendanceTeacherAuthenticatedRequest extends Request {
  teacherId?: string;
}

export class AttendanceRecordController {
  constructor(private readonly manageAttendanceRecordsUseCase: ManageAttendanceRecordsUseCase) {}

  listForTeacher = async (
    request: AttendanceTeacherAuthenticatedRequest,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      const records = await this.manageAttendanceRecordsUseCase.listForTeacher(this.getTeacherId(request));

      response.json({
        success: true,
        data: records,
      });
    } catch (error) {
      next(error);
    }
  };

  saveSession = async (
    request: AttendanceTeacherAuthenticatedRequest,
    response: Response,
    next: NextFunction,
  ) => {
    try {
      const records = await this.manageAttendanceRecordsUseCase.saveSession(this.getTeacherId(request), request.body);

      response.json({
        success: true,
        data: records,
      });
    } catch (error) {
      next(error);
    }
  };

  private getTeacherId(request: AttendanceTeacherAuthenticatedRequest): string {
    return request.teacherId ?? "";
  }
}
