import type { AttendanceRecord, AttendanceStatus } from "../../domain/entities/AttendanceRecord";

export interface AttendanceEntryDTO {
  studentId?: string;
  studentName?: string;
  status?: AttendanceStatus;
  remarks?: string;
}

export interface SaveAttendanceSessionDTO {
  classId?: string;
  className?: string;
  date?: string;
  records?: AttendanceEntryDTO[];
}

export type AttendanceRecordResponseDTO = ReturnType<AttendanceRecord["toJSON"]>;
