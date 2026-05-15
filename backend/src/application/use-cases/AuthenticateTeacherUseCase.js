"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticateTeacherUseCase = void 0;
const crypto_1 = require("crypto");
const ApplicationError_1 = require("../errors/ApplicationError");
const passwordHash_1 = require("../security/passwordHash");
class AuthenticateTeacherUseCase {
    constructor(teacherRegistrationRepository) {
        this.teacherRegistrationRepository = teacherRegistrationRepository;
        this.sessionTeacherIds = new Map();
    }
    async execute(dto) {
        const identity = dto.identity?.trim().toLowerCase() ?? "";
        const password = dto.password ?? "";
        if (!identity || !password) {
            throw new ApplicationError_1.ValidationError({
                credentials: "Email or username and password are required.",
            });
        }
        const teacher = (await this.teacherRegistrationRepository.findByEmail(identity)) ??
            (await this.teacherRegistrationRepository.findByUsername(identity));
        if (!teacher || !(0, passwordHash_1.verifyPassword)(password, teacher.passwordHash)) {
            throw new ApplicationError_1.UnauthorizedError();
        }
        if (teacher.applicationStatus !== "approved") {
            throw new ApplicationError_1.ForbiddenError(teacher.applicationStatus === "rejected"
                ? "This teacher account was rejected by admin."
                : "This teacher account is pending admin approval.");
        }
        const teacherJson = teacher.toJSON();
        const token = (0, crypto_1.randomUUID)();
        this.sessionTeacherIds.set(token, teacherJson.id);
        return {
            teacher: teacherJson,
            session: {
                token,
                issuedAt: new Date().toISOString(),
            },
        };
    }
    getTeacherIdForSessionToken(token) {
        return this.sessionTeacherIds.get(token) ?? null;
    }
}
exports.AuthenticateTeacherUseCase = AuthenticateTeacherUseCase;
