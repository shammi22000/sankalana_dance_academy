export type TeacherReviewStatus = "Pending Review" | "Approved" | "Rejected";

export interface EnrolmentPersonalInfo {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  emergencyContact: string;
}

export interface EnrolmentGuardianInfo {
  fullName: string;
  phone: string;
  email: string;
  relationship: string;
  address: string;
  under18: "Yes" | "No";
}

export interface EnrolmentData {
  danceStyleId: string;
  slotId: string;
  teacherId: string;
  personal: EnrolmentPersonalInfo;
  guardian: EnrolmentGuardianInfo;
  confirmed: boolean;
}

export interface EnrolmentApplicationProps {
  applicationId: string;
  studentId: string;
  status: TeacherReviewStatus;
  submittedAt: Date;
  adminComment?: string;
  reviewedAt?: Date;
  reviewedByTeacherId?: string;
  data: EnrolmentData;
}

export class EnrolmentApplication {
  private constructor(private readonly props: EnrolmentApplicationProps) {}

  static create(input: Omit<EnrolmentApplicationProps, "status" | "submittedAt">) {
    return new EnrolmentApplication({
      ...input,
      status: "Pending Review",
      submittedAt: new Date(),
    });
  }

  static fromPersistence(input: EnrolmentApplicationProps) {
    return new EnrolmentApplication({
      ...input,
      submittedAt: new Date(input.submittedAt),
      reviewedAt: input.reviewedAt ? new Date(input.reviewedAt) : undefined,
      data: {
        ...input.data,
        personal: { ...input.data.personal },
        guardian: { ...input.data.guardian },
      },
    });
  }

  toPersistence(): EnrolmentApplicationProps {
    return {
      ...this.props,
      submittedAt: new Date(this.props.submittedAt),
      reviewedAt: this.props.reviewedAt ? new Date(this.props.reviewedAt) : undefined,
      data: {
        ...this.props.data,
        personal: { ...this.props.data.personal },
        guardian: { ...this.props.data.guardian },
      },
    };
  }

  toJSON() {
    return {
      applicationId: this.props.applicationId,
      studentId: this.props.studentId,
      status: this.props.status,
      submittedAt: this.props.submittedAt.toISOString(),
      adminComment: this.props.adminComment,
      reviewedAt: this.props.reviewedAt?.toISOString(),
      reviewedByTeacherId: this.props.reviewedByTeacherId,
      data: {
        ...this.props.data,
        personal: { ...this.props.data.personal },
        guardian: { ...this.props.data.guardian },
      },
    };
  }
}
