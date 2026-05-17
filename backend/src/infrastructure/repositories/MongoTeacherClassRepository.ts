import { TeacherClass, type TeacherClassProps } from "../../domain/entities/TeacherClass";
import type { TeacherClassRepository, TeacherClassUpdate } from "../../domain/repositories/TeacherClassRepository";
import type { MongoDatabase, TeacherClassDocument } from "../database/MongoDatabase";

export class MongoTeacherClassRepository implements TeacherClassRepository {
  constructor(private readonly database: MongoDatabase) {}

  async save(teacherClass: TeacherClass): Promise<TeacherClass> {
    const collection = await this.database.collection<TeacherClassDocument>("teacherClasses");
    const document = teacherClass.toPersistence();

    await collection.replaceOne({ id: document.id }, document, { upsert: true });

    return TeacherClass.fromPersistence(document);
  }

  async findAll(): Promise<TeacherClass[]> {
    const collection = await this.database.collection<TeacherClassDocument>("teacherClasses");
    const documents = await collection.find().sort({ createdAt: -1 }).toArray();

    return documents.map((document) => this.toEntity(document));
  }

  async findByTeacherId(teacherId: string): Promise<TeacherClass[]> {
    const collection = await this.database.collection<TeacherClassDocument>("teacherClasses");
    const documents = await collection.find({ teacherId }).sort({ createdAt: -1 }).toArray();

    return documents.map((document) => this.toEntity(document));
  }

  async findById(id: string): Promise<TeacherClass | null> {
    const collection = await this.database.collection<TeacherClassDocument>("teacherClasses");

    return this.toEntityOrNull(await collection.findOne({ id }));
  }

  async update(id: string, teacherId: string, update: TeacherClassUpdate): Promise<TeacherClass | null> {
    const collection = await this.database.collection<TeacherClassDocument>("teacherClasses");
    const result = await collection.findOneAndUpdate(
      { id, teacherId },
      { $set: update },
      { returnDocument: "after" },
    );

    return this.toEntityOrNull(result);
  }

  async delete(id: string, teacherId: string): Promise<boolean> {
    const collection = await this.database.collection<TeacherClassDocument>("teacherClasses");
    const result = await collection.deleteOne({ id, teacherId });

    return result.deletedCount === 1;
  }

  private toEntity(document: TeacherClassDocument): TeacherClass {
    const props: TeacherClassProps = {
      id: document.id,
      teacherId: document.teacherId,
      teacherName: document.teacherName,
      teacherUsername: document.teacherUsername,
      teacherSpecialization: document.teacherSpecialization,
      teacherExperienceYears: document.teacherExperienceYears,
      teacherBiography: document.teacherBiography,
      teacherAvatarFileName: document.teacherAvatarFileName,
      teacherAvatarImageDataUrl: document.teacherAvatarImageDataUrl,
      className: document.className,
      danceStyle: document.danceStyle,
      classLevel: document.classLevel,
      description: document.description,
      days: document.days,
      startTime: document.startTime,
      endTime: document.endTime,
      studio: document.studio,
      capacity: document.capacity,
      posterFileName: document.posterFileName,
      milestones: document.milestones,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };

    return TeacherClass.fromPersistence(props);
  }

  private toEntityOrNull(document: TeacherClassDocument | null): TeacherClass | null {
    return document ? this.toEntity(document) : null;
  }
}
