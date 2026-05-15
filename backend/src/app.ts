import cors from "cors";
import express from "express";
import { env } from "./config/env";
import { AuthenticateAdminUseCase } from "./application/use-cases/AuthenticateAdminUseCase";
import { AuthenticateStudentUseCase } from "./application/use-cases/AuthenticateStudentUseCase";
import { AuthenticateTeacherUseCase } from "./application/use-cases/AuthenticateTeacherUseCase";
import { CreateContactInquiryUseCase } from "./application/use-cases/CreateContactInquiryUseCase";
import { CreateStudentRegistrationUseCase } from "./application/use-cases/CreateStudentRegistrationUseCase";
import { CreateTeacherRegistrationUseCase } from "./application/use-cases/CreateTeacherRegistrationUseCase";
import { ManageAttendanceRecordsUseCase } from "./application/use-cases/ManageAttendanceRecordsUseCase";
import { ManageEnrolmentApplicationsUseCase } from "./application/use-cases/ManageEnrolmentApplicationsUseCase";
import { ManageTeacherClassesUseCase } from "./application/use-cases/ManageTeacherClassesUseCase";
import { ManageRegistrationApprovalsUseCase } from "./application/use-cases/ManageRegistrationApprovalsUseCase";
import { mongoDatabase } from "./infrastructure/database/MongoDatabase";
import { MongoAttendanceRecordRepository } from "./infrastructure/repositories/MongoAttendanceRecordRepository";
import { MongoContactInquiryRepository } from "./infrastructure/repositories/MongoContactInquiryRepository";
import { MongoEnrolmentApplicationRepository } from "./infrastructure/repositories/MongoEnrolmentApplicationRepository";
import { MongoStudentRegistrationRepository } from "./infrastructure/repositories/MongoStudentRegistrationRepository";
import { MongoTeacherClassRepository } from "./infrastructure/repositories/MongoTeacherClassRepository";
import { MongoTeacherRegistrationRepository } from "./infrastructure/repositories/MongoTeacherRegistrationRepository";
import { AdminRegistrationController } from "./presentation/controllers/AdminRegistrationController";
import { AttendanceRecordController } from "./presentation/controllers/AttendanceRecordController";
import { AuthController } from "./presentation/controllers/AuthController";
import { ContactController } from "./presentation/controllers/ContactController";
import { EnrolmentApplicationController } from "./presentation/controllers/EnrolmentApplicationController";
import { StudentRegistrationController } from "./presentation/controllers/StudentRegistrationController";
import { TeacherClassController } from "./presentation/controllers/TeacherClassController";
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
const teacherClassRepository = new MongoTeacherClassRepository(mongoDatabase);
const manageTeacherClassesUseCase = new ManageTeacherClassesUseCase(
  teacherClassRepository,
  teacherRegistrationRepository,
);
const teacherClassController = new TeacherClassController(manageTeacherClassesUseCase);
const enrolmentApplicationRepository = new MongoEnrolmentApplicationRepository(mongoDatabase);
const manageEnrolmentApplicationsUseCase = new ManageEnrolmentApplicationsUseCase(
  enrolmentApplicationRepository,
  studentRegistrationRepository,
  teacherRegistrationRepository,
  teacherClassRepository,
);
const enrolmentApplicationController = new EnrolmentApplicationController(manageEnrolmentApplicationsUseCase);
const attendanceRecordRepository = new MongoAttendanceRecordRepository(mongoDatabase);
const manageAttendanceRecordsUseCase = new ManageAttendanceRecordsUseCase(attendanceRecordRepository);
const attendanceRecordController = new AttendanceRecordController(manageAttendanceRecordsUseCase);
const authenticateStudentUseCase = new AuthenticateStudentUseCase(studentRegistrationRepository);
const authenticateTeacherUseCase = new AuthenticateTeacherUseCase(teacherRegistrationRepository);
const authenticateAdminUseCase = new AuthenticateAdminUseCase();
const authController = new AuthController(
  authenticateStudentUseCase,
  authenticateTeacherUseCase,
  authenticateAdminUseCase,
);
const manageRegistrationApprovalsUseCase = new ManageRegistrationApprovalsUseCase(
  studentRegistrationRepository,
  teacherRegistrationRepository,
);
const adminRegistrationController = new AdminRegistrationController(
  manageRegistrationApprovalsUseCase,
  createTeacherRegistrationUseCase,
);

app.use(
  cors({
    origin: env.corsOrigins,
  }),
);
app.use(express.json({ limit: "2mb" }));

app.use(
  "/api",
  createApiRoutes(
    contactController,
    studentRegistrationController,
    teacherRegistrationController,
    authController,
    adminRegistrationController,
    authenticateAdminUseCase,
    teacherClassController,
    authenticateTeacherUseCase,
    enrolmentApplicationController,
    authenticateStudentUseCase,
    attendanceRecordController,
  ),
);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
