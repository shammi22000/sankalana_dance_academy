"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrolmentApplication = void 0;
class EnrolmentApplication {
    constructor(props) {
        this.props = props;
    }
    static create(input) {
        return new EnrolmentApplication({
            ...input,
            status: "Pending Review",
            submittedAt: new Date(),
        });
    }
    static fromPersistence(input) {
        return new EnrolmentApplication({
            ...input,
            submittedAt: new Date(input.submittedAt),
            reviewedAt: input.reviewedAt ? new Date(input.reviewedAt) : undefined,
            data: {
                ...input.data,
                personal: { ...input.data.personal },
                guardian: { ...input.data.guardian },
            },
        });
    }
    toPersistence() {
        return {
            ...this.props,
            submittedAt: new Date(this.props.submittedAt),
            reviewedAt: this.props.reviewedAt ? new Date(this.props.reviewedAt) : undefined,
            data: {
                ...this.props.data,
                personal: { ...this.props.data.personal },
                guardian: { ...this.props.data.guardian },
            },
        };
    }
    toJSON() {
        return {
            applicationId: this.props.applicationId,
            studentId: this.props.studentId,
            status: this.props.status,
            submittedAt: this.props.submittedAt.toISOString(),
            adminComment: this.props.adminComment,
            reviewedAt: this.props.reviewedAt?.toISOString(),
            reviewedByTeacherId: this.props.reviewedByTeacherId,
            data: {
                ...this.props.data,
                personal: { ...this.props.data.personal },
                guardian: { ...this.props.data.guardian },
            },
        };
    }
}
exports.EnrolmentApplication = EnrolmentApplication;
