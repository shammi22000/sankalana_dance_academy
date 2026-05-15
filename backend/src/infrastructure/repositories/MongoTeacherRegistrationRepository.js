"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoTeacherRegistrationRepository = void 0;
const TeacherRegistration_1 = require("../../domain/entities/TeacherRegistration");
class MongoTeacherRegistrationRepository {
    constructor(database) {
        this.database = database;
    }
    async save(teacherRegistration) {
        const collection = await this.database.collection("teacherRegistrations");
        const document = teacherRegistration.toPersistence();
        await collection.replaceOne({ id: document.id }, document, { upsert: true });
        return TeacherRegistration_1.TeacherRegistration.fromPersistence(document);
    }
    async findAll() {
        const collection = await this.database.collection("teacherRegistrations");
        const documents = await collection.find().sort({ createdAt: -1 }).toArray();
        return documents.flatMap((document) => {
            const entity = this.toEntity(document);
            return entity ? [entity] : [];
        });
    }
    async findById(id) {
        const collection = await this.database.collection("teacherRegistrations");
        return this.toEntity(await collection.findOne({ id }));
    }
    async findByEmail(email) {
        const collection = await this.database.collection("teacherRegistrations");
        return this.toEntity(await collection.findOne({ email }));
    }
    async findByUsername(username) {
        const collection = await this.database.collection("teacherRegistrations");
        return this.toEntity(await collection.findOne({ username }));
    }
    async findByApplicationStatus(status) {
        const collection = await this.database.collection("teacherRegistrations");
        const filter = status === "pending"
            ? {
                $or: [
                    { applicationStatus: status },
                    { applicationStatus: { $exists: false } },
                    { applicationStatus: "submitted" },
                    { applicationStatus: "draft" },
                ],
            }
            : { applicationStatus: status };
        const documents = await collection.find(filter).sort({ createdAt: -1 }).toArray();
        return documents.flatMap((document) => {
            const entity = this.toEntity(document);
            return entity ? [entity] : [];
        });
    }
    async updateApplicationStatus(id, status) {
        const collection = await this.database.collection("teacherRegistrations");
        const result = await collection.findOneAndUpdate({ id }, { $set: { applicationStatus: status } }, { returnDocument: "after" });
        return this.toEntity(result);
    }
    async updatePasswordHash(id, passwordHash) {
        const collection = await this.database.collection("teacherRegistrations");
        const result = await collection.findOneAndUpdate({ id }, { $set: { passwordHash } }, { returnDocument: "after" });
        return this.toEntity(result);
    }
    toEntity(document) {
        if (!document) {
            return null;
        }
        const props = {
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
            applicationStatus: (0, TeacherRegistration_1.normalizeTeacherApplicationStatus)(document.applicationStatus),
            createdAt: document.createdAt,
        };
        return TeacherRegistration_1.TeacherRegistration.fromPersistence(props);
    }
}
exports.MongoTeacherRegistrationRepository = MongoTeacherRegistrationRepository;
