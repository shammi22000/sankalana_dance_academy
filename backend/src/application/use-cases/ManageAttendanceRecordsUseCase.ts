import type { AttendanceRecordResponseDTO, SaveAttendanceSessionDTO } from "../dto/AttendanceRecordDTO";
import { ValidationError } from "../errors/ApplicationError";
import { AttendanceRecord, type AttendanceStatus } from "../../domain/entities/AttendanceRecord";
import type { AttendanceRecordRepository } from "../../domain/repositories/AttendanceRecordRepository";

const attendanceStatuses: AttendanceStatus[] = ["present", "absent", "late"];

export class ManageAttendanceRecordsUseCase {
  constructor(private readonly attendanceRecordRepository: AttendanceRecordRepository) {}

  async listForTeacher(teacherId: string): Promise<AttendanceRecordResponseDTO[]> {
    const records = await this.attendanceRecordRepository.findByTeacherId(teacherId);

    return records.map((record) => record.toJSON());
  }

  async saveSession(teacherId: string, dto: SaveAttendanceSessionDTO): Promise<AttendanceRecordResponseDTO[]> {
    const normalized = {
      classId: dto.classId?.trim() ?? "",
      className: dto.className?.trim() ?? "",
      date: dto.date?.trim() ?? "",
      records: Array.isArray(dto.records) ? dto.records : [],
    };
    const errors = this.validate(normalized);

    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors);
    }

    const records = normalized.records.map((record) =>
      AttendanceRecord.create({
        teacherId,
        classId: normalized.classId,
        className: normalized.className,
        date: normalized.date,
        studentId: record.studentId?.trim() ?? "",
        studentName: record.studentName?.trim() ?? "",
        status: record.status as AttendanceStatus,
        remarks: record.remarks?.trim() ?? "",
      }),
    );
    const savedRecords = await this.attendanceRecordRepository.replaceSession(
      teacherId,
      normalized.classId,
      normalized.date,
      records,
    );

    return savedRecords.map((record) => record.toJSON());
  }

  private validate(dto: Required<SaveAttendanceSessionDTO>): Record<string, string> {
    const errors: Record<string, string> = {};

    if (!dto.classId) {
      errors.classId = "Class is required.";
    }

    if (!dto.className) {
      errors.className = "Class name is required.";
    }

    if (!dto.date || !/^\d{4}-\d{2}-\d{2}$/.test(dto.date)) {
      errors.date = "A valid attendance date is required.";
    }

    if (!Array.isArray(dto.records) || dto.records.length === 0) {
      errors.records = "At least one attendance record is required.";
    } else {
      dto.records.forEach((record, index) => {
        if (!record.studentId?.trim()) {
          errors[`records.${index}.studentId`] = "Student ID is required.";
        }

        if (!record.studentName?.trim()) {
          errors[`records.${index}.studentName`] = "Student name is required.";
        }

        if (!record.status || !attendanceStatuses.includes(record.status)) {
          errors[`records.${index}.status`] = "Attendance status is required.";
        }
      });
    }

    return errors;
  }
}
