"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthRoutes = createAuthRoutes;
const express_1 = require("express");
function createAuthRoutes(authController) {
    const router = (0, express_1.Router)();
    router.post("/student/login", authController.loginStudent);
    router.post("/teacher/login", authController.loginTeacher);
    router.post("/admin/login", authController.loginAdmin);
    return router;
}
