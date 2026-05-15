import { Router } from "express";
import type { AuthenticateTeacherUseCase } from "../../application/use-cases/AuthenticateTeacherUseCase";
import type {
  AttendanceRecordController,
  AttendanceTeacherAuthenticatedRequest,
} from "../controllers/AttendanceRecordController";

export function createTeacherAttendanceRoutes(
  attendanceRecordController: AttendanceRecordController,
  authenticateTeacherUseCase: AuthenticateTeacherUseCase,
) {
  const router = Router();

  router.use((request: AttendanceTeacherAuthenticatedRequest, response, next) => {
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

  router.get("/", attendanceRecordController.listForTeacher);
  router.post("/", attendanceRecordController.saveSession);

  return router;
}
