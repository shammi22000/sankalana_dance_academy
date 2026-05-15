"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateStudentRegistrationUseCase = void 0;
const ApplicationError_1 = require("../errors/ApplicationError");
const passwordHash_1 = require("../security/passwordHash");
const StudentRegistration_1 = require("../../domain/entities/StudentRegistration");
const allowedGenders = ["Female", "Male", "Other", "Prefer not to say"];
class CreateStudentRegistrationUseCase {
    constructor(studentRegistrationRepository) {
        this.studentRegistrationRepository = studentRegistrationRepository;
    }
    async execute(dto) {
        const normalized = {
            fullName: dto.fullName?.trim() ?? "",
            email: dto.email?.trim().toLowerCase() ?? "",
            phone: dto.phone?.trim() ?? "",
            username: dto.username?.trim().toLowerCase() ?? "",
            gender: dto.gender,
            dateOfBirth: dto.dateOfBirth?.trim() ?? "",
            password: dto.password ?? "",
            confirmPassword: dto.confirmPassword ?? "",
        };
        const errors = this.validate(normalized);
        if (await this.studentRegistrationRepository.findByEmail(normalized.email)) {
            errors.email = "A student with this email already exists.";
        }
        if (await this.studentRegistrationRepository.findByUsername(normalized.username)) {
            errors.username = "This username is already taken.";
        }
        if (Object.keys(errors).length > 0) {
            throw new ApplicationError_1.ValidationError(errors);
        }
        const studentRegistration = StudentRegistration_1.StudentRegistration.create({
            fullName: normalized.fullName,
            email: normalized.email,
            phone: normalized.phone,
            username: normalized.username,
            gender: normalized.gender,
            dateOfBirth: normalized.dateOfBirth,
            passwordHash: (0, passwordHash_1.hashPassword)(normalized.password),
        });
        const savedRegistration = await this.studentRegistrationRepository.save(studentRegistration);
        return savedRegistration.toJSON();
    }
    validate(dto) {
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
        if (!allowedGenders.includes(dto.gender)) {
            errors.gender = "Please select a valid gender.";
        }
        if (!dto.dateOfBirth || Number.isNaN(Date.parse(dto.dateOfBirth))) {
            errors.dateOfBirth = "A valid date of birth is required.";
        }
        if (!dto.password || dto.password.length < 6) {
            errors.password = "Password must be at least 6 characters.";
        }
        if (dto.password !== dto.confirmPassword) {
            errors.confirmPassword = "Passwords must match.";
        }
        return errors;
    }
}
exports.CreateStudentRegistrationUseCase = CreateStudentRegistrationUseCase;
