import type {
  EnrolmentApplication,
  EnrolmentData,
  TeacherReviewStatus,
} from "../../domain/entities/EnrolmentApplication";

export type { TeacherReviewStatus };

export interface CreateEnrolmentApplicationDTO {
  data?: EnrolmentData;
}

export interface TeacherEnrolmentDecisionDTO {
  status?: TeacherReviewStatus;
}

export type EnrolmentApplicationResponseDTO = ReturnType<EnrolmentApplication["toJSON"]>;
