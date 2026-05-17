"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherRegistration = void 0;
exports.normalizeTeacherApplicationStatus = normalizeTeacherApplicationStatus;
const crypto_1 = require("crypto");
function normalizeTeacherApplicationStatus(status) {
    return status === "approved" || status === "rejected" || status === "pending" ? status : "pending";
}
class TeacherRegistration {
    constructor(props) {
        this.props = props;
    }
    static create(input) {
        return new TeacherRegistration({
            ...input,
            id: (0, crypto_1.randomUUID)(),
            accountRole: "teacher",
            applicationStatus: "pending",
            createdAt: new Date(),
        });
    }
    static fromPersistence(input) {
        return new TeacherRegistration({
            ...input,
            availableDays: [...input.availableDays],
            applicationStatus: normalizeTeacherApplicationStatus(input.applicationStatus),
            createdAt: new Date(input.createdAt),
        });
    }
    get email() {
        return this.props.email;
    }
    get username() {
        return this.props.username;
    }
    get passwordHash() {
        return this.props.passwordHash;
    }
    get applicationStatus() {
        return this.props.applicationStatus;
    }
    toPersistence() {
        return {
            ...this.props,
            availableDays: [...this.props.availableDays],
            createdAt: new Date(this.props.createdAt),
        };
    }
    toJSON() {
        return {
            id: this.props.id,
            fullName: this.props.fullName,
            email: this.props.email,
            phone: this.props.phone,
            username: this.props.username,
            danceStyles: this.props.danceStyles,
            experienceYears: this.props.experienceYears,
            qualifications: this.props.qualifications,
            biography: this.props.biography,
            availableDays: this.props.availableDays,
            avatarFileName: this.props.avatarFileName,
            avatarImageDataUrl: this.props.avatarImageDataUrl,
            portfolioFileName: this.props.portfolioFileName,
            accountRole: this.props.accountRole,
            applicationStatus: this.props.applicationStatus,
            createdAt: this.props.createdAt.toISOString(),
        };
    }
}
exports.TeacherRegistration = TeacherRegistration;
