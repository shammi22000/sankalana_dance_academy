"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoEnrolmentApplicationRepository = void 0;
const EnrolmentApplication_1 = require("../../domain/entities/EnrolmentApplication");
class MongoEnrolmentApplicationRepository {
    constructor(database) {
        this.database = database;
    }
    async save(application) {
        const collection = await this.database.collection("enrolmentApplications");
        const document = application.toPersistence();
        await collection.replaceOne({ applicationId: document.applicationId }, document, { upsert: true });
        return EnrolmentApplication_1.EnrolmentApplication.fromPersistence(document);
    }
    async findByStudentId(studentId) {
        const collection = await this.database.collection("enrolmentApplications");
        const documents = await collection.find({ studentId }).sort({ submittedAt: -1 }).toArray();
        return documents.map((document) => this.toEntity(document));
    }
    async findByTeacherId(teacherId) {
        const collection = await this.database.collection("enrolmentApplications");
        const documents = await collection.find({ "data.teacherId": teacherId }).sort({ submittedAt: -1 }).toArray();
        return documents.map((document) => this.toEntity(document));
    }
    async findByApplicationId(applicationId) {
        const collection = await this.database.collection("enrolmentApplications");
        return this.toEntityOrNull(await collection.findOne({ applicationId }));
    }
    async updateTeacherDecision(applicationId, teacherId, update) {
        const collection = await this.database.collection("enrolmentApplications");
        const result = await collection.findOneAndUpdate({ applicationId, "data.teacherId": teacherId }, { $set: update }, { returnDocument: "after" });
        return this.toEntityOrNull(result);
    }
    async countSubmittedInYear(year) {
        const collection = await this.database.collection("enrolmentApplications");
        const start = new Date(`${year}-01-01T00:00:00.000Z`);
        const end = new Date(`${year + 1}-01-01T00:00:00.000Z`);
        return collection.countDocuments({
            submittedAt: {
                $gte: start,
                $lt: end,
            },
        });
    }
    toEntity(document) {
        const props = {
            applicationId: document.applicationId,
            studentId: document.studentId,
            status: document.status,
            submittedAt: document.submittedAt,
            adminComment: document.adminComment,
            reviewedAt: document.reviewedAt,
            reviewedByTeacherId: document.reviewedByTeacherId,
            data: document.data,
        };
        return EnrolmentApplication_1.EnrolmentApplication.fromPersistence(props);
    }
    toEntityOrNull(document) {
        return document ? this.toEntity(document) : null;
    }
}
exports.MongoEnrolmentApplicationRepository = MongoEnrolmentApplicationRepository;
