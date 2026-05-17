import { AttendanceRecord, type AttendanceRecordProps } from "../../domain/entities/AttendanceRecord";
import type { AttendanceRecordRepository } from "../../domain/repositories/AttendanceRecordRepository";
import type { AttendanceRecordDocument, MongoDatabase } from "../database/MongoDatabase";

export class MongoAttendanceRecordRepository implements AttendanceRecordRepository {
  constructor(private readonly database: MongoDatabase) {}

  async findByTeacherId(teacherId: string): Promise<AttendanceRecord[]> {
    const collection = await this.database.collection<AttendanceRecordDocument>("attendanceRecords");
    const documents = await collection.find({ teacherId }).sort({ date: -1, updatedAt: -1 }).toArray();

    return documents.map((document) => this.toEntity(document));
  }

  async replaceSession(
    teacherId: string,
    classId: string,
    date: string,
    records: AttendanceRecord[],
  ): Promise<AttendanceRecord[]> {
    const collection = await this.database.collection<AttendanceRecordDocument>("attendanceRecords");
    const documents = records.map((record) => record.toPersistence());

    await collection.deleteMany({ teacherId, classId, date });

    if (documents.length > 0) {
      await collection.insertMany(documents);
    }

    return documents.map((document) => AttendanceRecord.fromPersistence(document));
  }

  private toEntity(document: AttendanceRecordDocument): AttendanceRecord {
    const props: AttendanceRecordProps = {
      id: document.id,
      teacherId: document.teacherId,
      classId: document.classId,
      className: document.className,
      date: document.date,
      studentId: document.studentId,
      studentName: document.studentName,
      status: document.status,
      remarks: document.remarks,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };

    return AttendanceRecord.fromPersistence(props);
  }
}
