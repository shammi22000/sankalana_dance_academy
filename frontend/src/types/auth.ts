import type { StudentRegistration } from "./studentRegistration";
import type { TeacherRegistration } from "./teacherRegistration";

export interface LoginCredentials {
  identity: string;
  password: string;
}

export interface StudentAuthentication {
  student: StudentRegistration;
  session: {
    token: string;
    issuedAt: string;
  };
}

export interface TeacherAuthentication {
  teacher: TeacherRegistration;
  session: {
    token: string;
    issuedAt: string;
  };
}

export interface AdminAuthentication {
  admin: {
    username: string;
    displayName: string;
    role: "admin";
  };
  session: {
    token: string;
    issuedAt: string;
  };
}
