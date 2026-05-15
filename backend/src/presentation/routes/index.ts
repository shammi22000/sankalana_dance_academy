import { Router } from "express";
import type { AuthenticateAdminUseCase } from "../../application/use-cases/AuthenticateAdminUseCase";
import type { AuthenticateStudentUseCase } from "../../application/use-cases/AuthenticateStudentUseCase";
import type { AuthenticateTeacherUseCase } from "../../application/use-cases/AuthenticateTeacherUseCase";
import type { AdminRegistrationController } from "../controllers/AdminRegistrationController";
import type { AttendanceRecordController } from "../controllers/AttendanceRecordController";
import type { AuthController } from "../controllers/AuthController";
import type { ContactController } from "../controllers/ContactController";
import type { EnrolmentApplicationController } from "../controllers/EnrolmentApplicationController";
import type { StudentRegistrationController } from "../controllers/StudentRegistrationController";
import type { TeacherClassController } from "../controllers/TeacherClassController";
import type { TeacherRegistrationController } from "../controllers/TeacherRegistrationController";
import { createAdminRoutes } from "./adminRoutes";
import { createAuthRoutes } from "./authRoutes";
import { createClassRoutes } from "./classRoutes";
import { createContactRoutes } from "./contactRoutes";
import { createStudentEnrolmentRoutes } from "./studentEnrolmentRoutes";
import { createStudentRegistrationRoutes } from "./studentRegistrationRoutes";
import { createTeacherAttendanceRoutes } from "./teacherAttendanceRoutes";
import { createTeacherClassRoutes } from "./teacherClassRoutes";
import { createTeacherEnrolmentRoutes } from "./teacherEnrolmentRoutes";
import { createTeacherRegistrationRoutes } from "./teacherRegistrationRoutes";

export function createApiRoutes(
  contactController: ContactController,
  studentRegistrationController: StudentRegistrationController,
  teacherRegistrationController: TeacherRegistrationController,
  authController: AuthController,
  adminRegistrationController: AdminRegistrationController,
  authenticateAdminUseCase: AuthenticateAdminUseCase,
  teacherClassController: TeacherClassController,
  authenticateTeacherUseCase: AuthenticateTeacherUseCase,
  enrolmentApplicationController: EnrolmentApplicationController,
  authenticateStudentUseCase: AuthenticateStudentUseCase,
  attendanceRecordController: AttendanceRecordController,
) {
  const router = Router();

  router.get("/health", (_request, response) => {
    response.json({
      success: true,
      data: {
        status: "ok",
      },
    });
  });

  router.use("/contact", createContactRoutes(contactController));
  router.use("/student-registrations", createStudentRegistrationRoutes(studentRegistrationController));
  router.use("/teacher-registrations", createTeacherRegistrationRoutes(teacherRegistrationController));
  router.use("/auth", createAuthRoutes(authController));
  router.use("/admin", createAdminRoutes(adminRegistrationController, authenticateAdminUseCase));
  router.use("/classes", createClassRoutes(teacherClassController));
  router.use("/teacher/classes", createTeacherClassRoutes(teacherClassController, authenticateTeacherUseCase));
  router.use("/student/enrolments", createStudentEnrolmentRoutes(enrolmentApplicationController, authenticateStudentUseCase));
  router.use("/teacher/enrolments", createTeacherEnrolmentRoutes(enrolmentApplicationController, authenticateTeacherUseCase));
  router.use("/teacher/attendance", createTeacherAttendanceRoutes(attendanceRecordController, authenticateTeacherUseCase));

  return router;
}
