"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTeacherProfileRoutes = createTeacherProfileRoutes;
const express_1 = require("express");
function createTeacherProfileRoutes(teacherProfileController, authenticateTeacherUseCase) {
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
    router.patch("/", teacherProfileController.updateMyProfile);
    return router;
}
