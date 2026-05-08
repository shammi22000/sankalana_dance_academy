import { Router } from "express";
import type { ContactController } from "../controllers/ContactController";

export function createContactRoutes(contactController: ContactController) {
  const router = Router();

  router.post("/", contactController.create);

  return router;
}

