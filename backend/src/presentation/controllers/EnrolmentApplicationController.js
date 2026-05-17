"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrolmentApplicationController = void 0;
class EnrolmentApplicationController {
    constructor(manageEnrolmentApplicationsUseCase) {
        this.manageEnrolmentApplicationsUseCase = manageEnrolmentApplicationsUseCase;
        this.listForStudent = async (request, response, next) => {
            try {
                const applications = await this.manageEnrolmentApplicationsUseCase.listForStudent(this.getStudentId(request));
                response.json({
                    success: true,
                    data: applications,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.createForStudent = async (request, response, next) => {
            try {
                const application = await this.manageEnrolmentApplicationsUseCase.create(this.getStudentId(request), {
                    data: request.body?.data ?? request.body,
                });
                response.status(201).json({
                    success: true,
                    data: application,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.listForTeacher = async (request, response, next) => {
            try {
                const applications = await this.manageEnrolmentApplicationsUseCase.listForTeacher(this.getTeacherId(request));
                response.json({
                    success: true,
                    data: applications,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.listAllForAdmin = async (_request, response, next) => {
            try {
                const applications = await this.manageEnrolmentApplicationsUseCase.listAll();
                response.json({
                    success: true,
                    data: applications,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateTeacherDecision = async (request, response, next) => {
            try {
                const application = await this.manageEnrolmentApplicationsUseCase.updateTeacherDecision(this.getTeacherId(request), request.params.applicationId, request.body);
                response.json({
                    success: true,
                    data: application,
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
    getStudentId(request) {
        return request.studentId ?? "";
    }
    getTeacherId(request) {
        return request.teacherId ?? "";
    }
}
exports.EnrolmentApplicationController = EnrolmentApplicationController;
