import { Router } from "express";
import type { StudentRegistrationController } from "../controllers/StudentRegistrationController";

export function createStudentRegistrationRoutes(studentRegistrationController: StudentRegistrationController) {
  const router = Router();

  router.post("/", studentRegistrationController.create);

  return router;
}

