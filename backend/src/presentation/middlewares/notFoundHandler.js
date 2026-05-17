"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = void 0;
const notFoundHandler = (request, response) => {
    response.status(404).json({
        success: false,
        error: {
            message: `Route ${request.method} ${request.originalUrl} not found.`,
        },
    });
};
exports.notFoundHandler = notFoundHandler;
