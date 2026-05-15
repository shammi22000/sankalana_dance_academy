import type { StudentRegistrationApiResponse } from "../types/studentRegistration";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";
const teacherSessionKey = "sankalanaTeacherSession";
export const attendanceRecordsCacheKey = "sankalanaTeacherAttendanceRecords";

export type AttendanceStatus = "present" | "absent" | "late";

export interface AttendanceRecord {
  id: string;
  teacherId?: string;
  classId: string;
  className: string;
  date: string;
  studentId: string;
  studentName: string;
  status: AttendanceStatus;
  remarks: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AttendanceSessionPayload {
  classId: string;
  className: string;
  date: string;
  records: Array<{
    studentId: string;
    studentName: string;
    status: AttendanceStatus;
    remarks: string;
  }>;
}

function getTeacherHeaders(): Record<string, string> {
  const storedSession = localStorage.getItem(teacherSessionKey);

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

function cacheAttendanceRecords(records: AttendanceRecord[]) {
  localStorage.setItem(attendanceRecordsCacheKey, JSON.stringify(records));
}

async function parseApiResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  const result = (await response.json().catch(() => null)) as StudentRegistrationApiResponse<T> | null;

  if (!response.ok || !result?.success || !result.data) {
    const details = result?.error?.details ? Object.values(result.error.details).join(" ") : "";
    throw new Error(`${result?.error?.message ?? fallbackMessage} ${details}`.trim());
  }

  return result.data;
}

export async function getTeacherAttendanceRecords(): Promise<AttendanceRecord[]> {
  const response = await fetch(`${API_BASE_URL}/teacher/attendance`, {
    headers: getTeacherHeaders(),
  });
  const records = await parseApiResponse<AttendanceRecord[]>(response, "Unable to load attendance records.");

  cacheAttendanceRecords(records);

  return records;
}

export async function saveTeacherAttendanceSession(
  payload: AttendanceSessionPayload,
): Promise<AttendanceRecord[]> {
  const response = await fetch(`${API_BASE_URL}/teacher/attendance`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getTeacherHeaders(),
    },
    body: JSON.stringify(payload),
  });
  const records = await parseApiResponse<AttendanceRecord[]>(response, "Unable to save attendance.");

  return records;
}
