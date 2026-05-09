import type { StudentRegistration } from "../entities/StudentRegistration";
import type { StudentApprovalStatus } from "../entities/StudentRegistration";

export interface StudentRegistrationRepository {
  save(studentRegistration: StudentRegistration): Promise<StudentRegistration>;
  findByEmail(email: string): Promise<StudentRegistration | null>;
  findByUsername(username: string): Promise<StudentRegistration | null>;
  findByApprovalStatus(status: StudentApprovalStatus): Promise<StudentRegistration[]>;
  updateApprovalStatus(id: string, status: StudentApprovalStatus): Promise<StudentRegistration | null>;
}
