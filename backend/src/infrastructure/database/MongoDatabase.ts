import { MongoClient, type Collection, type Db } from "mongodb";
import { env } from "../../config/env";
import type { ContactInquiryProps } from "../../domain/entities/ContactInquiry";
import type { StudentRegistrationProps } from "../../domain/entities/StudentRegistration";
import type { TeacherRegistrationProps } from "../../domain/entities/TeacherRegistration";

export type ContactInquiryDocument = ContactInquiryProps;
export type StudentRegistrationDocument = StudentRegistrationProps;
export type TeacherRegistrationDocument = TeacherRegistrationProps;

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
      database.collection<TeacherRegistrationDocument>("teacherRegistrations").createIndex({ id: 1 }, { unique: true }),
      database
        .collection<TeacherRegistrationDocument>("teacherRegistrations")
        .createIndex({ email: 1 }, { unique: true }),
      database
        .collection<TeacherRegistrationDocument>("teacherRegistrations")
        .createIndex({ username: 1 }, { unique: true }),
    ]);
  }
}

export const mongoDatabase = new MongoDatabase();
