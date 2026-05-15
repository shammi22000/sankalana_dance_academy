import { Router } from "express";
import type { AuthenticateTeacherUseCase } from "../../application/use-cases/AuthenticateTeacherUseCase";
import type {
  EnrolmentApplicationController,
  TeacherAuthenticatedRequest,
} from "../controllers/EnrolmentApplicationController";

export function createTeacherEnrolmentRoutes(
  enrolmentApplicationController: EnrolmentApplicationController,
  authenticateTeacherUseCase: AuthenticateTeacherUseCase,
) {
  const router = Router();

  router.use((request: TeacherAuthenticatedRequest, response, next) => {
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

  router.get("/", enrolmentApplicationController.listForTeacher);
  router.patch("/:applicationId/status", enrolmentApplicationController.updateTeacherDecision);

  return router;
}
