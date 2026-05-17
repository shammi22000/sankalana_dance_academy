import type { TeacherClassPayloadDTO, TeacherClassResponseDTO } from "../dto/TeacherClassDTO";
import { NotFoundError, ValidationError } from "../errors/ApplicationError";
import { TeacherClass } from "../../domain/entities/TeacherClass";
import type { TeachingDay } from "../../domain/entities/TeacherRegistration";
import type { TeacherClassRepository } from "../../domain/repositories/TeacherClassRepository";
import type { TeacherRegistrationRepository } from "../../domain/repositories/TeacherRegistrationRepository";

const teachingDays: TeachingDay[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const classLevels = ["Beginner", "Intermediate", "Advanced", "Professional"];

interface NormalizedTeacherClassPayload {
  className: string;
  danceStyle: string;
  classLevel: string;
  description: string;
  days: TeachingDay[];
  startTime: string;
  endTime: string;
  studio: string;
  capacity: number;
  posterFileName: string;
  milestones: string[];
}

export class ManageTeacherClassesUseCase {
  constructor(
    private readonly teacherClassRepository: TeacherClassRepository,
    private readonly teacherRegistrationRepository: TeacherRegistrationRepository,
  ) {}

  async listAll(): Promise<TeacherClassResponseDTO[]> {
    const teacherClasses = await this.teacherClassRepository.findAll();

    return teacherClasses.map((teacherClass) => teacherClass.toJSON());
  }

  async listForTeacher(teacherId: string): Promise<TeacherClassResponseDTO[]> {
    const teacherClasses = await this.teacherClassRepository.findByTeacherId(teacherId);

    return teacherClasses.map((teacherClass) => teacherClass.toJSON());
  }

  async create(teacherId: string, dto: TeacherClassPayloadDTO): Promise<TeacherClassResponseDTO> {
    const teacher = await this.teacherRegistrationRepository.findById(teacherId);

    if (!teacher) {
      throw new NotFoundError("Teacher account not found.");
    }

    const teacherJson = teacher.toJSON();
    const normalized = this.normalize(dto, teacherJson.danceStyles);
    const errors = this.validate(normalized);

    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors);
    }

    const teacherClass = TeacherClass.create({
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

  async update(teacherId: string, classId: string, dto: TeacherClassPayloadDTO): Promise<TeacherClassResponseDTO> {
    const teacher = await this.teacherRegistrationRepository.findById(teacherId);

    if (!teacher) {
      throw new NotFoundError("Teacher account not found.");
    }

    const teacherJson = teacher.toJSON();
    const normalized = this.normalize(dto, teacherJson.danceStyles);
    const errors = this.validate(normalized);

    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors);
    }

    const updatedClass = await this.teacherClassRepository.update(classId, teacherId, {
      ...normalized,
      updatedAt: new Date(),
    });

    if (!updatedClass) {
      throw new NotFoundError("Teacher class not found.");
    }

    return updatedClass.toJSON();
  }

  async delete(teacherId: string, classId: string): Promise<void> {
    const deleted = await this.teacherClassRepository.delete(classId, teacherId);

    if (!deleted) {
      throw new NotFoundError("Teacher class not found.");
    }
  }

  private normalize(dto: TeacherClassPayloadDTO, teacherDanceStyle: string): NormalizedTeacherClassPayload {
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

  private validate(dto: NormalizedTeacherClassPayload): Record<string, string> {
    const errors: Record<string, string> = {};

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
    } else if (!dto.days.every((day) => teachingDays.includes(day))) {
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
