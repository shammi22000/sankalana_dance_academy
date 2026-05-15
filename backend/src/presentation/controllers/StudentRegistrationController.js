"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentRegistrationController = void 0;
class StudentRegistrationController {
    constructor(createStudentRegistrationUseCase) {
        this.createStudentRegistrationUseCase = createStudentRegistrationUseCase;
        this.create = async (request, response, next) => {
            try {
                const studentRegistration = await this.createStudentRegistrationUseCase.execute(request.body);
                response.status(201).json({
                    success: true,
                    data: studentRegistration,
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.StudentRegistrationController = StudentRegistrationController;
