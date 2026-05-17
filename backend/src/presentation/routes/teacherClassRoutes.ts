import { Router } from "express";
import type { AuthenticateTeacherUseCase } from "../../application/use-cases/AuthenticateTeacherUseCase";
import type { TeacherAuthenticatedRequest, TeacherClassController } from "../controllers/TeacherClassController";

export function createTeacherClassRoutes(
  teacherClassController: TeacherClassController,
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

  router.get("/", teacherClassController.listMine);
  router.post("/", teacherClassController.create);
  router.patch("/:id", teacherClassController.update);
  router.delete("/:id", teacherClassController.delete);

  return router;
}
