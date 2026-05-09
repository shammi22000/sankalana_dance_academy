import { randomUUID } from "crypto";

export type TeachingDay = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
export type TeacherApplicationStatus = "pending" | "approved" | "rejected";

export function normalizeTeacherApplicationStatus(status: unknown): TeacherApplicationStatus {
  return status === "approved" || status === "rejected" || status === "pending" ? status : "pending";
}

export interface TeacherRegistrationProps {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  username: string;
  danceStyles: string;
  experienceYears: number;
  qualifications: string;
  biography: string;
  availableDays: TeachingDay[];
  avatarFileName?: string;
  avatarImageDataUrl?: string;
  portfolioFileName?: string;
  passwordHash: string;
  accountRole: "teacher";
  applicationStatus: TeacherApplicationStatus;
  createdAt: Date;
}

export class TeacherRegistration {
  private constructor(private readonly props: TeacherRegistrationProps) {}

  static create(input: Omit<TeacherRegistrationProps, "id" | "accountRole" | "applicationStatus" | "createdAt">) {
    return new TeacherRegistration({
      ...input,
      id: randomUUID(),
      accountRole: "teacher",
      applicationStatus: "pending",
      createdAt: new Date(),
    });
  }

  static fromPersistence(input: TeacherRegistrationProps) {
    return new TeacherRegistration({
      ...input,
      availableDays: [...input.availableDays],
      applicationStatus: normalizeTeacherApplicationStatus(input.applicationStatus),
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

  get applicationStatus() {
    return this.props.applicationStatus;
  }

  toPersistence(): TeacherRegistrationProps {
    return {
      ...this.props,
      availableDays: [...this.props.availableDays],
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
      danceStyles: this.props.danceStyles,
      experienceYears: this.props.experienceYears,
      qualifications: this.props.qualifications,
      biography: this.props.biography,
      availableDays: this.props.availableDays,
      avatarFileName: this.props.avatarFileName,
      avatarImageDataUrl: this.props.avatarImageDataUrl,
      portfolioFileName: this.props.portfolioFileName,
      accountRole: this.props.accountRole,
      applicationStatus: this.props.applicationStatus,
      createdAt: this.props.createdAt.toISOString(),
    };
  }
}
