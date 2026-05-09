import type { AdminAuthentication, LoginCredentials, StudentAuthentication, TeacherAuthentication } from "../types/auth";
import type { StudentRegistrationApiResponse } from "../types/studentRegistration";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";

interface AdminLoginCredentials {
  username: string;
  password: string;
}

export async function loginStudent(credentials: LoginCredentials): Promise<StudentAuthentication> {
  const response = await fetch(`${API_BASE_URL}/auth/student/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const result = (await response.json().catch(() => null)) as
    | StudentRegistrationApiResponse<StudentAuthentication>
    | null;

  if (!response.ok || !result?.success || !result.data) {
    const details = result?.error?.details ? Object.values(result.error.details).join(" ") : "";
    throw new Error(`${result?.error?.message ?? "Unable to login."} ${details}`.trim());
  }

  return result.data;
}

export async function loginTeacher(credentials: LoginCredentials): Promise<TeacherAuthentication> {
  const response = await fetch(`${API_BASE_URL}/auth/teacher/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const result = (await response.json().catch(() => null)) as
    | StudentRegistrationApiResponse<TeacherAuthentication>
    | null;

  if (!response.ok || !result?.success || !result.data) {
    const details = result?.error?.details ? Object.values(result.error.details).join(" ") : "";
    throw new Error(`${result?.error?.message ?? "Unable to login."} ${details}`.trim());
  }

  return result.data;
}

export async function loginAdmin(credentials: AdminLoginCredentials): Promise<AdminAuthentication> {
  const response = await fetch(`${API_BASE_URL}/auth/admin/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  const result = (await response.json().catch(() => null)) as
    | StudentRegistrationApiResponse<AdminAuthentication>
    | null;

  if (!response.ok || !result?.success || !result.data) {
    const details = result?.error?.details ? Object.values(result.error.details).join(" ") : "";
    throw new Error(`${result?.error?.message ?? "Unable to login."} ${details}`.trim());
  }

  return result.data;
}
