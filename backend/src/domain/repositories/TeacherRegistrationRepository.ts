import type { TeacherRegistration } from "../entities/TeacherRegistration";
import type { TeacherApplicationStatus } from "../entities/TeacherRegistration";

export interface TeacherRegistrationRepository {
  save(teacherRegistration: TeacherRegistration): Promise<TeacherRegistration>;
  findAll(): Promise<TeacherRegistration[]>;
  findById(id: string): Promise<TeacherRegistration | null>;
  findByEmail(email: string): Promise<TeacherRegistration | null>;
  findByUsername(username: string): Promise<TeacherRegistration | null>;
  findByApplicationStatus(status: TeacherApplicationStatus): Promise<TeacherRegistration[]>;
  updateApplicationStatus(id: string, status: TeacherApplicationStatus): Promise<TeacherRegistration | null>;
  updatePasswordHash(id: string, passwordHash: string): Promise<TeacherRegistration | null>;
}
