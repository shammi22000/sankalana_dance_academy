import {
  StudentRegistration,
  type StudentRegistrationProps,
} from "../../domain/entities/StudentRegistration";
import type { StudentRegistrationRepository } from "../../domain/repositories/StudentRegistrationRepository";
import type { MongoDatabase, StudentRegistrationDocument } from "../database/MongoDatabase";

export class MongoStudentRegistrationRepository implements StudentRegistrationRepository {
  constructor(private readonly database: MongoDatabase) {}

  async save(studentRegistration: StudentRegistration): Promise<StudentRegistration> {
    const collection = await this.database.collection<StudentRegistrationDocument>("studentRegistrations");
    const document = studentRegistration.toPersistence();

    await collection.replaceOne({ id: document.id }, document, { upsert: true });

    return StudentRegistration.fromPersistence(document);
  }

  async findByEmail(email: string): Promise<StudentRegistration | null> {
    const collection = await this.database.collection<StudentRegistrationDocument>("studentRegistrations");

    return this.toEntity(await collection.findOne({ email }));
  }

  async findByUsername(username: string): Promise<StudentRegistration | null> {
    const collection = await this.database.collection<StudentRegistrationDocument>("studentRegistrations");

    return this.toEntity(await collection.findOne({ username }));
  }

  private toEntity(document: StudentRegistrationDocument | null): StudentRegistration | null {
    if (!document) {
      return null;
    }

    const props: StudentRegistrationProps = {
      id: document.id,
      fullName: document.fullName,
      email: document.email,
      phone: document.phone,
      username: document.username,
      gender: document.gender,
      dateOfBirth: document.dateOfBirth,
      passwordHash: document.passwordHash,
      accountRole: document.accountRole,
      createdAt: document.createdAt,
    };

    return StudentRegistration.fromPersistence(props);
  }
}
