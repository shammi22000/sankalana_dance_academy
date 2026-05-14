import { Router } from "express";
import type { AuthenticateAdminUseCase } from "../../application/use-cases/AuthenticateAdminUseCase";
import type { AdminRegistrationController } from "../controllers/AdminRegistrationController";

export function createAdminRoutes(
  adminRegistrationController: AdminRegistrationController,
  authenticateAdminUseCase: AuthenticateAdminUseCase,
) {
  const router = Router();

  router.use((request, response, next) => {
    const authorizationHeader = request.header("authorization") ?? "";
    const token = authorizationHeader.replace(/^Bearer\s+/i, "").trim();

    if (!token || !authenticateAdminUseCase.isValidSessionToken(token)) {
      response.status(401).json({
        success: false,
        error: {
          message: "Admin login required.",
        },
      });
      return;
    }

    next();
  });

  router.get("/registrations/pending", adminRegistrationController.listPendingRegistrations);
  router.get("/student-registrations", adminRegistrationController.listStudentRegistrations);
  router.post("/teacher-registrations", adminRegistrationController.createTeacherRegistration);
  router.get("/teacher-registrations", adminRegistrationController.listTeacherRegistrations);
  router.patch("/student-registrations/:id", adminRegistrationController.updateStudentProfile);
  router.patch("/student-registrations/:id/password", adminRegistrationController.updateStudentPassword);
  router.patch("/student-registrations/:id/approval", adminRegistrationController.updateStudentApprovalStatus);
  router.patch("/teacher-registrations/:id/password", adminRegistrationController.updateTeacherPassword);
  router.patch("/teacher-registrations/:id/approval", adminRegistrationController.updateTeacherApplicationStatus);

  return router;
}
