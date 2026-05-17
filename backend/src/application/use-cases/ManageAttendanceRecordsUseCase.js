"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManageAttendanceRecordsUseCase = void 0;
const ApplicationError_1 = require("../errors/ApplicationError");
const AttendanceRecord_1 = require("../../domain/entities/AttendanceRecord");
const attendanceStatuses = ["present", "absent", "late"];
class ManageAttendanceRecordsUseCase {
    constructor(attendanceRecordRepository) {
        this.attendanceRecordRepository = attendanceRecordRepository;
    }
    async listForTeacher(teacherId) {
        const records = await this.attendanceRecordRepository.findByTeacherId(teacherId);
        return records.map((record) => record.toJSON());
    }
    async listForStudent(studentId) {
        const records = await this.attendanceRecordRepository.findByStudentId(studentId);
        return records.map((record) => record.toJSON());
    }
    async saveSession(teacherId, dto) {
        const normalized = {
            classId: dto.classId?.trim() ?? "",
            className: dto.className?.trim() ?? "",
            date: dto.date?.trim() ?? "",
            records: Array.isArray(dto.records) ? dto.records : [],
        };
        const errors = this.validate(normalized);
        if (Object.keys(errors).length > 0) {
            throw new ApplicationError_1.ValidationError(errors);
        }
        const records = normalized.records.map((record) => AttendanceRecord_1.AttendanceRecord.create({
            teacherId,
            classId: normalized.classId,
            className: normalized.className,
            date: normalized.date,
            studentId: record.studentId?.trim() ?? "",
            studentName: record.studentName?.trim() ?? "",
            status: record.status,
            remarks: record.remarks?.trim() ?? "",
        }));
        const savedRecords = await this.attendanceRecordRepository.replaceSession(teacherId, normalized.classId, normalized.date, records);
        return savedRecords.map((record) => record.toJSON());
    }
    async updateRecord(teacherId, id, dto) {
        const normalizedId = id?.trim() ?? "";
        const normalizedStatus = dto.status?.trim() ?? "";
        const normalizedRemarks = dto.remarks?.trim() ?? "";
        const errors = {};
        if (!normalizedId) {
            errors.id = "Attendance record is required.";
        }
        if (!normalizedStatus || !attendanceStatuses.includes(normalizedStatus)) {
            errors.status = "Attendance status is required.";
        }
        if (Object.keys(errors).length > 0) {
            throw new ApplicationError_1.ValidationError(errors);
        }
        const record = await this.attendanceRecordRepository.updateRecord(teacherId, normalizedId, {
            status: normalizedStatus,
            remarks: normalizedRemarks,
        });
        if (!record) {
            throw new ApplicationError_1.NotFoundError("Attendance record not found.");
        }
        return record.toJSON();
    }
    async deleteRecord(teacherId, id) {
        const normalizedId = id?.trim() ?? "";
        if (!normalizedId) {
            throw new ApplicationError_1.ValidationError({
                id: "Attendance record is required.",
            });
        }
        const deleted = await this.attendanceRecordRepository.deleteRecord(teacherId, normalizedId);
        if (!deleted) {
            throw new ApplicationError_1.NotFoundError("Attendance record not found.");
        }
        return { id: normalizedId };
    }
    validate(dto) {
        const errors = {};
        if (!dto.classId) {
            errors.classId = "Class is required.";
        }
        if (!dto.className) {
            errors.className = "Class name is required.";
        }
        if (!dto.date || !/^\d{4}-\d{2}-\d{2}$/.test(dto.date)) {
            errors.date = "A valid attendance date is required.";
        }
        if (!Array.isArray(dto.records)) {
            errors.records = "Attendance records must be a list.";
        }
        else if (dto.records.length > 0) {
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
exports.ManageAttendanceRecordsUseCase = ManageAttendanceRecordsUseCase;
