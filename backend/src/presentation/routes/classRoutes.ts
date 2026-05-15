import { Router } from "express";
import type { TeacherClassController } from "../controllers/TeacherClassController";

export function createClassRoutes(teacherClassController: TeacherClassController) {
  const router = Router();

  router.get("/", teacherClassController.listAll);

  return router;
}
