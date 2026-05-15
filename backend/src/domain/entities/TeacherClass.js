"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeacherClass = void 0;
const crypto_1 = require("crypto");
class TeacherClass {
    constructor(props) {
        this.props = props;
    }
    static create(input) {
        const now = new Date();
        return new TeacherClass({
            ...input,
            id: (0, crypto_1.randomUUID)(),
            createdAt: now,
            updatedAt: now,
        });
    }
    static fromPersistence(input) {
        return new TeacherClass({
            ...input,
            days: [...input.days],
            milestones: [...input.milestones],
            createdAt: new Date(input.createdAt),
            updatedAt: new Date(input.updatedAt),
        });
    }
    get id() {
        return this.props.id;
    }
    get teacherId() {
        return this.props.teacherId;
    }
    toPersistence() {
        return {
            ...this.props,
            days: [...this.props.days],
            milestones: [...this.props.milestones],
            createdAt: new Date(this.props.createdAt),
            updatedAt: new Date(this.props.updatedAt),
        };
    }
    toJSON() {
        return {
            id: this.props.id,
            teacherId: this.props.teacherId,
            teacherName: this.props.teacherName,
            teacherUsername: this.props.teacherUsername,
            teacherSpecialization: this.props.teacherSpecialization,
            teacherExperienceYears: this.props.teacherExperienceYears,
            teacherBiography: this.props.teacherBiography,
            teacherAvatarFileName: this.props.teacherAvatarFileName,
            teacherAvatarImageDataUrl: this.props.teacherAvatarImageDataUrl,
            className: this.props.className,
            danceStyle: this.props.danceStyle,
            classLevel: this.props.classLevel,
            description: this.props.description,
            days: [...this.props.days],
            startTime: this.props.startTime,
            endTime: this.props.endTime,
            studio: this.props.studio,
            capacity: this.props.capacity,
            posterFileName: this.props.posterFileName,
            milestones: [...this.props.milestones],
            createdAt: this.props.createdAt.toISOString(),
            updatedAt: this.props.updatedAt.toISOString(),
        };
    }
}
exports.TeacherClass = TeacherClass;
