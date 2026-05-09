import type { StudentRegistrationResponseDTO } from "../dto/CreateStudentRegistrationDTO";
import type { TeacherRegistrationResponseDTO } from "../dto/CreateTeacherRegistrationDTO";
import { NotFoundError, ValidationError } from "../errors/ApplicationError";
import type { StudentApprovalStatus } from "../../domain/entities/StudentRegistration";
import type { StudentRegistrationRepository } from "../../domain/repositories/StudentRegistrationRepository";
import type { TeacherApplicationStatus } from "../../domain/entities/TeacherRegistration";
import type { TeacherRegistrationRepository } from "../../domain/repositories/TeacherRegistrationRepository";

type RegistrationApprovalStatus = StudentApprovalStatus & TeacherApplicationStatus;

export interface PendingRegistrationsResponseDTO {
  students: StudentRegistrationResponseDTO[];
  teachers: TeacherRegistrationResponseDTO[];
}

const approvalStatuses: RegistrationApprovalStatus[] = ["pending", "approved", "rejected"];

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

  async updateStudentStatus(id: string, status: RegistrationApprovalStatus): Promise<StudentRegistrationResponseDTO> {
    this.validateStatus(status);

    const student = await this.studentRegistrationRepository.updateApprovalStatus(id, status);

    if (!student) {
      throw new NotFoundError("Student registration not found.");
    }

    return student.toJSON();
  }

  async updateTeacherStatus(id: string, status: RegistrationApprovalStatus): Promise<TeacherRegistrationResponseDTO> {
    this.validateStatus(status);

    const teacher = await this.teacherRegistrationRepository.updateApplicationStatus(id, status);

    if (!teacher) {
      throw new NotFoundError("Teacher registration not found.");
    }

    return teacher.toJSON();
  }

  private validateStatus(status: string): asserts status is RegistrationApprovalStatus {
    if (!approvalStatuses.includes(status as RegistrationApprovalStatus)) {
      throw new ValidationError({
        status: "Status must be pending, approved, or rejected.",
      });
    }
  }
}
