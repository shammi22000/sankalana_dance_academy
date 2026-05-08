import type { StudentAuthentication, TeacherAuthentication } from "../types/auth";

const studentSessionKey = "sankalanaStudentSession";
const teacherSessionKey = "sankalanaTeacherSession";

function readStoredSession<T>(key: string): T | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedSession = window.localStorage.getItem(key);

  if (!storedSession) {
    return null;
  }

  try {
    return JSON.parse(storedSession) as T;
  } catch {
    window.localStorage.removeItem(key);
    return null;
  }
}

function getSessionTime(issuedAt?: string) {
  const timestamp = issuedAt ? new Date(issuedAt).getTime() : 0;

  return Number.isNaN(timestamp) ? 0 : timestamp;
}

export function getDashboardPath() {
  const studentSession = readStoredSession<StudentAuthentication>(studentSessionKey);
  const teacherSession = readStoredSession<TeacherAuthentication>(teacherSessionKey);

  if (studentSession && teacherSession) {
    return getSessionTime(teacherSession.session.issuedAt) > getSessionTime(studentSession.session.issuedAt)
      ? "/teacher-dashboard"
      : "/student-dashboard";
  }

  if (teacherSession) {
    return "/teacher-dashboard";
  }

  if (studentSession) {
    return "/student-dashboard";
  }

  return null;
}
