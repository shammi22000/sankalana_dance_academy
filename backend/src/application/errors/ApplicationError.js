"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundError = exports.ForbiddenError = exports.UnauthorizedError = exports.ValidationError = exports.ApplicationError = void 0;
class ApplicationError extends Error {
    constructor(message, statusCode = 500, details) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.name = this.constructor.name;
    }
}
exports.ApplicationError = ApplicationError;
class ValidationError extends ApplicationError {
    constructor(details) {
        super("Validation failed.", 400, details);
    }
}
exports.ValidationError = ValidationError;
class UnauthorizedError extends ApplicationError {
    constructor(message = "Invalid credentials.") {
        super(message, 401);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends ApplicationError {
    constructor(message = "Access denied.") {
        super(message, 403);
    }
}
exports.ForbiddenError = ForbiddenError;
class NotFoundError extends ApplicationError {
    constructor(message = "Resource not found.") {
        super(message, 404);
    }
}
exports.NotFoundError = NotFoundError;
