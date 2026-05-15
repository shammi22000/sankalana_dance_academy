"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongoDatabase = exports.MongoDatabase = void 0;
const mongodb_1 = require("mongodb");
const env_1 = require("../../config/env");
class MongoDatabase {
    constructor() {
        this.client = new mongodb_1.MongoClient(env_1.env.mongoUri, {
            ignoreUndefined: true,
        });
    }
    connect() {
        if (!this.connection) {
            this.connection = this.client.connect().then(async () => {
                const database = this.client.db(env_1.env.mongoDatabaseName);
                await this.createIndexes(database);
                return database;
            });
        }
        return this.connection;
    }
    async collection(name) {
        const database = await this.connect();
        return database.collection(name);
    }
    async close() {
        await this.client.close();
        this.connection = undefined;
    }
    async createIndexes(database) {
        await Promise.all([
            database.collection("contactInquiries").createIndex({ id: 1 }, { unique: true }),
            database.collection("studentRegistrations").createIndex({ id: 1 }, { unique: true }),
            database
                .collection("studentRegistrations")
                .createIndex({ email: 1 }, { unique: true }),
            database
                .collection("studentRegistrations")
                .createIndex({ username: 1 }, { unique: true }),
            database.collection("studentRegistrations").createIndex({ approvalStatus: 1 }),
            database.collection("teacherRegistrations").createIndex({ id: 1 }, { unique: true }),
            database
                .collection("teacherRegistrations")
                .createIndex({ email: 1 }, { unique: true }),
            database
                .collection("teacherRegistrations")
                .createIndex({ username: 1 }, { unique: true }),
            database.collection("teacherRegistrations").createIndex({ applicationStatus: 1 }),
            database.collection("teacherClasses").createIndex({ id: 1 }, { unique: true }),
            database.collection("teacherClasses").createIndex({ teacherId: 1 }),
            database.collection("teacherClasses").createIndex({ danceStyle: 1 }),
            database.collection("teacherClasses").createIndex({ createdAt: -1 }),
            database
                .collection("enrolmentApplications")
                .createIndex({ applicationId: 1 }, { unique: true }),
            database.collection("enrolmentApplications").createIndex({ studentId: 1 }),
            database.collection("enrolmentApplications").createIndex({ "data.teacherId": 1 }),
            database.collection("enrolmentApplications").createIndex({ status: 1 }),
            database.collection("enrolmentApplications").createIndex({ submittedAt: -1 }),
            database.collection("attendanceRecords").createIndex({ id: 1 }, { unique: true }),
            database.collection("attendanceRecords").createIndex({ teacherId: 1 }),
            database.collection("attendanceRecords").createIndex({ classId: 1 }),
            database.collection("attendanceRecords").createIndex({ date: -1 }),
            database
                .collection("attendanceRecords")
                .createIndex({ teacherId: 1, classId: 1, date: 1 }),
        ]);
    }
}
exports.MongoDatabase = MongoDatabase;
exports.mongoDatabase = new MongoDatabase();
