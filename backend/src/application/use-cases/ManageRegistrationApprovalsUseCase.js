"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManageRegistrationApprovalsUseCase = void 0;
const ApplicationError_1 = require("../errors/ApplicationError");
const passwordHash_1 = require("../security/passwordHash");
const approvalStatuses = ["pending", "approved", "rejected"];
const allowedStudentGenders = ["Female", "Male", "Other", "Prefer not to say"];
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
