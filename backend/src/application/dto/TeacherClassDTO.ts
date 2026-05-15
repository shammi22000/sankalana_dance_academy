import type { TeacherClass } from "../../domain/entities/TeacherClass";
import type { TeachingDay } from "../../domain/entities/TeacherRegistration";

export interface TeacherClassPayloadDTO {
  className?: string;
  danceStyle?: string;
  classLevel?: string;
  description?: string;
  days?: TeachingDay[];
  startTime?: string;
  endTime?: string;
  studio?: string;
  capacity?: number;
  posterFileName?: string;
  milestones?: string[];
}

export type TeacherClassResponseDTO = ReturnType<TeacherClass["toJSON"]>;
