"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticateAdminUseCase = void 0;
const crypto_1 = require("crypto");
const ApplicationError_1 = require("../errors/ApplicationError");
class AuthenticateAdminUseCase {
    constructor() {
        this.sessionTokens = new Set();
    }
    async execute(dto) {
        const username = dto.username?.trim() ?? "";
        const password = dto.password ?? "";
        if (!username || !password) {
            throw new ApplicationError_1.ValidationError({
                credentials: "Admin username and password are required.",
            });
        }
        if (username !== "admin" || password !== "admin") {
            throw new ApplicationError_1.UnauthorizedError("Invalid admin username or password.");
        }
        const token = (0, crypto_1.randomUUID)();
        this.sessionTokens.add(token);
        return {
            admin: {
                username: "admin",
                displayName: "Admin",
                role: "admin",
            },
            session: {
                token,
                issuedAt: new Date().toISOString(),
            },
        };
    }
    isValidSessionToken(token) {
        return this.sessionTokens.has(token);
    }
}
exports.AuthenticateAdminUseCase = AuthenticateAdminUseCase;
