import {
  normalizeStudentApprovalStatus,
  StudentRegistration,
  type StudentApprovalStatus,
  type StudentRegistrationProps,
} from "../../domain/entities/StudentRegistration";
import type {
  StudentRegistrationProfileUpdate,
  StudentRegistrationRepository,
} from "../../domain/repositories/StudentRegistrationRepository";
import type { MongoDatabase, StudentRegistrationDocument } from "../database/MongoDatabase";

export class MongoStudentRegistrationRepository implements StudentRegistrationRepository {
  constructor(private readonly database: MongoDatabase) {}

  async save(studentRegistration: StudentRegistration): Promise<StudentRegistration> {
    const collection = await this.database.collection<StudentRegistrationDocument>("studentRegistrations");
    const document = studentRegistration.toPersistence();

    await collection.replaceOne({ id: document.id }, document, { upsert: true });

    return StudentRegistration.fromPersistence(document);
  }

  async findAll(): Promise<StudentRegistration[]> {
    const collection = await this.database.collection<StudentRegistrationDocument>("studentRegistrations");
    const documents = await collection.find({}).sort({ createdAt: -1 }).toArray();

    return documents.flatMap((document) => {
      const entity = this.toEntity(document);

      return entity ? [entity] : [];
    });
  }

  async findById(id: string): Promise<StudentRegistration | null> {
    const collection = await this.database.collection<StudentRegistrationDocument>("studentRegistrations");

    return this.toEntity(await collection.findOne({ id }));
  }

  async findByEmail(email: string): Promise<StudentRegistration | null> {
    const collection = await this.database.collection<StudentRegistrationDocument>("studentRegistrations");

    return this.toEntity(await collection.findOne({ email }));
  }

  async findByUsername(username: string): Promise<StudentRegistration | null> {
    const collection = await this.database.collection<StudentRegistrationDocument>("studentRegistrations");

    return this.toEntity(await collection.findOne({ username }));
  }

  async findByApprovalStatus(status: StudentApprovalStatus): Promise<StudentRegistration[]> {
    const collection = await this.database.collection<StudentRegistrationDocument>("studentRegistrations");
    const filter =
      status === "pending"
        ? { $or: [{ approvalStatus: status }, { approvalStatus: { $exists: false } }] }
        : { approvalStatus: status };
    const documents = await collection.find(filter).sort({ createdAt: -1 }).toArray();

    return documents.flatMap((document) => {
      const entity = this.toEntity(document);

      return entity ? [entity] : [];
    });
  }

  async updateProfile(id: string, profile: StudentRegistrationProfileUpdate): Promise<StudentRegistration | null> {
    const collection = await this.database.collection<StudentRegistrationDocument>("studentRegistrations");
    const result = await collection.findOneAndUpdate(
      { id },
      {
        $set: {
          fullName: profile.fullName,
          email: profile.email,
          phone: profile.phone,
          username: profile.username,
          gender: profile.gender,
          dateOfBirth: profile.dateOfBirth,
        },
      },
      { returnDocument: "after" },
    );

    return this.toEntity(result);
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<StudentRegistration | null> {
    const collection = await this.database.collection<StudentRegistrationDocument>("studentRegistrations");
    const result = await collection.findOneAndUpdate(
      { id },
      { $set: { passwordHash } },
      { returnDocument: "after" },
    );

    return this.toEntity(result);
  }

  async updateApprovalStatus(id: string, status: StudentApprovalStatus): Promise<StudentRegistration | null> {
    const collection = await this.database.collection<StudentRegistrationDocument>("studentRegistrations");
    const result = await collection.findOneAndUpdate(
      { id },
      { $set: { approvalStatus: status } },
      { returnDocument: "after" },
    );

    return this.toEntity(result);
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
      approvalStatus: normalizeStudentApprovalStatus(document.approvalStatus),
      createdAt: document.createdAt,
    };

    return StudentRegistration.fromPersistence(props);
  }
}
