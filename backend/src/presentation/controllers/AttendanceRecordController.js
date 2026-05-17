"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceRecordController = void 0;
class AttendanceRecordController {
    constructor(manageAttendanceRecordsUseCase) {
        this.manageAttendanceRecordsUseCase = manageAttendanceRecordsUseCase;
        this.listForTeacher = async (request, response, next) => {
            try {
                const records = await this.manageAttendanceRecordsUseCase.listForTeacher(this.getTeacherId(request));
                response.json({
                    success: true,
                    data: records,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.listForStudent = async (request, response, next) => {
            try {
                const records = await this.manageAttendanceRecordsUseCase.listForStudent(this.getStudentId(request));
                response.json({
                    success: true,
                    data: records,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.saveSession = async (request, response, next) => {
            try {
                const records = await this.manageAttendanceRecordsUseCase.saveSession(this.getTeacherId(request), request.body);
                response.json({
                    success: true,
                    data: records,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateRecord = async (request, response, next) => {
            try {
                const recordId = request.params.id ?? request.body?.id;
                const record = await this.manageAttendanceRecordsUseCase.updateRecord(this.getTeacherId(request), recordId, request.body);
                response.json({
                    success: true,
                    data: record,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteRecord = async (request, response, next) => {
            try {
                const recordId = request.params.id ?? request.query.id ?? request.body?.id;
                const result = await this.manageAttendanceRecordsUseCase.deleteRecord(this.getTeacherId(request), recordId);
                response.json({
                    success: true,
                    data: result,
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
    getTeacherId(request) {
        return request.teacherId ?? "";
    }
    getStudentId(request) {
        return request.studentId ?? "";
    }
}
exports.AttendanceRecordController = AttendanceRecordController;
