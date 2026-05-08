import { Router } from "express";
import type { TeacherRegistrationController } from "../controllers/TeacherRegistrationController";

export function createTeacherRegistrationRoutes(teacherRegistrationController: TeacherRegistrationController) {
  const router = Router();

  router.post("/", teacherRegistrationController.create);

  return router;
}
