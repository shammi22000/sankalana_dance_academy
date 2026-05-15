"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherClassController = void 0;
class TeacherClassController {
    constructor(manageTeacherClassesUseCase) {
        this.manageTeacherClassesUseCase = manageTeacherClassesUseCase;
        this.listAll = async (_request, response, next) => {
            try {
                const teacherClasses = await this.manageTeacherClassesUseCase.listAll();
                response.json({
                    success: true,
                    data: teacherClasses,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.listMine = async (request, response, next) => {
            try {
                const teacherClasses = await this.manageTeacherClassesUseCase.listForTeacher(this.getTeacherId(request));
                response.json({
                    success: true,
                    data: teacherClasses,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.create = async (request, response, next) => {
            try {
                const teacherClass = await this.manageTeacherClassesUseCase.create(this.getTeacherId(request), request.body);
                response.status(201).json({
                    success: true,
                    data: teacherClass,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.update = async (request, response, next) => {
            try {
                const teacherClass = await this.manageTeacherClassesUseCase.update(this.getTeacherId(request), request.params.id, request.body);
                response.json({
                    success: true,
                    data: teacherClass,
                });
            }
            catch (error) {
                next(error);
            }
        };
        this.delete = async (request, response, next) => {
            try {
                await this.manageTeacherClassesUseCase.delete(this.getTeacherId(request), request.params.id);
                response.json({
                    success: true,
                    data: {
                        id: request.params.id,
                    },
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
exports.TeacherClassController = TeacherClassController;
