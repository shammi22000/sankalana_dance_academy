"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTeacherRegistrationRoutes = createTeacherRegistrationRoutes;
const express_1 = require("express");
function createTeacherRegistrationRoutes(teacherRegistrationController) {
    const router = (0, express_1.Router)();
    router.post("/", teacherRegistrationController.create);
    return router;
}
