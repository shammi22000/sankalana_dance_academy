"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentRegistration = void 0;
exports.normalizeStudentApprovalStatus = normalizeStudentApprovalStatus;
const crypto_1 = require("crypto");
function normalizeStudentApprovalStatus(status) {
    return status === "approved" || status === "rejected" || status === "pending" ? status : "pending";
}
class StudentRegistration {
    constructor(props) {
        this.props = props;
    }
    static create(input) {
        return new StudentRegistration({
            ...input,
            id: (0, crypto_1.randomUUID)(),
            accountRole: "student",
            approvalStatus: "pending",
            createdAt: new Date(),
        });
    }
    static fromPersistence(input) {
        return new StudentRegistration({
            ...input,
            approvalStatus: normalizeStudentApprovalStatus(input.approvalStatus),
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
    get approvalStatus() {
        return this.props.approvalStatus;
    }
    toPersistence() {
        return {
            ...this.props,
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
            gender: this.props.gender,
            dateOfBirth: this.props.dateOfBirth,
            accountRole: this.props.accountRole,
            approvalStatus: this.props.approvalStatus,
            createdAt: this.props.createdAt.toISOString(),
        };
    }
}
exports.StudentRegistration = StudentRegistration;
