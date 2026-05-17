"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManageRegistrationApprovalsUseCase = void 0;
const ApplicationError_1 = require("../errors/ApplicationError");
const passwordHash_1 = require("../security/passwordHash");
const approvalStatuses = ["pending", "approved", "rejected"];
const allowedStudentGenders = ["Female", "Male", "Other", "Prefer not to say"];
const teachingDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const danceStyleOptions = ["Kandyan Dancing", "Low Country Dancing", "Sabaragamu", "Contemporary"];
const maxAvatarDataUrlLength = 1500000;
class ManageRegistrationApprovalsUseCase {
    constructor(studentRegistrationRepository, teacherRegistrationRepository) {
        this.studentRegistrationRepository = studentRegistrationRepository;
        this.teacherRegistrationRepository = teacherRegistrationRepository;
    }
    async listPending() {
        const [students, teachers] = await Promise.all([
            this.studentRegistrationRepository.findByApprovalStatus("pending"),
            this.teacherRegistrationRepository.findByApplicationStatus("pending"),
        ]);
        return {
            students: students.map((student) => student.toJSON()),
            teachers: teachers.map((teacher) => teacher.toJSON()),
        };
    }
    async listTeachers() {
        const teachers = await this.teacherRegistrationRepository.findAll();
        return teachers.map((teacher) => teacher.toJSON());
    }
    async listStudents() {
        const students = await this.studentRegistrationRepository.findAll();
        return students.map((student) => student.toJSON());
    }
    async updateStudentStatus(id, status) {
        this.validateStatus(status);
        const student = await this.studentRegistrationRepository.updateApprovalStatus(id, status);
        if (!student) {
            throw new ApplicationError_1.NotFoundError("Student registration not found.");
        }
        return student.toJSON();
    }
    async updateStudentProfile(id, dto) {
        const existingStudent = await this.studentRegistrationRepository.findById(id);
        if (!existingStudent) {
            throw new ApplicationError_1.NotFoundError("Student registration not found.");
        }
        const normalized = {
            fullName: dto.fullName?.trim() ?? "",
            email: dto.email?.trim().toLowerCase() ?? "",
            phone: dto.phone?.trim() ?? "",
            username: dto.username?.trim().toLowerCase() ?? "",
            gender: dto.gender,
            dateOfBirth: dto.dateOfBirth?.trim() ?? "",
        };
        const errors = this.validateStudentProfile(normalized);
        const existingEmailStudent = await this.studentRegistrationRepository.findByEmail(normalized.email);
        const existingUsernameStudent = await this.studentRegistrationRepository.findByUsername(normalized.username);
        if (existingEmailStudent && existingEmailStudent.toJSON().id !== id) {
            errors.email = "A student with this email already exists.";
        }
        if (existingUsernameStudent && existingUsernameStudent.toJSON().id !== id) {
            errors.username = "This username is already taken.";
        }
        if (Object.keys(errors).length > 0) {
            throw new ApplicationError_1.ValidationError(errors);
        }
        const updatedStudent = await this.studentRegistrationRepository.updateProfile(id, normalized);
        if (!updatedStudent) {
            throw new ApplicationError_1.NotFoundError("Student registration not found.");
        }
        return updatedStudent.toJSON();
    }
    async updateStudentPassword(id, dto) {
        const errors = this.validatePasswordUpdate(dto);
        if (Object.keys(errors).length > 0) {
            throw new ApplicationError_1.ValidationError(errors);
        }
        const updatedStudent = await this.studentRegistrationRepository.updatePasswordHash(id, (0, passwordHash_1.hashPassword)(dto.password));
        if (!updatedStudent) {
            throw new ApplicationError_1.NotFoundError("Student registration not found.");
        }
        return updatedStudent.toJSON();
    }
    async updateTeacherStatus(id, status) {
        this.validateStatus(status);
        const teacher = await this.teacherRegistrationRepository.updateApplicationStatus(id, status);
        if (!teacher) {
            throw new ApplicationError_1.NotFoundError("Teacher registration not found.");
        }
        return teacher.toJSON();
    }
    async updateTeacherProfile(id, dto) {
        const existingTeacher = await this.teacherRegistrationRepository.findById(id);
        if (!existingTeacher) {
            throw new ApplicationError_1.NotFoundError("Teacher registration not found.");
        }
        const currentTeacher = existingTeacher.toJSON();
        const normalized = {
            fullName: dto.fullName?.trim() ?? "",
            email: dto.email?.trim().toLowerCase() ?? "",
            phone: dto.phone?.trim() ?? "",
            username: dto.username?.trim().toLowerCase() ?? "",
            danceStyles: dto.danceStyles?.trim() ?? "",
            experienceYears: Number(dto.experienceYears),
            qualifications: dto.qualifications?.trim() ?? "",
            biography: dto.biography?.trim() ?? "",
            availableDays: Array.isArray(dto.availableDays) ? dto.availableDays : [],
            avatarFileName: dto.avatarFileName?.trim() || undefined,
            avatarImageDataUrl: dto.avatarImageDataUrl?.trim() || undefined,
            portfolioFileName: dto.portfolioFileName?.trim() || undefined,
        };
        const errors = this.validateTeacherProfile(normalized);
        const existingEmailTeacher = await this.teacherRegistrationRepository.findByEmail(normalized.email);
        const existingUsernameTeacher = await this.teacherRegistrationRepository.findByUsername(normalized.username);
        if (existingEmailTeacher && existingEmailTeacher.toJSON().id !== id) {
            errors.email = "A teacher with this email already exists.";
        }
        if (existingUsernameTeacher && existingUsernameTeacher.toJSON().id !== id) {
            errors.username = "This username is already taken.";
        }
        if (Object.keys(errors).length > 0) {
            throw new ApplicationError_1.ValidationError(errors);
        }
        const updatedTeacher = await this.teacherRegistrationRepository.updateProfile(id, {
            ...normalized,
            avatarFileName: normalized.avatarFileName ?? currentTeacher.avatarFileName,
            avatarImageDataUrl: normalized.avatarImageDataUrl ?? currentTeacher.avatarImageDataUrl,
            portfolioFileName: normalized.portfolioFileName ?? currentTeacher.portfolioFileName,
        });
        if (!updatedTeacher) {
            throw new ApplicationError_1.NotFoundError("Teacher registration not found.");
        }
        return updatedTeacher.toJSON();
    }
    async updateTeacherPassword(id, dto) {
        const errors = this.validatePasswordUpdate(dto);
        if (Object.keys(errors).length > 0) {
            throw new ApplicationError_1.ValidationError(errors);
        }
        const updatedTeacher = await this.teacherRegistrationRepository.updatePasswordHash(id, (0, passwordHash_1.hashPassword)(dto.password));
        if (!updatedTeacher) {
            throw new ApplicationError_1.NotFoundError("Teacher registration not found.");
        }
        return updatedTeacher.toJSON();
    }
    validateStatus(status) {
        if (!approvalStatuses.includes(status)) {
            throw new ApplicationError_1.ValidationError({
                status: "Status must be pending, approved, or rejected.",
            });
        }
    }
    validateStudentProfile(dto) {
        const errors = {};
        if (!dto.fullName || dto.fullName.length < 2) {
            errors.fullName = "Full name must be at least 2 characters.";
        }
        if (!dto.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dto.email)) {
            errors.email = "A valid email address is required.";
        }
        if (!dto.phone || dto.phone.replace(/\D/g, "").length < 7) {
            errors.phone = "A valid phone number is required.";
        }
        if (!dto.username || !/^[a-z0-9_]{3,24}$/.test(dto.username)) {
            errors.username = "Username must be 3-24 characters and use letters, numbers, or underscores.";
        }
        if (!allowedStudentGenders.includes(dto.gender)) {
            errors.gender = "Please select a valid gender.";
        }
        if (!dto.dateOfBirth || Number.isNaN(Date.parse(dto.dateOfBirth))) {
            errors.dateOfBirth = "A valid date of birth is required.";
        }
        return errors;
    }
    validateTeacherProfile(dto) {
        const errors = {};
        if (!dto.fullName || dto.fullName.length < 2) {
            errors.fullName = "Full name must be at least 2 characters.";
        }
        if (!dto.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dto.email)) {
            errors.email = "A valid email address is required.";
        }
        if (!dto.phone || dto.phone.replace(/\D/g, "").length < 7) {
            errors.phone = "A valid phone number is required.";
        }
        if (!dto.username || !/^[a-z0-9_]{3,24}$/.test(dto.username)) {
            errors.username = "Username must be 3-24 characters and use letters, numbers, or underscores.";
        }
        if (!dto.danceStyles || !danceStyleOptions.includes(dto.danceStyles)) {
            errors.danceStyles = "Please select a valid dancing style.";
        }
        if (!Number.isFinite(Number(dto.experienceYears)) || Number(dto.experienceYears) < 0) {
            errors.experienceYears = "Experience years must be a valid number.";
        }
        if (!dto.qualifications || dto.qualifications.length < 2) {
            errors.qualifications = "Qualifications are required.";
        }
        if (!dto.biography || dto.biography.length < 10) {
            errors.biography = "Short biography must be at least 10 characters.";
        }
        if (!Array.isArray(dto.availableDays) || dto.availableDays.length === 0) {
            errors.availableDays = "Select at least one available teaching day.";
        }
        else if (!dto.availableDays.every((day) => teachingDays.includes(day))) {
            errors.availableDays = "Please select valid teaching days.";
        }
        if (dto.avatarImageDataUrl) {
            if (!/^data:image\/(png|jpe?g|webp);base64,/i.test(dto.avatarImageDataUrl)) {
                errors.avatarImageDataUrl = "Avatar must be a PNG, JPG, or WebP image.";
            }
            else if (dto.avatarImageDataUrl.length > maxAvatarDataUrlLength) {
                errors.avatarImageDataUrl = "Avatar image must be smaller than 1 MB.";
            }
        }
        return errors;
    }
    validatePasswordUpdate(dto) {
        const errors = {};
        if (!dto.password || dto.password.length < 6) {
            errors.password = "Password must be at least 6 characters.";
        }
        if (dto.password !== dto.confirmPassword) {
            errors.confirmPassword = "Passwords must match.";
        }
        return errors;
    }
}
exports.ManageRegistrationApprovalsUseCase = ManageRegistrationApprovalsUseCase;
