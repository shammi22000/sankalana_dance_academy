import {
  TeacherRegistration,
  type TeacherRegistrationProps,
} from "../../domain/entities/TeacherRegistration";
import type { TeacherRegistrationRepository } from "../../domain/repositories/TeacherRegistrationRepository";
import type { MongoDatabase, TeacherRegistrationDocument } from "../database/MongoDatabase";

export class MongoTeacherRegistrationRepository implements TeacherRegistrationRepository {
  constructor(private readonly database: MongoDatabase) {}

  async save(teacherRegistration: TeacherRegistration): Promise<TeacherRegistration> {
    const collection = await this.database.collection<TeacherRegistrationDocument>("teacherRegistrations");
    const document = teacherRegistration.toPersistence();

    await collection.replaceOne({ id: document.id }, document, { upsert: true });

    return TeacherRegistration.fromPersistence(document);
  }

  async findByEmail(email: string): Promise<TeacherRegistration | null> {
    const collection = await this.database.collection<TeacherRegistrationDocument>("teacherRegistrations");

    return this.toEntity(await collection.findOne({ email }));
  }

  async findByUsername(username: string): Promise<TeacherRegistration | null> {
    const collection = await this.database.collection<TeacherRegistrationDocument>("teacherRegistrations");

    return this.toEntity(await collection.findOne({ username }));
  }

  private toEntity(document: TeacherRegistrationDocument | null): TeacherRegistration | null {
    if (!document) {
      return null;
    }

    const props: TeacherRegistrationProps = {
      id: document.id,
      fullName: document.fullName,
      email: document.email,
      phone: document.phone,
      username: document.username,
      danceStyles: document.danceStyles,
      experienceYears: document.experienceYears,
      qualifications: document.qualifications,
      biography: document.biography,
      availableDays: document.availableDays,
      portfolioFileName: document.portfolioFileName,
      passwordHash: document.passwordHash,
      accountRole: document.accountRole,
      applicationStatus: document.applicationStatus,
      createdAt: document.createdAt,
    };

    return TeacherRegistration.fromPersistence(props);
  }
}
