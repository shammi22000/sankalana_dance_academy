"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoTeacherClassRepository = void 0;
const TeacherClass_1 = require("../../domain/entities/TeacherClass");
class MongoTeacherClassRepository {
    constructor(database) {
        this.database = database;
    }
    async save(teacherClass) {
        const collection = await this.database.collection("teacherClasses");
        const document = teacherClass.toPersistence();
        await collection.replaceOne({ id: document.id }, document, { upsert: true });
        return TeacherClass_1.TeacherClass.fromPersistence(document);
    }
    async findAll() {
        const collection = await this.database.collection("teacherClasses");
        const documents = await collection.find().sort({ createdAt: -1 }).toArray();
        return documents.map((document) => this.toEntity(document));
    }
    async findByTeacherId(teacherId) {
        const collection = await this.database.collection("teacherClasses");
        const documents = await collection.find({ teacherId }).sort({ createdAt: -1 }).toArray();
        return documents.map((document) => this.toEntity(document));
    }
    async findById(id) {
        const collection = await this.database.collection("teacherClasses");
        return this.toEntityOrNull(await collection.findOne({ id }));
    }
    async update(id, teacherId, update) {
        const collection = await this.database.collection("teacherClasses");
        const result = await collection.findOneAndUpdate({ id, teacherId }, { $set: update }, { returnDocument: "after" });
        return this.toEntityOrNull(result);
    }
    async delete(id, teacherId) {
        const collection = await this.database.collection("teacherClasses");
        const result = await collection.deleteOne({ id, teacherId });
        return result.deletedCount === 1;
    }
    toEntity(document) {
        const props = {
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
        return TeacherClass_1.TeacherClass.fromPersistence(props);
    }
    toEntityOrNull(document) {
        return document ? this.toEntity(document) : null;
    }
}
exports.MongoTeacherClassRepository = MongoTeacherClassRepository;
