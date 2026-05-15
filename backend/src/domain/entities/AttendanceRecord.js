"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AttendanceRecord = void 0;
class AttendanceRecord {
    constructor(props) {
        this.props = props;
    }
    static create(input) {
        const now = new Date();
        return new AttendanceRecord({
            ...input,
            id: [input.teacherId, input.classId, input.date, input.studentId].join(":"),
            createdAt: now,
            updatedAt: now,
        });
    }
    static fromPersistence(input) {
        return new AttendanceRecord({
            ...input,
            createdAt: new Date(input.createdAt),
            updatedAt: new Date(input.updatedAt),
        });
    }
    toPersistence() {
        return {
            ...this.props,
            createdAt: new Date(this.props.createdAt),
            updatedAt: new Date(this.props.updatedAt),
        };
    }
    toJSON() {
        return {
            id: this.props.id,
            teacherId: this.props.teacherId,
            classId: this.props.classId,
            className: this.props.className,
            date: this.props.date,
            studentId: this.props.studentId,
            studentName: this.props.studentName,
            status: this.props.status,
            remarks: this.props.remarks,
            createdAt: this.props.createdAt.toISOString(),
            updatedAt: this.props.updatedAt.toISOString(),
        };
    }
}
exports.AttendanceRecord = AttendanceRecord;
