import type { AdminAuthentication, StudentAuthentication, TeacherAuthentication } from "../types/auth";

const studentSessionKey = "sankalanaStudentSession";
const teacherSessionKey = "sankalanaTeacherSession";
const adminSessionKey = "sankalanaAdminSession";

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
  const adminSession = readStoredSession<AdminAuthentication>(adminSessionKey);
  const sessions = [
    studentSession ? { path: "/student-dashboard", issuedAt: studentSession.session.issuedAt } : null,
    teacherSession ? { path: "/teacher-dashboard", issuedAt: teacherSession.session.issuedAt } : null,
    adminSession ? { path: "/admin-dashboard", issuedAt: adminSession.session.issuedAt } : null,
  ].filter((session): session is { path: string; issuedAt: string } => Boolean(session));

  if (sessions.length > 0) {
    return sessions.sort((first, second) => getSessionTime(second.issuedAt) - getSessionTime(first.issuedAt))[0].path;
  }

  return null;
}
