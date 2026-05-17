const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";
export const teacherClassCacheKey = "sankalanaTeacherCreatedClasses";
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
function getCurrentTeacherId() {
    const teacherId = readTeacherSession()?.teacher?.id;
    return typeof teacherId === "string" ? teacherId : null;
}
function readCachedTeacherClasses() {
    if (typeof window === "undefined") {
        return [];
    }
    const storedClasses = window.localStorage.getItem(teacherClassCacheKey);
    if (!storedClasses) {
        return [];
    }
    try {
        const parsedClasses = JSON.parse(storedClasses);
        return Array.isArray(parsedClasses) ? parsedClasses.filter((classItem) => classItem.id) : [];
    }
    catch {
        window.localStorage.removeItem(teacherClassCacheKey);
        return [];
    }
}
function cacheTeacherClasses(classes) {
    if (typeof window === "undefined") {
        return;
    }
    window.localStorage.setItem(teacherClassCacheKey, JSON.stringify(classes));
}
function mergeCachedTeacherClasses(classes, ownerTeacherId) {
    const classIds = new Set(classes.map((classItem) => classItem.id));
    const ownerTeacherIds = new Set(classes.map((classItem) => classItem.teacherId).filter(Boolean));
    if (ownerTeacherId) {
        ownerTeacherIds.add(ownerTeacherId);
    }
    const cachedClasses = readCachedTeacherClasses().filter((classItem) => !classIds.has(classItem.id) && !ownerTeacherIds.has(classItem.teacherId));
    cacheTeacherClasses([...classes, ...cachedClasses]);
}
async function parseTeacherClassResponse(response, fallbackMessage) {
    const result = (await response.json().catch(() => null));
    if (!response.ok || !result?.success || !result.data) {
        const details = result?.error?.details ? Object.values(result.error.details).join(" ") : "";
        throw new Error(`${result?.error?.message ?? fallbackMessage} ${details}`.trim());
    }
    return result.data;
}
export async function getAllTeacherClasses() {
    const response = await fetch(`${API_BASE_URL}/classes`);
    const classes = await parseTeacherClassResponse(response, "Unable to load teacher classes.");
    cacheTeacherClasses(classes);
    return classes;
}
export async function getMyTeacherClasses() {
    const response = await fetch(`${API_BASE_URL}/teacher/classes`, {
        headers: getTeacherHeaders(),
    });
    const classes = await parseTeacherClassResponse(response, "Unable to load your classes.");
    mergeCachedTeacherClasses(classes, getCurrentTeacherId());
    return classes;
}
export async function createTeacherClass(payload) {
    const response = await fetch(`${API_BASE_URL}/teacher/classes`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getTeacherHeaders(),
        },
        body: JSON.stringify(payload),
    });
    const teacherClass = await parseTeacherClassResponse(response, "Unable to save class.");
    mergeCachedTeacherClasses([teacherClass], teacherClass.teacherId);
    return teacherClass;
}
export async function updateTeacherClass(id, payload) {
    const response = await fetch(`${API_BASE_URL}/teacher/classes/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            ...getTeacherHeaders(),
        },
        body: JSON.stringify(payload),
    });
    const teacherClass = await parseTeacherClassResponse(response, "Unable to update class.");
    mergeCachedTeacherClasses([teacherClass], teacherClass.teacherId);
    return teacherClass;
}
export async function deleteTeacherClass(id) {
    const response = await fetch(`${API_BASE_URL}/teacher/classes/${id}`, {
        method: "DELETE",
        headers: getTeacherHeaders(),
    });
    await parseTeacherClassResponse(response, "Unable to delete class.");
    cacheTeacherClasses(readCachedTeacherClasses().filter((classItem) => classItem.id !== id));
}
