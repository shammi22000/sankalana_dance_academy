"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const ApplicationError_1 = require("../../application/errors/ApplicationError");
const errorHandler = (error, _request, response, _next) => {
    if (error instanceof ApplicationError_1.ApplicationError) {
        response.status(error.statusCode).json({
            success: false,
            error: {
                message: error.message,
                details: error.details,
            },
        });
        return;
    }
    response.status(500).json({
        success: false,
        error: {
            message: "Internal server error.",
        },
    });
};
exports.errorHandler = errorHandler;
