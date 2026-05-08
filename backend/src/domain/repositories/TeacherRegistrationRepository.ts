import type { TeacherRegistration } from "../entities/TeacherRegistration";

export interface TeacherRegistrationRepository {
  save(teacherRegistration: TeacherRegistration): Promise<TeacherRegistration>;
  findByEmail(email: string): Promise<TeacherRegistration | null>;
  findByUsername(username: string): Promise<TeacherRegistration | null>;
}
