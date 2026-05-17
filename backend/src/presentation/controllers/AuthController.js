"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
class AuthController {
    constructor(authenticateStudentUseCase, authenticateTeacherUseCase, authenticateAdminUseCase) {
        this.authenticateStudentUseCase = authenticateStudentUseCase;
        this.authenticateTeacherUseCase = authenticateTeacherUseCase;
        this.authenticateAdminUseCase = authenticateAdminUseCase;
        this.loginStudent = async (request, response, next) => {
            try {
                const authentication = await this.authenticateStudentUseCase.execute(request.body);
                response.status(200).json({
                    success: true,
                    data: authentication,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.loginTeacher = async (request, response, next) => {
            try {
                const authentication = await this.authenticateTeacherUseCase.execute(request.body);
                response.status(200).json({
                    success: true,
                    data: authentication,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.loginAdmin = async (request, response, next) => {
            try {
                const authentication = await this.authenticateAdminUseCase.execute(request.body);
                response.status(200).json({
                    success: true,
                    data: authentication,
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.AuthController = AuthController;
