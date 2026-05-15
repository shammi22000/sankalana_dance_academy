import type { StudentRegistrationApiResponse } from "../types/studentRegistration";
import type { TeachingDay } from "../types/teacherRegistration";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";
export const teacherClassCacheKey = "sankalanaTeacherCreatedClasses";
const teacherSessionKey = "sankalanaTeacherSession";

export interface TeacherClassPayload {
  className: string;
  danceStyle: string;
  classLevel: string;
  description: string;
  days: string[];
  startTime: string;
  endTime: string;
  studio: string;
  capacity: number;
  posterFileName: string;
  milestones: string[];
}

export interface TeacherClassRecord {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherUsername: string;
  teacherSpecialization: string;
  teacherExperienceYears: number;
  teacherBiography: string;
  teacherAvatarFileName?: string;
  teacherAvatarImageDataUrl?: string;
  className: string;
  danceStyle: string;
  classLevel: string;
  description: string;
  days: TeachingDay[];
  startTime: string;
  endTime: string;
  studio: string;
  capacity: number;
  posterFileName: string;
  milestones: string[];
  createdAt: string;
  updatedAt: string;
}

function readTeacherSession(): { teacher?: { id?: string }; session?: { token?: string } } | null {
  const storedSession = localStorage.getItem(teacherSessionKey);

  if (!storedSession) {
    return null;
  }

  try {
    return JSON.parse(storedSession) as { teacher?: { id?: string }; session?: { token?: string } };
  } catch {
    return null;
  }
}

function getTeacherHeaders(): Record<string, string> {
  const token = readTeacherSession()?.session?.token;

  return typeof token === "string" ? { Authorization: `Bearer ${token}` } : {};
}

function getCurrentTeacherId(): string | null {
  const teacherId = readTeacherSession()?.teacher?.id;

  return typeof teacherId === "string" ? teacherId : null;
}

function readCachedTeacherClasses(): TeacherClassRecord[] {
  if (typeof window === "undefined") {
    return [];
  }

  const storedClasses = window.localStorage.getItem(teacherClassCacheKey);

  if (!storedClasses) {
    return [];
  }

  try {
    const parsedClasses = JSON.parse(storedClasses) as TeacherClassRecord[];

    return Array.isArray(parsedClasses) ? parsedClasses.filter((classItem) => classItem.id) : [];
  } catch {
    window.localStorage.removeItem(teacherClassCacheKey);
    return [];
  }
}

function cacheTeacherClasses(classes: TeacherClassRecord[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(teacherClassCacheKey, JSON.stringify(classes));
}

function mergeCachedTeacherClasses(classes: TeacherClassRecord[], ownerTeacherId?: string | null) {
  const classIds = new Set(classes.map((classItem) => classItem.id));
  const ownerTeacherIds = new Set(classes.map((classItem) => classItem.teacherId).filter(Boolean));

  if (ownerTeacherId) {
    ownerTeacherIds.add(ownerTeacherId);
  }

  const cachedClasses = readCachedTeacherClasses().filter(
    (classItem) => !classIds.has(classItem.id) && !ownerTeacherIds.has(classItem.teacherId),
  );

  cacheTeacherClasses([...classes, ...cachedClasses]);
}

async function parseTeacherClassResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  const result = (await response.json().catch(() => null)) as StudentRegistrationApiResponse<T> | null;

  if (!response.ok || !result?.success || !result.data) {
    const details = result?.error?.details ? Object.values(result.error.details).join(" ") : "";
    throw new Error(`${result?.error?.message ?? fallbackMessage} ${details}`.trim());
  }

  return result.data;
}

export async function getAllTeacherClasses(): Promise<TeacherClassRecord[]> {
  const response = await fetch(`${API_BASE_URL}/classes`);
  const classes = await parseTeacherClassResponse<TeacherClassRecord[]>(
    response,
    "Unable to load teacher classes.",
  );

  cacheTeacherClasses(classes);

  return classes;
}

export async function getMyTeacherClasses(): Promise<TeacherClassRecord[]> {
  const response = await fetch(`${API_BASE_URL}/teacher/classes`, {
    headers: getTeacherHeaders(),
  });
  const classes = await parseTeacherClassResponse<TeacherClassRecord[]>(
    response,
    "Unable to load your classes.",
  );

  mergeCachedTeacherClasses(classes, getCurrentTeacherId());

  return classes;
}

export async function createTeacherClass(payload: TeacherClassPayload): Promise<TeacherClassRecord> {
  const response = await fetch(`${API_BASE_URL}/teacher/classes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getTeacherHeaders(),
    },
    body: JSON.stringify(payload),
  });
  const teacherClass = await parseTeacherClassResponse<TeacherClassRecord>(
    response,
    "Unable to save class.",
  );

  mergeCachedTeacherClasses([teacherClass], teacherClass.teacherId);

  return teacherClass;
}

export async function updateTeacherClass(
  id: string,
  payload: TeacherClassPayload,
): Promise<TeacherClassRecord> {
  const response = await fetch(`${API_BASE_URL}/teacher/classes/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getTeacherHeaders(),
    },
    body: JSON.stringify(payload),
  });
  const teacherClass = await parseTeacherClassResponse<TeacherClassRecord>(
    response,
    "Unable to update class.",
  );

  mergeCachedTeacherClasses([teacherClass], teacherClass.teacherId);

  return teacherClass;
}

export async function deleteTeacherClass(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/teacher/classes/${id}`, {
    method: "DELETE",
    headers: getTeacherHeaders(),
  });

  await parseTeacherClassResponse<{ id: string }>(response, "Unable to delete class.");
  cacheTeacherClasses(readCachedTeacherClasses().filter((classItem) => classItem.id !== id));
}
