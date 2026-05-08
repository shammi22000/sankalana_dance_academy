import { randomUUID } from "crypto";

export type TeachingDay = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
export type TeacherApplicationStatus = "draft" | "submitted";

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
  portfolioFileName?: string;
  passwordHash: string;
  accountRole: "teacher";
  applicationStatus: TeacherApplicationStatus;
  createdAt: Date;
}

export class TeacherRegistration {
  private constructor(private readonly props: TeacherRegistrationProps) {}

  static create(input: Omit<TeacherRegistrationProps, "id" | "accountRole" | "createdAt">) {
    return new TeacherRegistration({
      ...input,
      id: randomUUID(),
      accountRole: "teacher",
      createdAt: new Date(),
    });
  }

  static fromPersistence(input: TeacherRegistrationProps) {
    return new TeacherRegistration({
      ...input,
      availableDays: [...input.availableDays],
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
      portfolioFileName: this.props.portfolioFileName,
      accountRole: this.props.accountRole,
      applicationStatus: this.props.applicationStatus,
      createdAt: this.props.createdAt.toISOString(),
    };
  }
}
