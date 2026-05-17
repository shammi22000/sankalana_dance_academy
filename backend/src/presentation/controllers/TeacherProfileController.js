"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherProfileController = void 0;
class TeacherProfileController {
    constructor(manageRegistrationApprovalsUseCase) {
        this.manageRegistrationApprovalsUseCase = manageRegistrationApprovalsUseCase;
        this.updateMyProfile = async (request, response, next) => {
            try {
                const teacher = await this.manageRegistrationApprovalsUseCase.updateTeacherProfile(this.getTeacherId(request), request.body);
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
    getTeacherId(request) {
        return request.teacherId;
    }
}
exports.TeacherProfileController = TeacherProfileController;
