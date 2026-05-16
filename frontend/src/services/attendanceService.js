const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";
const teacherSessionKey = "sankalanaTeacherSession";
const studentSessionKey = "sankalanaStudentSession";
export const attendanceRecordsCacheKey = "sankalanaTeacherAttendanceRecords";
export const studentAttendanceRecordsCacheKey = "sankalanaStudentAttendanceRecords";
function getBearerHeaders(storageKey) {
    const storedSession = localStorage.getItem(storageKey);
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
function getTeacherHeaders() {
    return getBearerHeaders(teacherSessionKey);
}
function getStudentHeaders() {
    return getBearerHeaders(studentSessionKey);
}
function cacheAttendanceRecords(records) {
    localStorage.setItem(attendanceRecordsCacheKey, JSON.stringify(records));
}
function cacheStudentAttendanceRecords(records) {
    localStorage.setItem(studentAttendanceRecordsCacheKey, JSON.stringify(records));
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
export async function getStudentAttendanceRecords() {
    const response = await fetch(`${API_BASE_URL}/student/attendance`, {
        headers: getStudentHeaders(),
    });
    const records = await parseApiResponse(response, "Unable to load attendance records.");
    cacheStudentAttendanceRecords(records);
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
export async function updateTeacherAttendanceRecord(recordId, payload) {
    const response = await fetch(`${API_BASE_URL}/teacher/attendance/record`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            ...getTeacherHeaders(),
        },
        body: JSON.stringify({
            id: recordId,
            ...payload,
        }),
    });
    return parseApiResponse(response, "Unable to update attendance record.");
}
