import { Router } from "express";
import type { AuthenticateStudentUseCase } from "../../application/use-cases/AuthenticateStudentUseCase";
import type {
  EnrolmentApplicationController,
  StudentAuthenticatedRequest,
} from "../controllers/EnrolmentApplicationController";

export function createStudentEnrolmentRoutes(
  enrolmentApplicationController: EnrolmentApplicationController,
  authenticateStudentUseCase: AuthenticateStudentUseCase,
) {
  const router = Router();

  router.use((request: StudentAuthenticatedRequest, response, next) => {
    const authorizationHeader = request.header("authorization") ?? "";
    const token = authorizationHeader.replace(/^Bearer\s+/i, "").trim();
    const studentId = token ? authenticateStudentUseCase.getStudentIdForSessionToken(token) : null;

    if (!studentId) {
      response.status(401).json({
        success: false,
        error: {
          message: "Student login required.",
        },
      });
      return;
    }

    request.studentId = studentId;
    next();
  });

  router.get("/", enrolmentApplicationController.listForStudent);
  router.post("/", enrolmentApplicationController.createForStudent);

  return router;
}
