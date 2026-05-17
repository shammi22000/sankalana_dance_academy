const studentSessionKey = "sankalanaStudentSession";
const teacherSessionKey = "sankalanaTeacherSession";
function readStoredSession(key) {
    if (typeof window === "undefined") {
        return null;
    }
    const storedSession = window.localStorage.getItem(key);
    if (!storedSession) {
        return null;
    }
    try {
        return JSON.parse(storedSession);
    }
    catch {
        window.localStorage.removeItem(key);
        return null;
    }
}
function getSessionTime(issuedAt) {
    const timestamp = issuedAt ? new Date(issuedAt).getTime() : 0;
    return Number.isNaN(timestamp) ? 0 : timestamp;
}
export function getDashboardPath() {
    const studentSession = readStoredSession(studentSessionKey);
    const teacherSession = readStoredSession(teacherSessionKey);
    const sessions = [
        studentSession ? { path: "/student-dashboard", issuedAt: studentSession.session.issuedAt } : null,
        teacherSession ? { path: "/teacher-dashboard", issuedAt: teacherSession.session.issuedAt } : null,
    ].filter((session) => Boolean(session));
    if (sessions.length > 0) {
        return sessions.sort((first, second) => getSessionTime(second.issuedAt) - getSessionTime(first.issuedAt))[0].path;
    }
    return null;
}
