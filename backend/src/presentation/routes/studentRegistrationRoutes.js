"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createStudentRegistrationRoutes = createStudentRegistrationRoutes;
const express_1 = require("express");
function createStudentRegistrationRoutes(studentRegistrationController) {
    const router = (0, express_1.Router)();
    router.post("/", studentRegistrationController.create);
    return router;
}
