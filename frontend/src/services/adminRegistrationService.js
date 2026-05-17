const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";
const adminSessionKey = "sankalanaAdminSession";
function getAdminHeaders() {
    const storedSession = localStorage.getItem(adminSessionKey);
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
export async function getPendingRegistrations() {
    const response = await fetch(`${API_BASE_URL}/admin/registrations/pending`, {
        headers: getAdminHeaders(),
    });
    const result = (await response.json().catch(() => null));
    if (!response.ok || !result?.success || !result.data) {
        throw new Error(result?.error?.message ?? "Unable to load pending registrations.");
    }
    return result.data;
}
export async function getTeacherRegistrations() {
    const response = await fetch(`${API_BASE_URL}/admin/teacher-registrations`, {
        headers: getAdminHeaders(),
    });
    const result = (await response.json().catch(() => null));
    if (!response.ok || !result?.success || !result.data) {
        throw new Error(result?.error?.message ?? "Unable to load teacher registrations.");
    }
    return result.data;
}
export async function getStudentRegistrations() {
    const response = await fetch(`${API_BASE_URL}/admin/student-registrations`, {
        headers: getAdminHeaders(),
    });
    const result = (await response.json().catch(() => null));
    if (!response.ok || !result?.success || !result.data) {
        throw new Error(result?.error?.message ?? "Unable to load student registrations.");
    }
    return result.data;
}
export async function getAdminEnrolments() {
    const response = await fetch(`${API_BASE_URL}/admin/enrolments`, {
        headers: getAdminHeaders(),
    });
    const result = (await response.json().catch(() => null));
    if (!response.ok || !result?.success || !result.data) {
        throw new Error(result?.error?.message ?? "Unable to load enrolments.");
    }
    return result.data;
}
export async function createTeacherRegistration(payload) {
    const response = await fetch(`${API_BASE_URL}/admin/teacher-registrations`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...getAdminHeaders(),
        },
        body: JSON.stringify(payload),
    });
    const result = (await response.json().catch(() => null));
    if (!response.ok || !result?.success || !result.data) {
        const details = result?.error?.details ? Object.values(result.error.details).join(" ") : "";
        throw new Error(`${result?.error?.message ?? "Unable to create teacher."} ${details}`.trim());
    }
    return result.data;
}
export async function updateStudentRegistrationProfile(id, payload) {
    const response = await fetch(`${API_BASE_URL}/admin/student-registrations/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            ...getAdminHeaders(),
        },
        body: JSON.stringify(payload),
    });
    const result = (await response.json().catch(() => null));
    if (!response.ok || !result?.success || !result.data) {
        const details = result?.error?.details ? Object.values(result.error.details).join(" ") : "";
        throw new Error(`${result?.error?.message ?? "Unable to update student profile."} ${details}`.trim());
    }
    return result.data;
}
export async function updateStudentApprovalStatus(id, status) {
    const response = await fetch(`${API_BASE_URL}/admin/student-registrations/${id}/approval`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            ...getAdminHeaders(),
        },
        body: JSON.stringify({ status }),
    });
    const result = (await response.json().catch(() => null));
    if (!response.ok || !result?.success || !result.data) {
        const details = result?.error?.details ? Object.values(result.error.details).join(" ") : "";
        throw new Error(`${result?.error?.message ?? "Unable to update student registration."} ${details}`.trim());
    }
    return result.data;
}
export async function updateStudentPassword(id, payload) {
    const response = await fetch(`${API_BASE_URL}/admin/student-registrations/${id}/password`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            ...getAdminHeaders(),
        },
        body: JSON.stringify(payload),
    });
    const result = (await response.json().catch(() => null));
    if (!response.ok || !result?.success || !result.data) {
        const details = result?.error?.details ? Object.values(result.error.details).join(" ") : "";
        throw new Error(`${result?.error?.message ?? "Unable to update student password."} ${details}`.trim());
    }
    return result.data;
}
export async function updateTeacherApplicationStatus(id, status) {
    const response = await fetch(`${API_BASE_URL}/admin/teacher-registrations/${id}/approval`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            ...getAdminHeaders(),
        },
        body: JSON.stringify({ status }),
    });
    const result = (await response.json().catch(() => null));
    if (!response.ok || !result?.success || !result.data) {
        const details = result?.error?.details ? Object.values(result.error.details).join(" ") : "";
        throw new Error(`${result?.error?.message ?? "Unable to update teacher registration."} ${details}`.trim());
    }
    return result.data;
}
export async function updateTeacherPassword(id, payload) {
    const response = await fetch(`${API_BASE_URL}/admin/teacher-registrations/${id}/password`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            ...getAdminHeaders(),
        },
        body: JSON.stringify(payload),
    });
    const result = (await response.json().catch(() => null));
    if (!response.ok || !result?.success || !result.data) {
        const details = result?.error?.details ? Object.values(result.error.details).join(" ") : "";
        throw new Error(`${result?.error?.message ?? "Unable to update teacher password."} ${details}`.trim());
    }
    return result.data;
}
