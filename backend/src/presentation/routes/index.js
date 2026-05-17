"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApiRoutes = createApiRoutes;
const express_1 = require("express");
const adminRoutes_1 = require("./adminRoutes");
const authRoutes_1 = require("./authRoutes");
const classRoutes_1 = require("./classRoutes");
const studentAttendanceRoutes_1 = require("./studentAttendanceRoutes");
const contactRoutes_1 = require("./contactRoutes");
const studentEnrolmentRoutes_1 = require("./studentEnrolmentRoutes");
const studentRegistrationRoutes_1 = require("./studentRegistrationRoutes");
const teacherAttendanceRoutes_1 = require("./teacherAttendanceRoutes");
const teacherClassRoutes_1 = require("./teacherClassRoutes");
const teacherEnrolmentRoutes_1 = require("./teacherEnrolmentRoutes");
const teacherProfileRoutes_1 = require("./teacherProfileRoutes");
const teacherRegistrationRoutes_1 = require("./teacherRegistrationRoutes");
function createApiRoutes(contactController, studentRegistrationController, teacherRegistrationController, authController, adminRegistrationController, authenticateAdminUseCase, teacherClassController, authenticateTeacherUseCase, enrolmentApplicationController, authenticateStudentUseCase, attendanceRecordController, teacherProfileController) {
    const router = (0, express_1.Router)();
    router.get("/health", (_request, response) => {
        response.json({
            success: true,
            data: {
                status: "ok",
            },
        });
    });
    router.use("/contact", (0, contactRoutes_1.createContactRoutes)(contactController));
    router.use("/student-registrations", (0, studentRegistrationRoutes_1.createStudentRegistrationRoutes)(studentRegistrationController));
    router.use("/teacher-registrations", (0, teacherRegistrationRoutes_1.createTeacherRegistrationRoutes)(teacherRegistrationController));
    router.use("/auth", (0, authRoutes_1.createAuthRoutes)(authController));
    router.use("/admin", (0, adminRoutes_1.createAdminRoutes)(adminRegistrationController, authenticateAdminUseCase, enrolmentApplicationController));
    router.use("/classes", (0, classRoutes_1.createClassRoutes)(teacherClassController));
    router.use("/teacher/classes", (0, teacherClassRoutes_1.createTeacherClassRoutes)(teacherClassController, authenticateTeacherUseCase));
    router.use("/student/attendance", (0, studentAttendanceRoutes_1.createStudentAttendanceRoutes)(attendanceRecordController, authenticateStudentUseCase));
    router.use("/student/enrolments", (0, studentEnrolmentRoutes_1.createStudentEnrolmentRoutes)(enrolmentApplicationController, authenticateStudentUseCase));
    router.use("/teacher/enrolments", (0, teacherEnrolmentRoutes_1.createTeacherEnrolmentRoutes)(enrolmentApplicationController, authenticateTeacherUseCase));
    router.use("/teacher/attendance", (0, teacherAttendanceRoutes_1.createTeacherAttendanceRoutes)(attendanceRecordController, authenticateTeacherUseCase));
    router.use("/teacher/profile", (0, teacherProfileRoutes_1.createTeacherProfileRoutes)(teacherProfileController, authenticateTeacherUseCase));
    return router;
}
