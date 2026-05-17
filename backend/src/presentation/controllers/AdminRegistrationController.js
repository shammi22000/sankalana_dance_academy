"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRegistrationController = void 0;
class AdminRegistrationController {
    constructor(manageRegistrationApprovalsUseCase, createTeacherRegistrationUseCase) {
        this.manageRegistrationApprovalsUseCase = manageRegistrationApprovalsUseCase;
        this.createTeacherRegistrationUseCase = createTeacherRegistrationUseCase;
        this.listPendingRegistrations = async (_request, response, next) => {
            try {
                const registrations = await this.manageRegistrationApprovalsUseCase.listPending();
                response.status(200).json({
                    success: true,
                    data: registrations,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.listTeacherRegistrations = async (_request, response, next) => {
            try {
                const teachers = await this.manageRegistrationApprovalsUseCase.listTeachers();
                response.status(200).json({
                    success: true,
                    data: teachers,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.listStudentRegistrations = async (_request, response, next) => {
            try {
                const students = await this.manageRegistrationApprovalsUseCase.listStudents();
                response.status(200).json({
                    success: true,
                    data: students,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.createTeacherRegistration = async (request, response, next) => {
            try {
                const teacherRegistration = await this.createTeacherRegistrationUseCase.execute(request.body);
                const approvedTeacher = await this.manageRegistrationApprovalsUseCase.updateTeacherStatus(teacherRegistration.id, "approved");
                response.status(201).json({
                    success: true,
                    data: approvedTeacher,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateStudentApprovalStatus = async (request, response, next) => {
            try {
                const student = await this.manageRegistrationApprovalsUseCase.updateStudentStatus(request.params.id, request.body.status);
                response.status(200).json({
                    success: true,
                    data: student,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateStudentProfile = async (request, response, next) => {
            try {
                const student = await this.manageRegistrationApprovalsUseCase.updateStudentProfile(request.params.id, request.body);
                response.status(200).json({
                    success: true,
                    data: student,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateStudentPassword = async (request, response, next) => {
            try {
                const student = await this.manageRegistrationApprovalsUseCase.updateStudentPassword(request.params.id, request.body);
                response.status(200).json({
                    success: true,
                    data: student,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateTeacherApplicationStatus = async (request, response, next) => {
            try {
                const teacher = await this.manageRegistrationApprovalsUseCase.updateTeacherStatus(request.params.id, request.body.status);
                response.status(200).json({
                    success: true,
                    data: teacher,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.updateTeacherPassword = async (request, response, next) => {
            try {
                const teacher = await this.manageRegistrationApprovalsUseCase.updateTeacherPassword(request.params.id, request.body);
                response.status(200).json({
                    success: true,
                    data: teacher,
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.AdminRegistrationController = AdminRegistrationController;
