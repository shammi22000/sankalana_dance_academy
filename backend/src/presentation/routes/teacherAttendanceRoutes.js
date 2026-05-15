"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTeacherAttendanceRoutes = createTeacherAttendanceRoutes;
const express_1 = require("express");
function createTeacherAttendanceRoutes(attendanceRecordController, authenticateTeacherUseCase) {
    const router = (0, express_1.Router)();
    router.use((request, response, next) => {
        const authorizationHeader = request.header("authorization") ?? "";
        const token = authorizationHeader.replace(/^Bearer\s+/i, "").trim();
        const teacherId = token ? authenticateTeacherUseCase.getTeacherIdForSessionToken(token) : null;
        if (!teacherId) {
            response.status(401).json({
                success: false,
                error: {
                    message: "Teacher login required.",
                },
            });
            return;
        }
        request.teacherId = teacherId;
        next();
    });
    router.get("/", attendanceRecordController.listForTeacher);
    router.post("/", attendanceRecordController.saveSession);
    return router;
}
