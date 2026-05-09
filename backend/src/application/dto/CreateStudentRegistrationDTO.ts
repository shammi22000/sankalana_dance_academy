import type { StudentApprovalStatus, StudentGender } from "../../domain/entities/StudentRegistration";

export interface CreateStudentRegistrationDTO {
  fullName: string;
  email: string;
  phone: string;
  username: string;
  gender: StudentGender;
  dateOfBirth: string;
  password: string;
  confirmPassword: string;
}

export interface StudentRegistrationResponseDTO {
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
