"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createContactRoutes = createContactRoutes;
const express_1 = require("express");
function createContactRoutes(contactController) {
    const router = (0, express_1.Router)();
    router.post("/", contactController.create);
    return router;
}
