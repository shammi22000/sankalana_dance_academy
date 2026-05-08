import type { StudentRegistration } from "../entities/StudentRegistration";

export interface StudentRegistrationRepository {
  save(studentRegistration: StudentRegistration): Promise<StudentRegistration>;
  findByEmail(email: string): Promise<StudentRegistration | null>;
  findByUsername(username: string): Promise<StudentRegistration | null>;
}
