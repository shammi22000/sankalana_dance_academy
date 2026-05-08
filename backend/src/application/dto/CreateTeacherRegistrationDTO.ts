import type { TeacherApplicationStatus, TeachingDay } from "../../domain/entities/TeacherRegistration";

export interface CreateTeacherRegistrationDTO {
  fullName: string;
  email: string;
  phone: string;
  username: string;
  danceStyles: string;
  experienceYears: number | string;
  qualifications: string;
  biography: string;
  availableDays: TeachingDay[];
  portfolioFileName?: string;
  password: string;
  confirmPassword: string;
  applicationStatus?: TeacherApplicationStatus;
}

export interface TeacherRegistrationResponseDTO {
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
  accountRole: "teacher";
  applicationStatus: TeacherApplicationStatus;
  createdAt: string;
}
