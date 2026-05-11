import type { Filter } from "mongodb";
import {
  normalizeTeacherApplicationStatus,
  TeacherRegistration,
  type TeacherApplicationStatus,
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

  async findAll(): Promise<TeacherRegistration[]> {
    const collection = await this.database.collection<TeacherRegistrationDocument>("teacherRegistrations");
    const documents = await collection.find().sort({ createdAt: -1 }).toArray();

    return documents.flatMap((document) => {
      const entity = this.toEntity(document);

      return entity ? [entity] : [];
    });
  }

  async findByEmail(email: string): Promise<TeacherRegistration | null> {
    const collection = await this.database.collection<TeacherRegistrationDocument>("teacherRegistrations");

    return this.toEntity(await collection.findOne({ email }));
  }

  async findByUsername(username: string): Promise<TeacherRegistration | null> {
    const collection = await this.database.collection<TeacherRegistrationDocument>("teacherRegistrations");

    return this.toEntity(await collection.findOne({ username }));
  }

  async findByApplicationStatus(status: TeacherApplicationStatus): Promise<TeacherRegistration[]> {
    const collection = await this.database.collection<TeacherRegistrationDocument>("teacherRegistrations");
    const filter: Filter<TeacherRegistrationDocument> =
      status === "pending"
        ? ({
            $or: [
              { applicationStatus: status },
              { applicationStatus: { $exists: false } },
              { applicationStatus: "submitted" },
              { applicationStatus: "draft" },
            ],
          } as Filter<TeacherRegistrationDocument>)
        : { applicationStatus: status };
    const documents = await collection.find(filter).sort({ createdAt: -1 }).toArray();

    return documents.flatMap((document) => {
      const entity = this.toEntity(document);

      return entity ? [entity] : [];
    });
  }

  async updateApplicationStatus(id: string, status: TeacherApplicationStatus): Promise<TeacherRegistration | null> {
    const collection = await this.database.collection<TeacherRegistrationDocument>("teacherRegistrations");
    const result = await collection.findOneAndUpdate(
      { id },
      { $set: { applicationStatus: status } },
      { returnDocument: "after" },
    );

    return this.toEntity(result);
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
      avatarFileName: document.avatarFileName,
      avatarImageDataUrl: document.avatarImageDataUrl,
      portfolioFileName: document.portfolioFileName,
      passwordHash: document.passwordHash,
      accountRole: document.accountRole,
      applicationStatus: normalizeTeacherApplicationStatus(document.applicationStatus),
      createdAt: document.createdAt,
    };

    return TeacherRegistration.fromPersistence(props);
  }
}
