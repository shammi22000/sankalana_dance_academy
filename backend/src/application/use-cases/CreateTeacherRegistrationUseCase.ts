import type {
  CreateTeacherRegistrationDTO,
  TeacherRegistrationResponseDTO,
} from "../dto/CreateTeacherRegistrationDTO";
import { ValidationError } from "../errors/ApplicationError";
import { hashPassword } from "../security/passwordHash";
import {
  TeacherRegistration,
  type TeachingDay,
} from "../../domain/entities/TeacherRegistration";
import type { TeacherRegistrationRepository } from "../../domain/repositories/TeacherRegistrationRepository";

const teachingDays: TeachingDay[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const danceStyleOptions = ["Kandyan Dancing", "Low Country Dancing", "Sabaragamu", "Contemporary"];
const maxAvatarDataUrlLength = 1_500_000;

export class CreateTeacherRegistrationUseCase {
  constructor(private readonly teacherRegistrationRepository: TeacherRegistrationRepository) {}

  async execute(dto: CreateTeacherRegistrationDTO): Promise<TeacherRegistrationResponseDTO> {
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
      password: dto.password ?? "",
      confirmPassword: dto.confirmPassword ?? "",
    };

    const errors = this.validate(normalized);

    if (await this.teacherRegistrationRepository.findByEmail(normalized.email)) {
      errors.email = "A teacher with this email already exists.";
    }

    if (await this.teacherRegistrationRepository.findByUsername(normalized.username)) {
      errors.username = "This username is already taken.";
    }

    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors);
    }

    const teacherRegistration = TeacherRegistration.create({
      fullName: normalized.fullName,
      email: normalized.email,
      phone: normalized.phone,
      username: normalized.username,
      danceStyles: normalized.danceStyles,
      experienceYears: normalized.experienceYears,
      qualifications: normalized.qualifications,
      biography: normalized.biography,
      availableDays: normalized.availableDays,
      avatarFileName: normalized.avatarFileName,
      avatarImageDataUrl: normalized.avatarImageDataUrl,
      portfolioFileName: normalized.portfolioFileName,
      passwordHash: hashPassword(normalized.password),
    });

    const savedRegistration = await this.teacherRegistrationRepository.save(teacherRegistration);

    return savedRegistration.toJSON();
  }

  private validate(dto: CreateTeacherRegistrationDTO): Record<string, string> {
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

    if (!dto.danceStyles || dto.danceStyles.length < 2) {
      errors.danceStyles = "Please select a dancing style.";
    } else if (!danceStyleOptions.includes(dto.danceStyles)) {
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
    } else if (!dto.availableDays.every((day) => teachingDays.includes(day))) {
      errors.availableDays = "Please select valid teaching days.";
    }

    if (dto.avatarImageDataUrl) {
      if (!/^data:image\/(png|jpe?g|webp);base64,/i.test(dto.avatarImageDataUrl)) {
        errors.avatarImageDataUrl = "Avatar must be a PNG, JPG, or WebP image.";
      } else if (dto.avatarImageDataUrl.length > maxAvatarDataUrlLength) {
        errors.avatarImageDataUrl = "Avatar image must be smaller than 1 MB.";
      }
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
