"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStudentAttendanceRoutes = createStudentAttendanceRoutes;
const express_1 = require("express");
function createStudentAttendanceRoutes(attendanceRecordController, authenticateStudentUseCase) {
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
    router.get("/", attendanceRecordController.listForStudent);
    return router;
}
