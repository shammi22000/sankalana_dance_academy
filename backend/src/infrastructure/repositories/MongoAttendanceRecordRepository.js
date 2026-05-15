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
        const documents = await collection.find({ teacherId }).sort({ date: -1, updatedAt: -1 }).toArray();
        return documents.map((document) => this.toEntity(document));
    }
    async replaceSession(teacherId, classId, date, records) {
        const collection = await this.database.collection("attendanceRecords");
        const documents = records.map((record) => record.toPersistence());
        await collection.deleteMany({ teacherId, classId, date });
        if (documents.length > 0) {
            await collection.insertMany(documents);
        }
        return documents.map((document) => AttendanceRecord_1.AttendanceRecord.fromPersistence(document));
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
