import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { AuthenticateStudentUseCase } from "./application/use-cases/AuthenticateStudentUseCase";
import { AuthenticateTeacherUseCase } from "./application/use-cases/AuthenticateTeacherUseCase";
import { CreateContactInquiryUseCase } from "./application/use-cases/CreateContactInquiryUseCase";
import { CreateStudentRegistrationUseCase } from "./application/use-cases/CreateStudentRegistrationUseCase";
import { CreateTeacherRegistrationUseCase } from "./application/use-cases/CreateTeacherRegistrationUseCase";
import { mongoDatabase } from "./infrastructure/database/MongoDatabase";
import { MongoContactInquiryRepository } from "./infrastructure/repositories/MongoContactInquiryRepository";
import { MongoStudentRegistrationRepository } from "./infrastructure/repositories/MongoStudentRegistrationRepository";
import { MongoTeacherRegistrationRepository } from "./infrastructure/repositories/MongoTeacherRegistrationRepository";
import { AuthController } from "./presentation/controllers/AuthController";
import { ContactController } from "./presentation/controllers/ContactController";
import { StudentRegistrationController } from "./presentation/controllers/StudentRegistrationController";
import { TeacherRegistrationController } from "./presentation/controllers/TeacherRegistrationController";
import { createApiRoutes } from "./presentation/routes";
import { errorHandler } from "./presentation/middlewares/errorHandler";
import { notFoundHandler } from "./presentation/middlewares/notFoundHandler";

const app = express();

const contactInquiryRepository = new MongoContactInquiryRepository(mongoDatabase);
const createContactInquiryUseCase = new CreateContactInquiryUseCase(contactInquiryRepository);
const contactController = new ContactController(createContactInquiryUseCase);
const studentRegistrationRepository = new MongoStudentRegistrationRepository(mongoDatabase);
const createStudentRegistrationUseCase = new CreateStudentRegistrationUseCase(studentRegistrationRepository);
const studentRegistrationController = new StudentRegistrationController(createStudentRegistrationUseCase);
const teacherRegistrationRepository = new MongoTeacherRegistrationRepository(mongoDatabase);
const createTeacherRegistrationUseCase = new CreateTeacherRegistrationUseCase(teacherRegistrationRepository);
const teacherRegistrationController = new TeacherRegistrationController(createTeacherRegistrationUseCase);
const authenticateStudentUseCase = new AuthenticateStudentUseCase(studentRegistrationRepository);
const authenticateTeacherUseCase = new AuthenticateTeacherUseCase(teacherRegistrationRepository);
const authController = new AuthController(authenticateStudentUseCase, authenticateTeacherUseCase);

app.use(
  cors({
    origin: env.corsOrigins,
  }),
);
app.use(express.json());

app.use(
  "/api",
  createApiRoutes(contactController, studentRegistrationController, teacherRegistrationController, authController),
);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
