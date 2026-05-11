import type { StudentRegistration } from "../entities/StudentRegistration";
import type { StudentApprovalStatus, StudentGender } from "../entities/StudentRegistration";

export interface StudentRegistrationProfileUpdate {
  fullName: string;
  email: string;
  phone: string;
  username: string;
  gender: StudentGender;
  dateOfBirth: string;
}

export interface StudentRegistrationRepository {
  save(studentRegistration: StudentRegistration): Promise<StudentRegistration>;
  findAll(): Promise<StudentRegistration[]>;
  findById(id: string): Promise<StudentRegistration | null>;
  findByEmail(email: string): Promise<StudentRegistration | null>;
  findByUsername(username: string): Promise<StudentRegistration | null>;
  findByApprovalStatus(status: StudentApprovalStatus): Promise<StudentRegistration[]>;
  updateProfile(id: string, profile: StudentRegistrationProfileUpdate): Promise<StudentRegistration | null>;
  updateApprovalStatus(id: string, status: StudentApprovalStatus): Promise<StudentRegistration | null>;
}
