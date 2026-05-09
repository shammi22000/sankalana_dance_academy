import { Router } from "express";
import type { AuthenticateAdminUseCase } from "../../application/use-cases/AuthenticateAdminUseCase";
import type { AdminRegistrationController } from "../controllers/AdminRegistrationController";
import type { AuthController } from "../controllers/AuthController";
import type { ContactController } from "../controllers/ContactController";
import type { StudentRegistrationController } from "../controllers/StudentRegistrationController";
import type { TeacherRegistrationController } from "../controllers/TeacherRegistrationController";
import { createAdminRoutes } from "./adminRoutes";
import { createAuthRoutes } from "./authRoutes";
import { createContactRoutes } from "./contactRoutes";
import { createStudentRegistrationRoutes } from "./studentRegistrationRoutes";
import { createTeacherRegistrationRoutes } from "./teacherRegistrationRoutes";

export function createApiRoutes(
  contactController: ContactController,
  studentRegistrationController: StudentRegistrationController,
  teacherRegistrationController: TeacherRegistrationController,
  authController: AuthController,
  adminRegistrationController: AdminRegistrationController,
  authenticateAdminUseCase: AuthenticateAdminUseCase,
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

  return router;
}
