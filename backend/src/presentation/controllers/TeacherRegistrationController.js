"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherRegistrationController = void 0;
class TeacherRegistrationController {
    constructor(createTeacherRegistrationUseCase) {
        this.createTeacherRegistrationUseCase = createTeacherRegistrationUseCase;
        this.create = async (request, response, next) => {
            try {
                const teacherRegistration = await this.createTeacherRegistrationUseCase.execute(request.body);
                response.status(201).json({
                    success: true,
                    data: teacherRegistration,
                });
            }
            catch (error) {
                next(error);
            }
        };
    }
}
exports.TeacherRegistrationController = TeacherRegistrationController;
