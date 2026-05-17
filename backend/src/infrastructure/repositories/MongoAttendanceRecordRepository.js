"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoAttendanceRecordRepository = void 0;
const AttendanceRecord_1 = require("../../domain/entities/AttendanceRecord");
class MongoAttendanceRecordRepository {
    constructor(database) {
        this.database = database;
    }
    async findByTeacherId(teacherId) {
        const collection = await this.database.collection("attendanceRecords");
        await this.ensureReadableRecordIds(collection, { teacherId });
        const documents = await collection.find({ teacherId }).sort({ date: -1, updatedAt: -1 }).toArray();
        return documents.map((document) => this.toEntity(document));
    }
    async findByStudentId(studentId) {
        const collection = await this.database.collection("attendanceRecords");
        await this.ensureReadableRecordIds(collection, { studentId });
        const documents = await collection.find({ studentId }).sort({ date: -1, updatedAt: -1 }).toArray();
        return documents.map((document) => this.toEntity(document));
    }
    async replaceSession(teacherId, classId, date, records) {
        const collection = await this.database.collection("attendanceRecords");
        const existingDocuments = await collection.find({ teacherId, classId, date }).toArray();
        const existingIdsByStudent = new Map(existingDocuments
            .filter((document) => this.isReadableRecordId(document.id))
            .map((document) => [document.studentId, document.id]));
        const baseDocuments = records.map((record) => record.toPersistence());
        const requiredNewIdCount = baseDocuments.filter((document) => !existingIdsByStudent.has(document.studentId)).length;
        const newIds = await this.createReadableRecordIds(requiredNewIdCount);
        let newIdIndex = 0;
        const documents = baseDocuments.map((document) => ({
            ...document,
            id: existingIdsByStudent.get(document.studentId) ?? newIds[newIdIndex++],
        }));
        await collection.deleteMany({ teacherId, classId, date });
        if (documents.length > 0) {
            await collection.insertMany(documents);
        }
        return documents.map((document) => AttendanceRecord_1.AttendanceRecord.fromPersistence(document));
    }
    async updateRecord(teacherId, id, updates) {
        const collection = await this.database.collection("attendanceRecords");
        await collection.updateOne({ teacherId, id }, {
            $set: {
                status: updates.status,
                remarks: updates.remarks,
                updatedAt: new Date(),
            },
        });
        const document = await collection.findOne({ teacherId, id });
        return document ? this.toEntity(document) : null;
    }
    async deleteRecord(teacherId, id) {
        const collection = await this.database.collection("attendanceRecords");
        const result = await collection.deleteOne({ teacherId, id });
        return result.deletedCount > 0;
    }
    async ensureReadableRecordIds(collection, filter) {
        const documents = await collection.find(filter, { projection: { _id: 1, id: 1 } }).toArray();
        const legacyDocuments = documents.filter((document) => !this.isReadableRecordId(document.id));
        if (legacyDocuments.length === 0) {
            return;
        }
        const newIds = await this.createReadableRecordIds(legacyDocuments.length);
        await Promise.all(legacyDocuments.map((document, index) => collection.updateOne({ _id: document._id }, {
            $set: {
                id: newIds[index],
                updatedAt: new Date(),
            },
        })));
    }
    async createReadableRecordIds(count) {
        if (count <= 0) {
            return [];
        }
        const recordCollection = await this.database.collection("attendanceRecords");
        const counterCollection = await this.database.collection("counters");
        const highestExistingSequence = await this.getHighestExistingRecordSequence(recordCollection);
        const counter = await counterCollection.findOne({ _id: "attendanceRecords" });
        const currentSequence = Number(counter?.sequence ?? 0);
        if (currentSequence < highestExistingSequence) {
            await counterCollection.updateOne({ _id: "attendanceRecords" }, { $set: { sequence: highestExistingSequence } }, { upsert: true });
        }
        const updatedCounterResult = await counterCollection.findOneAndUpdate({ _id: "attendanceRecords" }, { $inc: { sequence: count } }, { upsert: true, returnDocument: "after" });
        const updatedCounter = updatedCounterResult?.value ?? updatedCounterResult;
        const endSequence = Number(updatedCounter?.sequence ?? highestExistingSequence + count);
        const startSequence = endSequence - count + 1;
        return Array.from({ length: count }, (_unused, index) => this.formatReadableRecordId(startSequence + index));
    }
    async getHighestExistingRecordSequence(collection) {
        const documents = await collection.find({ id: /^ATT_\d+$/ }, { projection: { id: 1 } }).toArray();
        return documents.reduce((highest, document) => {
            const sequence = Number(String(document.id).replace("ATT_", ""));
            return Number.isFinite(sequence) ? Math.max(highest, sequence) : highest;
        }, 0);
    }
    isReadableRecordId(id) {
        return /^ATT_\d+$/.test(String(id ?? ""));
    }
    formatReadableRecordId(sequence) {
        return `ATT_${String(sequence).padStart(2, "0")}`;
    }
    toEntity(document) {
        const props = {
            id: document.id,
            teacherId: document.teacherId,
            classId: document.classId,
            className: document.className,
            date: document.date,
            studentId: document.studentId,
            studentName: document.studentName,
            status: document.status,
            remarks: document.remarks,
            createdAt: document.createdAt,
            updatedAt: document.updatedAt,
        };
        return AttendanceRecord_1.AttendanceRecord.fromPersistence(props);
    }
}
exports.MongoAttendanceRecordRepository = MongoAttendanceRecordRepository;
