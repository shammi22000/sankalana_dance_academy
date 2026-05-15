"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticateStudentUseCase = void 0;
const crypto_1 = require("crypto");
const ApplicationError_1 = require("../errors/ApplicationError");
const passwordHash_1 = require("../security/passwordHash");
class AuthenticateStudentUseCase {
    constructor(studentRegistrationRepository) {
        this.studentRegistrationRepository = studentRegistrationRepository;
        this.sessionStudentIds = new Map();
    }
    async execute(dto) {
        const identity = dto.identity?.trim().toLowerCase() ?? "";
        const password = dto.password ?? "";
        if (!identity || !password) {
            throw new ApplicationError_1.ValidationError({
                credentials: "Email or username and password are required.",
            });
        }
        const student = (await this.studentRegistrationRepository.findByEmail(identity)) ??
            (await this.studentRegistrationRepository.findByUsername(identity));
        if (!student || !(0, passwordHash_1.verifyPassword)(password, student.passwordHash)) {
            throw new ApplicationError_1.UnauthorizedError();
        }
        if (student.approvalStatus !== "approved") {
            throw new ApplicationError_1.ForbiddenError(student.approvalStatus === "rejected"
                ? "This student account was rejected by admin."
                : "This student account is pending admin approval.");
        }
        const studentJson = student.toJSON();
        const token = (0, crypto_1.randomUUID)();
        this.sessionStudentIds.set(token, studentJson.id);
        return {
            student: studentJson,
            session: {
                token,
                issuedAt: new Date().toISOString(),
            },
        };
    }
    getStudentIdForSessionToken(token) {
        return this.sessionStudentIds.get(token) ?? null;
    }
}
exports.AuthenticateStudentUseCase = AuthenticateStudentUseCase;
