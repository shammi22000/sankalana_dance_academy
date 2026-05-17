"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStudentEnrolmentRoutes = createStudentEnrolmentRoutes;
const express_1 = require("express");
function createStudentEnrolmentRoutes(enrolmentApplicationController, authenticateStudentUseCase) {
    const router = (0, express_1.Router)();
    router.use((request, response, next) => {
        const authorizationHeader = request.header("authorization") ?? "";
        const token = authorizationHeader.replace(/^Bearer\s+/i, "").trim();
        const studentId = token ? authenticateStudentUseCase.getStudentIdForSessionToken(token) : null;
        if (!studentId) {
            response.status(401).json({
                success: false,
                error: {
                    message: "Student login required.",
                },
            });
            return;
        }
        request.studentId = studentId;
        next();
    });
    router.get("/", enrolmentApplicationController.listForStudent);
    router.post("/", enrolmentApplicationController.createForStudent);
    return router;
}
