import type { EnrolmentApplication } from "../entities/EnrolmentApplication";
import type { TeacherReviewStatus } from "../entities/EnrolmentApplication";

export interface EnrolmentDecisionUpdate {
  status: Exclude<TeacherReviewStatus, "Pending Review">;
  reviewedAt: Date;
  reviewedByTeacherId: string;
  adminComment: string;
}

export interface EnrolmentApplicationRepository {
  save(application: EnrolmentApplication): Promise<EnrolmentApplication>;
  findByStudentId(studentId: string): Promise<EnrolmentApplication[]>;
  findByTeacherId(teacherId: string): Promise<EnrolmentApplication[]>;
  findByApplicationId(applicationId: string): Promise<EnrolmentApplication | null>;
  updateTeacherDecision(
    applicationId: string,
    teacherId: string,
    update: EnrolmentDecisionUpdate,
  ): Promise<EnrolmentApplication | null>;
  countSubmittedInYear(year: number): Promise<number>;
}
