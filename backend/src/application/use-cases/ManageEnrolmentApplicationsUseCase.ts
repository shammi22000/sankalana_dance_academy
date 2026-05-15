import type {
  CreateEnrolmentApplicationDTO,
  EnrolmentApplicationResponseDTO,
  TeacherEnrolmentDecisionDTO,
} from "../dto/EnrolmentApplicationDTO";
import { NotFoundError, ValidationError } from "../errors/ApplicationError";
import { EnrolmentApplication, type EnrolmentData } from "../../domain/entities/EnrolmentApplication";
import type { EnrolmentApplicationRepository } from "../../domain/repositories/EnrolmentApplicationRepository";
import type { StudentRegistrationRepository } from "../../domain/repositories/StudentRegistrationRepository";
import type { TeacherClassRepository } from "../../domain/repositories/TeacherClassRepository";
import type { TeacherRegistrationRepository } from "../../domain/repositories/TeacherRegistrationRepository";

export class ManageEnrolmentApplicationsUseCase {
  constructor(
    private readonly enrolmentApplicationRepository: EnrolmentApplicationRepository,
    private readonly studentRegistrationRepository: StudentRegistrationRepository,
    private readonly teacherRegistrationRepository: TeacherRegistrationRepository,
    private readonly teacherClassRepository: TeacherClassRepository,
  ) {}

  async listForStudent(studentId: string): Promise<EnrolmentApplicationResponseDTO[]> {
    const applications = await this.enrolmentApplicationRepository.findByStudentId(studentId);

    return applications.map((application) => application.toJSON());
  }

  async listForTeacher(teacherId: string): Promise<EnrolmentApplicationResponseDTO[]> {
    const applications = await this.enrolmentApplicationRepository.findByTeacherId(teacherId);

    return applications.map((application) => application.toJSON());
  }

  async create(studentId: string, dto: CreateEnrolmentApplicationDTO): Promise<EnrolmentApplicationResponseDTO> {
    const student = await this.studentRegistrationRepository.findById(studentId);

    if (!student) {
      throw new NotFoundError("Student account not found.");
    }

    const data = dto.data;

    if (!data) {
      throw new ValidationError({ data: "Enrolment details are required." });
    }

    const classSlot = await this.teacherClassRepository.findById(data.slotId);

    if (!classSlot) {
      throw new ValidationError({ slotId: "Selected teacher class was not found." });
    }

    const classJson = classSlot.toJSON();
    const normalizedData: EnrolmentData = {
      ...data,
      teacherId: classJson.teacherId,
      personal: {
        ...data.personal,
        fullName: data.personal?.fullName?.trim() ?? "",
        email: data.personal?.email?.trim().toLowerCase() ?? "",
        phone: data.personal?.phone?.trim() ?? "",
        address: data.personal?.address?.trim() ?? "",
        city: data.personal?.city?.trim() ?? "",
        emergencyContact: data.personal?.emergencyContact?.trim() ?? "",
      },
      guardian: {
        ...data.guardian,
        fullName: data.guardian?.fullName?.trim() ?? "",
        phone: data.guardian?.phone?.trim() ?? "",
        email: data.guardian?.email?.trim().toLowerCase() ?? "",
        relationship: data.guardian?.relationship?.trim() ?? "",
        address: data.guardian?.address?.trim() ?? "",
      },
    };
    const errors = this.validateEnrolmentData(normalizedData);

    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors);
    }

    const application = EnrolmentApplication.create({
      applicationId: await this.getNextApplicationId(),
      studentId,
      data: normalizedData,
    });
    const savedApplication = await this.enrolmentApplicationRepository.save(application);

    return savedApplication.toJSON();
  }

  async updateTeacherDecision(
    teacherId: string,
    applicationId: string,
    dto: TeacherEnrolmentDecisionDTO,
  ): Promise<EnrolmentApplicationResponseDTO> {
    const status = dto.status;

    if (status !== "Approved" && status !== "Rejected") {
      throw new ValidationError({ status: "Status must be Approved or Rejected." });
    }

    const teacher = await this.teacherRegistrationRepository.findById(teacherId);

    if (!teacher) {
      throw new NotFoundError("Teacher account not found.");
    }

    const teacherJson = teacher.toJSON();
    const updatedApplication = await this.enrolmentApplicationRepository.updateTeacherDecision(
      applicationId,
      teacherId,
      {
        status,
        reviewedAt: new Date(),
        reviewedByTeacherId: teacherId,
        adminComment:
          status === "Approved"
            ? `Accepted by ${teacherJson.fullName}.`
            : `Rejected by ${teacherJson.fullName}. Please contact the academy for another suitable class.`,
      },
    );

    if (!updatedApplication) {
      throw new NotFoundError("Enrolment application not found.");
    }

    return updatedApplication.toJSON();
  }

  private async getNextApplicationId() {
    const year = new Date().getFullYear();
    const count = await this.enrolmentApplicationRepository.countSubmittedInYear(year);

    return `ENR-${year}-${String(count + 1).padStart(3, "0")}`;
  }

  private validateEnrolmentData(data: EnrolmentData): Record<string, string> {
    const errors: Record<string, string> = {};

    if (!data.danceStyleId) {
      errors.danceStyleId = "Dance style is required.";
    }

    if (!data.slotId) {
      errors.slotId = "Class date and time is required.";
    }

    if (!data.teacherId) {
      errors.teacherId = "Teacher is required.";
    }

    if (!data.personal.fullName) {
      errors.fullName = "Student full name is required.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.personal.email)) {
      errors.email = "A valid email address is required.";
    }

    if (!/^\+?\d[\d\s-]{6,}$/.test(data.personal.phone)) {
      errors.phone = "A valid phone number is required.";
    }

    if (!data.personal.address) {
      errors.address = "Student address is required.";
    }

    if (!data.guardian.fullName) {
      errors.guardianFullName = "Guardian full name is required.";
    }

    if (!/^\+?\d[\d\s-]{6,}$/.test(data.guardian.phone)) {
      errors.guardianPhone = "A valid guardian phone number is required.";
    }

    if (!data.guardian.relationship) {
      errors.relationship = "Guardian relationship is required.";
    }

    if (!data.confirmed) {
      errors.confirmed = "Please confirm the enrolment information.";
    }

    return errors;
  }
}
