export type StudentGender = "Female" | "Male" | "Other" | "Prefer not to say";
export type StudentApprovalStatus = "pending" | "approved" | "rejected";

export interface StudentRegistrationPayload {
  fullName: string;
  email: string;
  phone: string;
  username: string;
  gender: StudentGender;
  dateOfBirth: string;
  password: string;
  confirmPassword: string;
}

export interface StudentRegistration {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  username: string;
  gender: StudentGender;
  dateOfBirth: string;
  accountRole: "student";
  approvalStatus: StudentApprovalStatus;
  createdAt: string;
}

export interface StudentRegistrationApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: Record<string, string>;
  };
}
