import type { TeacherClass } from "../entities/TeacherClass";
import type { TeachingDay } from "../entities/TeacherRegistration";

export interface TeacherClassUpdate {
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
  updatedAt: Date;
}

export interface TeacherClassRepository {
  save(teacherClass: TeacherClass): Promise<TeacherClass>;
  findAll(): Promise<TeacherClass[]>;
  findByTeacherId(teacherId: string): Promise<TeacherClass[]>;
  findById(id: string): Promise<TeacherClass | null>;
  update(id: string, teacherId: string, update: TeacherClassUpdate): Promise<TeacherClass | null>;
  delete(id: string, teacherId: string): Promise<boolean>;
}
