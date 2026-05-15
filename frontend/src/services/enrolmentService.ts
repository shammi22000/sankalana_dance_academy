import type { StudentRegistrationApiResponse } from "../types/studentRegistration";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";
const studentSessionKey = "sankalanaStudentSession";
const teacherSessionKey = "sankalanaTeacherSession";
export const submittedEnrolmentCacheKey = "sankalanaStudentEnrolmentSubmitted";
export const submittedEnrolmentApplicationsCacheKey = "sankalanaStudentEnrolmentApplications";

export type TeacherReviewStatus = "Pending Review" | "Approved" | "Rejected";

export interface EnrolmentData {
  danceStyleId: string;
  slotId: string;
  teacherId: string;
  personal: {
    fullName: string;
    dateOfBirth: string;
    gender: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    emergencyContact: string;
  };
  guardian: {
    fullName: string;
    phone: string;
    email: string;
    relationship: string;
    address: string;
    under18: "Yes" | "No";
  };
  confirmed: boolean;
}

export interface SubmittedEnrolment {
  applicationId: string;
  studentId?: string;
  status: TeacherReviewStatus;
  submittedAt: string;
  adminComment?: string;
  reviewedAt?: string;
  reviewedByTeacherId?: string;
  data: EnrolmentData;
}

function getBearerHeaders(storageKey: string): Record<string, string> {
  const storedSession = localStorage.getItem(storageKey);

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

function cacheStudentEnrolments(applications: SubmittedEnrolment[]) {
  if (applications.length > 0) {
    localStorage.setItem(submittedEnrolmentCacheKey, JSON.stringify(applications[0]));
  }

  localStorage.setItem(submittedEnrolmentApplicationsCacheKey, JSON.stringify(applications));
}

function mergeCachedStudentEnrolment(application: SubmittedEnrolment) {
  const storedApplications = localStorage.getItem(submittedEnrolmentApplicationsCacheKey);
  let applications: SubmittedEnrolment[] = [];

  if (storedApplications) {
    try {
      const parsedApplications = JSON.parse(storedApplications) as SubmittedEnrolment[];

      applications = Array.isArray(parsedApplications) ? parsedApplications : [];
    } catch {
      applications = [];
    }
  }

  cacheStudentEnrolments([
    application,
    ...applications.filter((currentApplication) => currentApplication.applicationId !== application.applicationId),
  ]);
}

async function parseApiResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  const result = (await response.json().catch(() => null)) as StudentRegistrationApiResponse<T> | null;

  if (!response.ok || !result?.success || !result.data) {
    const details = result?.error?.details ? Object.values(result.error.details).join(" ") : "";
    throw new Error(`${result?.error?.message ?? fallbackMessage} ${details}`.trim());
  }

  return result.data;
}

export async function createStudentEnrolment(data: EnrolmentData): Promise<SubmittedEnrolment> {
  const response = await fetch(`${API_BASE_URL}/student/enrolments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getBearerHeaders(studentSessionKey),
    },
    body: JSON.stringify({ data }),
  });
  const application = await parseApiResponse<SubmittedEnrolment>(response, "Unable to submit enrolment.");

  mergeCachedStudentEnrolment(application);

  return application;
}

export async function getStudentEnrolments(): Promise<SubmittedEnrolment[]> {
  const response = await fetch(`${API_BASE_URL}/student/enrolments`, {
    headers: getBearerHeaders(studentSessionKey),
  });
  const applications = await parseApiResponse<SubmittedEnrolment[]>(response, "Unable to load enrolments.");

  cacheStudentEnrolments(applications);

  return applications;
}

export async function getTeacherEnrolments(): Promise<SubmittedEnrolment[]> {
  const response = await fetch(`${API_BASE_URL}/teacher/enrolments`, {
    headers: getBearerHeaders(teacherSessionKey),
  });

  return parseApiResponse<SubmittedEnrolment[]>(response, "Unable to load enrolment requests.");
}

export async function updateTeacherEnrolmentStatus(
  applicationId: string,
  status: Exclude<TeacherReviewStatus, "Pending Review">,
): Promise<SubmittedEnrolment> {
  const response = await fetch(`${API_BASE_URL}/teacher/enrolments/${applicationId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getBearerHeaders(teacherSessionKey),
    },
    body: JSON.stringify({ status }),
  });

  return parseApiResponse<SubmittedEnrolment>(response, "Unable to update enrolment request.");
}
