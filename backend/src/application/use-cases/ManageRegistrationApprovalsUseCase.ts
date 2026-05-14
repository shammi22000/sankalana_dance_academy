import type { StudentRegistrationResponseDTO } from "../dto/CreateStudentRegistrationDTO";
import type { TeacherRegistrationResponseDTO } from "../dto/CreateTeacherRegistrationDTO";
import { NotFoundError, ValidationError } from "../errors/ApplicationError";
import type { StudentApprovalStatus, StudentGender } from "../../domain/entities/StudentRegistration";
import type { StudentRegistrationRepository } from "../../domain/repositories/StudentRegistrationRepository";
import type { TeacherApplicationStatus } from "../../domain/entities/TeacherRegistration";
import type { TeacherRegistrationRepository } from "../../domain/repositories/TeacherRegistrationRepository";
import { hashPassword } from "../security/passwordHash";

type RegistrationApprovalStatus = StudentApprovalStatus & TeacherApplicationStatus;

export interface PendingRegistrationsResponseDTO {
  students: StudentRegistrationResponseDTO[];
  teachers: TeacherRegistrationResponseDTO[];
}

const approvalStatuses: RegistrationApprovalStatus[] = ["pending", "approved", "rejected"];
const allowedStudentGenders: StudentGender[] = ["Female", "Male", "Other", "Prefer not to say"];

interface UpdateStudentProfileDTO {
  fullName: string;
  email: string;
  phone: string;
  username: string;
  gender: StudentGender;
  dateOfBirth: string;
}

interface UpdatePasswordDTO {
  password: string;
  confirmPassword: string;
}

export class ManageRegistrationApprovalsUseCase {
  constructor(
    private readonly studentRegistrationRepository: StudentRegistrationRepository,
    private readonly teacherRegistrationRepository: TeacherRegistrationRepository,
  ) {}

  async listPending(): Promise<PendingRegistrationsResponseDTO> {
    const [students, teachers] = await Promise.all([
      this.studentRegistrationRepository.findByApprovalStatus("pending"),
      this.teacherRegistrationRepository.findByApplicationStatus("pending"),
    ]);

    return {
      students: students.map((student) => student.toJSON()),
      teachers: teachers.map((teacher) => teacher.toJSON()),
    };
  }

  async listTeachers(): Promise<TeacherRegistrationResponseDTO[]> {
    const teachers = await this.teacherRegistrationRepository.findAll();

    return teachers.map((teacher) => teacher.toJSON());
  }

  async listStudents(): Promise<StudentRegistrationResponseDTO[]> {
    const students = await this.studentRegistrationRepository.findAll();

    return students.map((student) => student.toJSON());
  }

  async updateStudentStatus(id: string, status: RegistrationApprovalStatus): Promise<StudentRegistrationResponseDTO> {
    this.validateStatus(status);

    const student = await this.studentRegistrationRepository.updateApprovalStatus(id, status);

    if (!student) {
      throw new NotFoundError("Student registration not found.");
    }

    return student.toJSON();
  }

  async updateStudentProfile(id: string, dto: UpdateStudentProfileDTO): Promise<StudentRegistrationResponseDTO> {
    const existingStudent = await this.studentRegistrationRepository.findById(id);

    if (!existingStudent) {
      throw new NotFoundError("Student registration not found.");
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
      throw new ValidationError(errors);
    }

    const updatedStudent = await this.studentRegistrationRepository.updateProfile(id, normalized);

    if (!updatedStudent) {
      throw new NotFoundError("Student registration not found.");
    }

    return updatedStudent.toJSON();
  }

  async updateStudentPassword(id: string, dto: UpdatePasswordDTO): Promise<StudentRegistrationResponseDTO> {
    const errors = this.validatePasswordUpdate(dto);

    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors);
    }

    const updatedStudent = await this.studentRegistrationRepository.updatePasswordHash(
      id,
      hashPassword(dto.password),
    );

    if (!updatedStudent) {
      throw new NotFoundError("Student registration not found.");
    }

    return updatedStudent.toJSON();
  }

  async updateTeacherStatus(id: string, status: RegistrationApprovalStatus): Promise<TeacherRegistrationResponseDTO> {
    this.validateStatus(status);

    const teacher = await this.teacherRegistrationRepository.updateApplicationStatus(id, status);

    if (!teacher) {
      throw new NotFoundError("Teacher registration not found.");
    }

    return teacher.toJSON();
  }

  async updateTeacherPassword(id: string, dto: UpdatePasswordDTO): Promise<TeacherRegistrationResponseDTO> {
    const errors = this.validatePasswordUpdate(dto);

    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors);
    }

    const updatedTeacher = await this.teacherRegistrationRepository.updatePasswordHash(
      id,
      hashPassword(dto.password),
    );

    if (!updatedTeacher) {
      throw new NotFoundError("Teacher registration not found.");
    }

    return updatedTeacher.toJSON();
  }

  private validateStatus(status: string): asserts status is RegistrationApprovalStatus {
    if (!approvalStatuses.includes(status as RegistrationApprovalStatus)) {
      throw new ValidationError({
        status: "Status must be pending, approved, or rejected.",
      });
    }
  }

  private validateStudentProfile(dto: UpdateStudentProfileDTO): Record<string, string> {
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

    if (!allowedStudentGenders.includes(dto.gender)) {
      errors.gender = "Please select a valid gender.";
    }

    if (!dto.dateOfBirth || Number.isNaN(Date.parse(dto.dateOfBirth))) {
      errors.dateOfBirth = "A valid date of birth is required.";
    }

    return errors;
  }

  private validatePasswordUpdate(dto: UpdatePasswordDTO): Record<string, string> {
    const errors: Record<string, string> = {};

    if (!dto.password || dto.password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    if (dto.password !== dto.confirmPassword) {
      errors.confirmPassword = "Passwords must match.";
    }

    return errors;
  }
}
