import type {
  CreateStudentRegistrationDTO,
  StudentRegistrationResponseDTO,
} from "../dto/CreateStudentRegistrationDTO";
import { ValidationError } from "../errors/ApplicationError";
import { hashPassword } from "../security/passwordHash";
import { StudentRegistration, type StudentGender } from "../../domain/entities/StudentRegistration";
import type { StudentRegistrationRepository } from "../../domain/repositories/StudentRegistrationRepository";

const allowedGenders: StudentGender[] = ["Female", "Male", "Other", "Prefer not to say"];

export class CreateStudentRegistrationUseCase {
  constructor(private readonly studentRegistrationRepository: StudentRegistrationRepository) {}

  async execute(dto: CreateStudentRegistrationDTO): Promise<StudentRegistrationResponseDTO> {
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
      throw new ValidationError(errors);
    }

    const studentRegistration = StudentRegistration.create({
      fullName: normalized.fullName,
      email: normalized.email,
      phone: normalized.phone,
      username: normalized.username,
      gender: normalized.gender,
      dateOfBirth: normalized.dateOfBirth,
      passwordHash: hashPassword(normalized.password),
    });

    const savedRegistration = await this.studentRegistrationRepository.save(studentRegistration);

    return savedRegistration.toJSON();
  }

  private validate(dto: CreateStudentRegistrationDTO): Record<string, string> {
    const errors: Record<string, string> = {};

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
