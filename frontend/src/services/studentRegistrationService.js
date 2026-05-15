const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";
export async function registerStudent(payload) {
    const response = await fetch(`${API_BASE_URL}/student-registrations`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });
    const result = (await response.json().catch(() => null));
    if (!response.ok || !result?.success || !result.data) {
        const details = result?.error?.details ? Object.values(result.error.details).join(" ") : "";
        throw new Error(`${result?.error?.message ?? "Unable to register student."} ${details}`.trim());
    }
    return result.data;
}
