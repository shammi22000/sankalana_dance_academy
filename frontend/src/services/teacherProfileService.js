const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";
const teacherSessionKey = "sankalanaTeacherSession";
function readTeacherSession() {
    const storedSession = localStorage.getItem(teacherSessionKey);
    if (!storedSession) {
        return null;
    }
    try {
        return JSON.parse(storedSession);
    }
    catch {
        return null;
    }
}
function getTeacherHeaders() {
    const token = readTeacherSession()?.session?.token;
    return typeof token === "string" ? { Authorization: `Bearer ${token}` } : {};
}
export function persistTeacherProfile(teacher) {
    const currentSession = readTeacherSession();
    if (!currentSession) {
        return;
    }
    localStorage.setItem(teacherSessionKey, JSON.stringify({
        ...currentSession,
        teacher,
    }));
}
export async function updateTeacherProfile(payload) {
    const response = await fetch(`${API_BASE_URL}/teacher/profile`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            ...getTeacherHeaders(),
        },
        body: JSON.stringify(payload),
    });
    const result = (await response.json().catch(() => null));
    if (!response.ok || !result?.success || !result.data) {
        const details = result?.error?.details ? Object.values(result.error.details).join(" ") : "";
        throw new Error(`${result?.error?.message ?? "Unable to update teacher profile."} ${details}`.trim());
    }
    persistTeacherProfile(result.data);
    return result.data;
}
