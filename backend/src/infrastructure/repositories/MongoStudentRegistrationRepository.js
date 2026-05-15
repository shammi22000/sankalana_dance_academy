"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoStudentRegistrationRepository = void 0;
const StudentRegistration_1 = require("../../domain/entities/StudentRegistration");
class MongoStudentRegistrationRepository {
    constructor(database) {
        this.database = database;
    }
    async save(studentRegistration) {
        const collection = await this.database.collection("studentRegistrations");
        const document = studentRegistration.toPersistence();
        await collection.replaceOne({ id: document.id }, document, { upsert: true });
        return StudentRegistration_1.StudentRegistration.fromPersistence(document);
    }
    async findAll() {
        const collection = await this.database.collection("studentRegistrations");
        const documents = await collection.find({}).sort({ createdAt: -1 }).toArray();
        return documents.flatMap((document) => {
            const entity = this.toEntity(document);
            return entity ? [entity] : [];
        });
    }
    async findById(id) {
        const collection = await this.database.collection("studentRegistrations");
        return this.toEntity(await collection.findOne({ id }));
    }
    async findByEmail(email) {
        const collection = await this.database.collection("studentRegistrations");
        return this.toEntity(await collection.findOne({ email }));
    }
    async findByUsername(username) {
        const collection = await this.database.collection("studentRegistrations");
        return this.toEntity(await collection.findOne({ username }));
    }
    async findByApprovalStatus(status) {
        const collection = await this.database.collection("studentRegistrations");
        const filter = status === "pending"
            ? { $or: [{ approvalStatus: status }, { approvalStatus: { $exists: false } }] }
            : { approvalStatus: status };
        const documents = await collection.find(filter).sort({ createdAt: -1 }).toArray();
        return documents.flatMap((document) => {
            const entity = this.toEntity(document);
            return entity ? [entity] : [];
        });
    }
    async updateProfile(id, profile) {
        const collection = await this.database.collection("studentRegistrations");
        const result = await collection.findOneAndUpdate({ id }, {
            $set: {
                fullName: profile.fullName,
                email: profile.email,
                phone: profile.phone,
                username: profile.username,
                gender: profile.gender,
                dateOfBirth: profile.dateOfBirth,
            },
        }, { returnDocument: "after" });
        return this.toEntity(result);
    }
    async updatePasswordHash(id, passwordHash) {
        const collection = await this.database.collection("studentRegistrations");
        const result = await collection.findOneAndUpdate({ id }, { $set: { passwordHash } }, { returnDocument: "after" });
        return this.toEntity(result);
    }
    async updateApprovalStatus(id, status) {
        const collection = await this.database.collection("studentRegistrations");
        const result = await collection.findOneAndUpdate({ id }, { $set: { approvalStatus: status } }, { returnDocument: "after" });
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
            gender: document.gender,
            dateOfBirth: document.dateOfBirth,
            passwordHash: document.passwordHash,
            accountRole: document.accountRole,
            approvalStatus: (0, StudentRegistration_1.normalizeStudentApprovalStatus)(document.approvalStatus),
            createdAt: document.createdAt,
        };
        return StudentRegistration_1.StudentRegistration.fromPersistence(props);
    }
}
exports.MongoStudentRegistrationRepository = MongoStudentRegistrationRepository;
