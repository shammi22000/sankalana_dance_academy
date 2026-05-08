export type TeachingDay = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
export type TeacherApplicationStatus = "draft" | "submitted";

export interface TeacherRegistrationPayload {
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
  password: string;
  confirmPassword: string;
  applicationStatus: TeacherApplicationStatus;
}

export interface TeacherRegistration {
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
