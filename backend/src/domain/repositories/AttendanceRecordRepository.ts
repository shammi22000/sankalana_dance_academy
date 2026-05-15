import type { AttendanceRecord } from "../entities/AttendanceRecord";

export interface AttendanceRecordRepository {
  findByTeacherId(teacherId: string): Promise<AttendanceRecord[]>;
  replaceSession(
    teacherId: string,
    classId: string,
    date: string,
    records: AttendanceRecord[],
  ): Promise<AttendanceRecord[]>;
}
