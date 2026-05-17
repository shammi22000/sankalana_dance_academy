"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClassRoutes = createClassRoutes;
const express_1 = require("express");
function createClassRoutes(teacherClassController) {
    const router = (0, express_1.Router)();
    router.get("/", teacherClassController.listAll);
    return router;
}
