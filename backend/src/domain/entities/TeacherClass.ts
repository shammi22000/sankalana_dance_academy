import { randomUUID } from "crypto";
import type { TeachingDay } from "./TeacherRegistration";

export interface TeacherClassProps {
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
  createdAt: Date;
  updatedAt: Date;
}

export class TeacherClass {
  private constructor(private readonly props: TeacherClassProps) {}

  static create(input: Omit<TeacherClassProps, "id" | "createdAt" | "updatedAt">) {
    const now = new Date();

    return new TeacherClass({
      ...input,
      id: randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
  }

  static fromPersistence(input: TeacherClassProps) {
    return new TeacherClass({
      ...input,
      days: [...input.days],
      milestones: [...input.milestones],
      createdAt: new Date(input.createdAt),
      updatedAt: new Date(input.updatedAt),
    });
  }

  get id() {
    return this.props.id;
  }

  get teacherId() {
    return this.props.teacherId;
  }

  toPersistence(): TeacherClassProps {
    return {
      ...this.props,
      days: [...this.props.days],
      milestones: [...this.props.milestones],
      createdAt: new Date(this.props.createdAt),
      updatedAt: new Date(this.props.updatedAt),
    };
  }

  toJSON() {
    return {
      id: this.props.id,
      teacherId: this.props.teacherId,
      teacherName: this.props.teacherName,
      teacherUsername: this.props.teacherUsername,
      teacherSpecialization: this.props.teacherSpecialization,
      teacherExperienceYears: this.props.teacherExperienceYears,
      teacherBiography: this.props.teacherBiography,
      teacherAvatarFileName: this.props.teacherAvatarFileName,
      teacherAvatarImageDataUrl: this.props.teacherAvatarImageDataUrl,
      className: this.props.className,
      danceStyle: this.props.danceStyle,
      classLevel: this.props.classLevel,
      description: this.props.description,
      days: [...this.props.days],
      startTime: this.props.startTime,
      endTime: this.props.endTime,
      studio: this.props.studio,
      capacity: this.props.capacity,
      posterFileName: this.props.posterFileName,
      milestones: [...this.props.milestones],
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }
}
