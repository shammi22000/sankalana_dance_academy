export type AttendanceStatus = "present" | "absent" | "late";

export interface AttendanceRecordProps {
  id: string;
  teacherId: string;
  classId: string;
  className: string;
  date: string;
  studentId: string;
  studentName: string;
  status: AttendanceStatus;
  remarks: string;
  createdAt: Date;
  updatedAt: Date;
}

export class AttendanceRecord {
  private constructor(private readonly props: AttendanceRecordProps) {}

  static create(input: Omit<AttendanceRecordProps, "id" | "createdAt" | "updatedAt">) {
    const now = new Date();

    return new AttendanceRecord({
      ...input,
      id: [input.teacherId, input.classId, input.date, input.studentId].join(":"),
      createdAt: now,
      updatedAt: now,
    });
  }

  static fromPersistence(input: AttendanceRecordProps) {
    return new AttendanceRecord({
      ...input,
      createdAt: new Date(input.createdAt),
      updatedAt: new Date(input.updatedAt),
    });
  }

  toPersistence(): AttendanceRecordProps {
    return {
      ...this.props,
      createdAt: new Date(this.props.createdAt),
      updatedAt: new Date(this.props.updatedAt),
    };
  }

  toJSON() {
    return {
      id: this.props.id,
      teacherId: this.props.teacherId,
      classId: this.props.classId,
      className: this.props.className,
      date: this.props.date,
      studentId: this.props.studentId,
      studentName: this.props.studentName,
      status: this.props.status,
      remarks: this.props.remarks,
      createdAt: this.props.createdAt.toISOString(),
      updatedAt: this.props.updatedAt.toISOString(),
    };
  }
}
