import {
  EnrolmentApplication,
  type EnrolmentApplicationProps,
} from "../../domain/entities/EnrolmentApplication";
import type {
  EnrolmentApplicationRepository,
  EnrolmentDecisionUpdate,
} from "../../domain/repositories/EnrolmentApplicationRepository";
import type { EnrolmentApplicationDocument, MongoDatabase } from "../database/MongoDatabase";

export class MongoEnrolmentApplicationRepository implements EnrolmentApplicationRepository {
  constructor(private readonly database: MongoDatabase) {}

  async save(application: EnrolmentApplication): Promise<EnrolmentApplication> {
    const collection = await this.database.collection<EnrolmentApplicationDocument>("enrolmentApplications");
    const document = application.toPersistence();

    await collection.replaceOne({ applicationId: document.applicationId }, document, { upsert: true });

    return EnrolmentApplication.fromPersistence(document);
  }

  async findByStudentId(studentId: string): Promise<EnrolmentApplication[]> {
    const collection = await this.database.collection<EnrolmentApplicationDocument>("enrolmentApplications");
    const documents = await collection.find({ studentId }).sort({ submittedAt: -1 }).toArray();

    return documents.map((document) => this.toEntity(document));
  }

  async findByTeacherId(teacherId: string): Promise<EnrolmentApplication[]> {
    const collection = await this.database.collection<EnrolmentApplicationDocument>("enrolmentApplications");
    const documents = await collection.find({ "data.teacherId": teacherId }).sort({ submittedAt: -1 }).toArray();

    return documents.map((document) => this.toEntity(document));
  }

  async findByApplicationId(applicationId: string): Promise<EnrolmentApplication | null> {
    const collection = await this.database.collection<EnrolmentApplicationDocument>("enrolmentApplications");

    return this.toEntityOrNull(await collection.findOne({ applicationId }));
  }

  async updateTeacherDecision(
    applicationId: string,
    teacherId: string,
    update: EnrolmentDecisionUpdate,
  ): Promise<EnrolmentApplication | null> {
    const collection = await this.database.collection<EnrolmentApplicationDocument>("enrolmentApplications");
    const result = await collection.findOneAndUpdate(
      { applicationId, "data.teacherId": teacherId },
      { $set: update },
      { returnDocument: "after" },
    );

    return this.toEntityOrNull(result);
  }

  async countSubmittedInYear(year: number): Promise<number> {
    const collection = await this.database.collection<EnrolmentApplicationDocument>("enrolmentApplications");
    const start = new Date(`${year}-01-01T00:00:00.000Z`);
    const end = new Date(`${year + 1}-01-01T00:00:00.000Z`);

    return collection.countDocuments({
      submittedAt: {
        $gte: start,
        $lt: end,
      },
    });
  }

  private toEntity(document: EnrolmentApplicationDocument): EnrolmentApplication {
    const props: EnrolmentApplicationProps = {
      applicationId: document.applicationId,
      studentId: document.studentId,
      status: document.status,
      submittedAt: document.submittedAt,
      adminComment: document.adminComment,
      reviewedAt: document.reviewedAt,
      reviewedByTeacherId: document.reviewedByTeacherId,
      data: document.data,
    };

    return EnrolmentApplication.fromPersistence(props);
  }

  private toEntityOrNull(document: EnrolmentApplicationDocument | null): EnrolmentApplication | null {
    return document ? this.toEntity(document) : null;
  }
}
