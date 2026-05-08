import { randomUUID } from "crypto";

export type StudentGender = "Female" | "Male" | "Other" | "Prefer not to say";

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
  createdAt: Date;
}

export class StudentRegistration {
  private constructor(private readonly props: StudentRegistrationProps) {}

  static create(input: Omit<StudentRegistrationProps, "id" | "accountRole" | "createdAt">) {
    return new StudentRegistration({
      ...input,
      id: randomUUID(),
      accountRole: "student",
      createdAt: new Date(),
    });
  }

  static fromPersistence(input: StudentRegistrationProps) {
    return new StudentRegistration({
      ...input,
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
      createdAt: this.props.createdAt.toISOString(),
    };
  }
}
