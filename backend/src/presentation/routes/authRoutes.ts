import { Router } from "express";
import type { AuthController } from "../controllers/AuthController";

export function createAuthRoutes(authController: AuthController) {
  const router = Router();

  router.post("/student/login", authController.loginStudent);
  router.post("/teacher/login", authController.loginTeacher);

  return router;
}
