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
    }
    getTeacherId(request) {
        return request.teacherId ?? "";
    }
}
exports.AttendanceRecordController = AttendanceRecordController;
