import { randomUUID } from "crypto";

export type StudentGender = "Female" | "Male" | "Other" | "Prefer not to say";
export type StudentApprovalStatus = "pending" | "approved" | "rejected";

export function normalizeStudentApprovalStatus(status: unknown): StudentApprovalStatus {
  return status === "approved" || status === "rejected" || status === "pending" ? status : "pending";
}

export interface StudentRegistrationProps {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  username: string;
  gender: StudentGender;
  dateOfBirth: string;
  passwordHash: string;
  accountRole: "student";
  approvalStatus: StudentApprovalStatus;
  createdAt: Date;
}

export class StudentRegistration {
  private constructor(private readonly props: StudentRegistrationProps) {}

  static create(input: Omit<StudentRegistrationProps, "id" | "accountRole" | "approvalStatus" | "createdAt">) {
    return new StudentRegistration({
      ...input,
      id: randomUUID(),
      accountRole: "student",
      approvalStatus: "pending",
      createdAt: new Date(),
    });
  }

  static fromPersistence(input: StudentRegistrationProps) {
    return new StudentRegistration({
      ...input,
      approvalStatus: normalizeStudentApprovalStatus(input.approvalStatus),
      createdAt: new Date(input.createdAt),
    });
  }

  get email() {
    return this.props.email;
  }

  get username() {
    return this.props.username;
  }

  get passwordHash() {
    return this.props.passwordHash;
  }

  get approvalStatus() {
    return this.props.approvalStatus;
  }

  toPersistence(): StudentRegistrationProps {
    return {
      ...this.props,
      createdAt: new Date(this.props.createdAt),
    };
  }

  toJSON() {
    return {
      id: this.props.id,
      fullName: this.props.fullName,
      email: this.props.email,
      phone: this.props.phone,
      username: this.props.username,
      gender: this.props.gender,
      dateOfBirth: this.props.dateOfBirth,
      accountRole: this.props.accountRole,
      approvalStatus: this.props.approvalStatus,
      createdAt: this.props.createdAt.toISOString(),
    };
  }
}
