"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManageTeacherClassesUseCase = void 0;
const ApplicationError_1 = require("../errors/ApplicationError");
const TeacherClass_1 = require("../../domain/entities/TeacherClass");
const teachingDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const classLevels = ["Beginner", "Intermediate", "Advanced", "Professional"];
class ManageTeacherClassesUseCase {
    constructor(teacherClassRepository, teacherRegistrationRepository) {
        this.teacherClassRepository = teacherClassRepository;
        this.teacherRegistrationRepository = teacherRegistrationRepository;
    }
    async listAll() {
        const teacherClasses = await this.teacherClassRepository.findAll();
        return teacherClasses.map((teacherClass) => teacherClass.toJSON());
    }
    async listForTeacher(teacherId) {
        const teacherClasses = await this.teacherClassRepository.findByTeacherId(teacherId);
        return teacherClasses.map((teacherClass) => teacherClass.toJSON());
    }
    async create(teacherId, dto) {
        const teacher = await this.teacherRegistrationRepository.findById(teacherId);
        if (!teacher) {
            throw new ApplicationError_1.NotFoundError("Teacher account not found.");
        }
        const teacherJson = teacher.toJSON();
        const normalized = this.normalize(dto, teacherJson.danceStyles);
        const errors = this.validate(normalized);
        if (Object.keys(errors).length > 0) {
            throw new ApplicationError_1.ValidationError(errors);
        }
        const teacherClass = TeacherClass_1.TeacherClass.create({
            teacherId: teacherJson.id,
            teacherName: teacherJson.fullName,
            teacherUsername: teacherJson.username,
            teacherSpecialization: teacherJson.danceStyles,
            teacherExperienceYears: teacherJson.experienceYears,
            teacherBiography: teacherJson.biography,
            teacherAvatarFileName: teacherJson.avatarFileName,
            teacherAvatarImageDataUrl: teacherJson.avatarImageDataUrl,
            ...normalized,
        });
        const savedClass = await this.teacherClassRepository.save(teacherClass);
        return savedClass.toJSON();
    }
    async update(teacherId, classId, dto) {
        const teacher = await this.teacherRegistrationRepository.findById(teacherId);
        if (!teacher) {
            throw new ApplicationError_1.NotFoundError("Teacher account not found.");
        }
        const teacherJson = teacher.toJSON();
        const normalized = this.normalize(dto, teacherJson.danceStyles);
        const errors = this.validate(normalized);
        if (Object.keys(errors).length > 0) {
            throw new ApplicationError_1.ValidationError(errors);
        }
        const updatedClass = await this.teacherClassRepository.update(classId, teacherId, {
            ...normalized,
            updatedAt: new Date(),
        });
        if (!updatedClass) {
            throw new ApplicationError_1.NotFoundError("Teacher class not found.");
        }
        return updatedClass.toJSON();
    }
    async delete(teacherId, classId) {
        const deleted = await this.teacherClassRepository.delete(classId, teacherId);
        if (!deleted) {
            throw new ApplicationError_1.NotFoundError("Teacher class not found.");
        }
    }
    normalize(dto, teacherDanceStyle) {
        return {
            className: dto.className?.trim() ?? "",
            danceStyle: teacherDanceStyle,
            classLevel: dto.classLevel?.trim() ?? "",
            description: dto.description?.trim() ?? "",
            days: Array.isArray(dto.days) ? dto.days : [],
            startTime: dto.startTime?.trim() ?? "",
            endTime: dto.endTime?.trim() ?? "",
            studio: dto.studio?.trim() ?? "",
            capacity: Number(dto.capacity),
            posterFileName: dto.posterFileName?.trim() ?? "",
            milestones: Array.isArray(dto.milestones)
                ? dto.milestones.map((milestone) => milestone.trim()).filter(Boolean)
                : [],
        };
    }
    validate(dto) {
        const errors = {};
        if (!dto.className || dto.className.length < 2) {
            errors.className = "Class name must be at least 2 characters.";
        }
        if (!dto.classLevel || !classLevels.includes(dto.classLevel)) {
            errors.classLevel = "Select a valid class level.";
        }
        if (!dto.description || dto.description.length < 5) {
            errors.description = "Class description must be at least 5 characters.";
        }
        if (!Array.isArray(dto.days) || dto.days.length === 0) {
            errors.days = "Select at least one class day.";
        }
        else if (!dto.days.every((day) => teachingDays.includes(day))) {
            errors.days = "Select valid class days.";
        }
        if (!dto.startTime) {
            errors.startTime = "Start time is required.";
        }
        if (!dto.endTime) {
            errors.endTime = "End time is required.";
        }
        if (!dto.studio) {
            errors.studio = "Studio location is required.";
        }
        if (!Number.isFinite(dto.capacity) || dto.capacity < 1) {
            errors.capacity = "Capacity must be at least 1.";
        }
        if (!Array.isArray(dto.milestones) || dto.milestones.length === 0) {
            errors.milestones = "Add at least one syllabus milestone.";
        }
        return errors;
    }
}
exports.ManageTeacherClassesUseCase = ManageTeacherClassesUseCase;
