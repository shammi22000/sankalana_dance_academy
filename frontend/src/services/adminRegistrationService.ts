import type {
  StudentApprovalStatus,
  StudentRegistration,
  StudentRegistrationApiResponse,
  StudentRegistrationProfilePayload,
} from "../types/studentRegistration";
import type { TeacherApplicationStatus, TeacherRegistration, TeacherRegistrationPayload } from "../types/teacherRegistration";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";
const adminSessionKey = "sankalanaAdminSession";

export interface PendingRegistrations {
  students: StudentRegistration[];
  teachers: TeacherRegistration[];
}

function getAdminHeaders(): Record<string, string> {
  const storedSession = localStorage.getItem(adminSessionKey);

  if (!storedSession) {
    return {};
  }

  try {
    const token = JSON.parse(storedSession)?.session?.token;

    return typeof token === "string" ? { Authorization: `Bearer ${token}` } : {};
  } catch {
    return {};
  }
}

export async function getPendingRegistrations(): Promise<PendingRegistrations> {
  const response = await fetch(`${API_BASE_URL}/admin/registrations/pending`, {
    headers: getAdminHeaders(),
  });
  const result = (await response.json().catch(() => null)) as
    | StudentRegistrationApiResponse<PendingRegistrations>
    | null;

  if (!response.ok || !result?.success || !result.data) {
    throw new Error(result?.error?.message ?? "Unable to load pending registrations.");
  }

  return result.data;
}

export async function getTeacherRegistrations(): Promise<TeacherRegistration[]> {
  const response = await fetch(`${API_BASE_URL}/admin/teacher-registrations`, {
    headers: getAdminHeaders(),
  });
  const result = (await response.json().catch(() => null)) as
    | StudentRegistrationApiResponse<TeacherRegistration[]>
    | null;

  if (!response.ok || !result?.success || !result.data) {
    throw new Error(result?.error?.message ?? "Unable to load teacher registrations.");
  }

  return result.data;
}

export async function getStudentRegistrations(): Promise<StudentRegistration[]> {
  const response = await fetch(`${API_BASE_URL}/admin/student-registrations`, {
    headers: getAdminHeaders(),
  });
  const result = (await response.json().catch(() => null)) as
    | StudentRegistrationApiResponse<StudentRegistration[]>
    | null;

  if (!response.ok || !result?.success || !result.data) {
    throw new Error(result?.error?.message ?? "Unable to load student registrations.");
  }

  return result.data;
}

export async function createTeacherRegistration(payload: TeacherRegistrationPayload): Promise<TeacherRegistration> {
  const response = await fetch(`${API_BASE_URL}/admin/teacher-registrations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAdminHeaders(),
    },
    body: JSON.stringify(payload),
  });
  const result = (await response.json().catch(() => null)) as
    | StudentRegistrationApiResponse<TeacherRegistration>
    | null;

  if (!response.ok || !result?.success || !result.data) {
    const details = result?.error?.details ? Object.values(result.error.details).join(" ") : "";
    throw new Error(`${result?.error?.message ?? "Unable to create teacher."} ${details}`.trim());
  }

  return result.data;
}

export async function updateStudentRegistrationProfile(
  id: string,
  payload: StudentRegistrationProfilePayload,
): Promise<StudentRegistration> {
  const response = await fetch(`${API_BASE_URL}/admin/student-registrations/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAdminHeaders(),
    },
    body: JSON.stringify(payload),
  });
  const result = (await response.json().catch(() => null)) as
    | StudentRegistrationApiResponse<StudentRegistration>
    | null;

  if (!response.ok || !result?.success || !result.data) {
    const details = result?.error?.details ? Object.values(result.error.details).join(" ") : "";
    throw new Error(`${result?.error?.message ?? "Unable to update student profile."} ${details}`.trim());
  }

  return result.data;
}

export async function updateStudentApprovalStatus(
  id: string,
  status: StudentApprovalStatus,
): Promise<StudentRegistration> {
  const response = await fetch(`${API_BASE_URL}/admin/student-registrations/${id}/approval`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAdminHeaders(),
    },
    body: JSON.stringify({ status }),
  });
  const result = (await response.json().catch(() => null)) as
    | StudentRegistrationApiResponse<StudentRegistration>
    | null;

  if (!response.ok || !result?.success || !result.data) {
    const details = result?.error?.details ? Object.values(result.error.details).join(" ") : "";
    throw new Error(`${result?.error?.message ?? "Unable to update student registration."} ${details}`.trim());
  }

  return result.data;
}

export async function updateTeacherApplicationStatus(
  id: string,
  status: TeacherApplicationStatus,
): Promise<TeacherRegistration> {
  const response = await fetch(`${API_BASE_URL}/admin/teacher-registrations/${id}/approval`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAdminHeaders(),
    },
    body: JSON.stringify({ status }),
  });
  const result = (await response.json().catch(() => null)) as
    | StudentRegistrationApiResponse<TeacherRegistration>
    | null;

  if (!response.ok || !result?.success || !result.data) {
    const details = result?.error?.details ? Object.values(result.error.details).join(" ") : "";
    throw new Error(`${result?.error?.message ?? "Unable to update teacher registration."} ${details}`.trim());
  }

  return result.data;
}
