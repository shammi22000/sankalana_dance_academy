"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManageEnrolmentApplicationsUseCase = void 0;
const ApplicationError_1 = require("../errors/ApplicationError");
const EnrolmentApplication_1 = require("../../domain/entities/EnrolmentApplication");
class ManageEnrolmentApplicationsUseCase {
    constructor(enrolmentApplicationRepository, studentRegistrationRepository, teacherRegistrationRepository, teacherClassRepository) {
        this.enrolmentApplicationRepository = enrolmentApplicationRepository;
        this.studentRegistrationRepository = studentRegistrationRepository;
        this.teacherRegistrationRepository = teacherRegistrationRepository;
        this.teacherClassRepository = teacherClassRepository;
    }
    async listForStudent(studentId) {
        const applications = await this.enrolmentApplicationRepository.findByStudentId(studentId);
        return applications.map((application) => application.toJSON());
    }
    async listForTeacher(teacherId) {
        const applications = await this.enrolmentApplicationRepository.findByTeacherId(teacherId);
        return applications.map((application) => application.toJSON());
    }
    async listAll() {
        const applications = await this.enrolmentApplicationRepository.findAll();
        return applications.map((application) => application.toJSON());
    }
    async create(studentId, dto) {
        const student = await this.studentRegistrationRepository.findById(studentId);
        if (!student) {
            throw new ApplicationError_1.NotFoundError("Student account not found.");
        }
        const data = dto.data;
        if (!data) {
            throw new ApplicationError_1.ValidationError({ data: "Enrolment details are required." });
        }
        const classSlot = await this.teacherClassRepository.findById(data.slotId);
        if (!classSlot) {
            throw new ApplicationError_1.ValidationError({ slotId: "Selected teacher class was not found." });
        }
        const classJson = classSlot.toJSON();
        const normalizedData = {
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
            throw new ApplicationError_1.ValidationError(errors);
        }
        const application = EnrolmentApplication_1.EnrolmentApplication.create({
            applicationId: await this.getNextApplicationId(),
            studentId,
            data: normalizedData,
        });
        const savedApplication = await this.enrolmentApplicationRepository.save(application);
        return savedApplication.toJSON();
    }
    async updateTeacherDecision(teacherId, applicationId, dto) {
        const status = dto.status;
        if (status !== "Approved" && status !== "Rejected") {
            throw new ApplicationError_1.ValidationError({ status: "Status must be Approved or Rejected." });
        }
        const teacher = await this.teacherRegistrationRepository.findById(teacherId);
        if (!teacher) {
            throw new ApplicationError_1.NotFoundError("Teacher account not found.");
        }
        const teacherJson = teacher.toJSON();
        const updatedApplication = await this.enrolmentApplicationRepository.updateTeacherDecision(applicationId, teacherId, {
            status,
            reviewedAt: new Date(),
            reviewedByTeacherId: teacherId,
            adminComment: status === "Approved"
                ? `Accepted by ${teacherJson.fullName}.`
                : `Rejected by ${teacherJson.fullName}. Please contact the academy for another suitable class.`,
        });
        if (!updatedApplication) {
            throw new ApplicationError_1.NotFoundError("Enrolment application not found.");
        }
        return updatedApplication.toJSON();
    }
    async getNextApplicationId() {
        const year = new Date().getFullYear();
        const count = await this.enrolmentApplicationRepository.countSubmittedInYear(year);
        return `ENR-${year}-${String(count + 1).padStart(3, "0")}`;
    }
    validateEnrolmentData(data) {
        const errors = {};
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
exports.ManageEnrolmentApplicationsUseCase = ManageEnrolmentApplicationsUseCase;
