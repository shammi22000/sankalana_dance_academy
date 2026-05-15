const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";
const teacherSessionKey = "sankalanaTeacherSession";
export const attendanceRecordsCacheKey = "sankalanaTeacherAttendanceRecords";
function getTeacherHeaders() {
    const storedSession = localStorage.getItem(teacherSessionKey);
    if (!storedSession) {
        return {};
    }
    try {
        const token = JSON.parse(storedSession)?.session?.token;
        return typeof token === "string" ? { Authorization: `Bearer ${token}` } : {};
    }
    catch {
        return {};
    }
}
function cacheAttendanceRecords(records) {
    localStorage.setItem(attendanceRecordsCacheKey, JSON.stringify(records));
}
async function parseApiResponse(response, fallbackMessage) {
    const result = (await response.json().catch(() => null));
    if (!response.ok || !result?.success || !result.data) {
        const details = result?.error?.details ? Object.values(result.error.details).join(" ") : "";
        throw new Error(`${result?.error?.message ?? fallbackMessage} ${details}`.trim());
    }
    return result.data;
}
export async function getTeacherAttendanceRecords() {
    const response = await fetch(`${API_BASE_URL}/teacher/attendance`, {
        headers: getTeacherHeaders(),
    });
    const records = await parseApiResponse(response, "Unable to load attendance records.");
    cacheAttendanceRecords(records);
    return records;
}
export async function saveTeacherAttendanceSession(payload) {
    const response = await fetch(`${API_BASE_URL}/teacher/attendance`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getTeacherHeaders(),
        },
        body: JSON.stringify(payload),
    });
    const records = await parseApiResponse(response, "Unable to save attendance.");
    return records;
}
