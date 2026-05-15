import { MongoClient, type Collection, type Db } from "mongodb";
import { env } from "../../config/env";
import type { AttendanceRecordProps } from "../../domain/entities/AttendanceRecord";
import type { ContactInquiryProps } from "../../domain/entities/ContactInquiry";
import type { EnrolmentApplicationProps } from "../../domain/entities/EnrolmentApplication";
import type { StudentRegistrationProps } from "../../domain/entities/StudentRegistration";
import type { TeacherClassProps } from "../../domain/entities/TeacherClass";
import type { TeacherRegistrationProps } from "../../domain/entities/TeacherRegistration";

export type AttendanceRecordDocument = AttendanceRecordProps;
export type ContactInquiryDocument = ContactInquiryProps;
export type EnrolmentApplicationDocument = EnrolmentApplicationProps;
export type StudentRegistrationDocument = StudentRegistrationProps;
export type TeacherRegistrationDocument = TeacherRegistrationProps;
export type TeacherClassDocument = TeacherClassProps;

export class MongoDatabase {
  private readonly client = new MongoClient(env.mongoUri, {
    ignoreUndefined: true,
  });

  private connection?: Promise<Db>;

  connect(): Promise<Db> {
    if (!this.connection) {
      this.connection = this.client.connect().then(async () => {
        const database = this.client.db(env.mongoDatabaseName);

        await this.createIndexes(database);

        return database;
      });
    }

    return this.connection;
  }

  async collection<T extends object>(name: string): Promise<Collection<T>> {
    const database = await this.connect();

    return database.collection<T>(name);
  }

  async close(): Promise<void> {
    await this.client.close();
    this.connection = undefined;
  }

  private async createIndexes(database: Db) {
    await Promise.all([
      database.collection<ContactInquiryDocument>("contactInquiries").createIndex({ id: 1 }, { unique: true }),
      database.collection<StudentRegistrationDocument>("studentRegistrations").createIndex({ id: 1 }, { unique: true }),
      database
        .collection<StudentRegistrationDocument>("studentRegistrations")
        .createIndex({ email: 1 }, { unique: true }),
      database
        .collection<StudentRegistrationDocument>("studentRegistrations")
        .createIndex({ username: 1 }, { unique: true }),
      database.collection<StudentRegistrationDocument>("studentRegistrations").createIndex({ approvalStatus: 1 }),
      database.collection<TeacherRegistrationDocument>("teacherRegistrations").createIndex({ id: 1 }, { unique: true }),
      database
        .collection<TeacherRegistrationDocument>("teacherRegistrations")
        .createIndex({ email: 1 }, { unique: true }),
      database
        .collection<TeacherRegistrationDocument>("teacherRegistrations")
        .createIndex({ username: 1 }, { unique: true }),
      database.collection<TeacherRegistrationDocument>("teacherRegistrations").createIndex({ applicationStatus: 1 }),
      database.collection<TeacherClassDocument>("teacherClasses").createIndex({ id: 1 }, { unique: true }),
      database.collection<TeacherClassDocument>("teacherClasses").createIndex({ teacherId: 1 }),
      database.collection<TeacherClassDocument>("teacherClasses").createIndex({ danceStyle: 1 }),
      database.collection<TeacherClassDocument>("teacherClasses").createIndex({ createdAt: -1 }),
      database
        .collection<EnrolmentApplicationDocument>("enrolmentApplications")
        .createIndex({ applicationId: 1 }, { unique: true }),
      database.collection<EnrolmentApplicationDocument>("enrolmentApplications").createIndex({ studentId: 1 }),
      database.collection<EnrolmentApplicationDocument>("enrolmentApplications").createIndex({ "data.teacherId": 1 }),
      database.collection<EnrolmentApplicationDocument>("enrolmentApplications").createIndex({ status: 1 }),
      database.collection<EnrolmentApplicationDocument>("enrolmentApplications").createIndex({ submittedAt: -1 }),
      database.collection<AttendanceRecordDocument>("attendanceRecords").createIndex({ id: 1 }, { unique: true }),
      database.collection<AttendanceRecordDocument>("attendanceRecords").createIndex({ teacherId: 1 }),
      database.collection<AttendanceRecordDocument>("attendanceRecords").createIndex({ classId: 1 }),
      database.collection<AttendanceRecordDocument>("attendanceRecords").createIndex({ date: -1 }),
      database
        .collection<AttendanceRecordDocument>("attendanceRecords")
        .createIndex({ teacherId: 1, classId: 1, date: 1 }),
    ]);
  }
}

export const mongoDatabase = new MongoDatabase();
