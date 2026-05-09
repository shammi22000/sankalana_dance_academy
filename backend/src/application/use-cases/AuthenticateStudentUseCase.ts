import { randomUUID } from "crypto";
import type {
  AuthenticateStudentDTO,
  StudentAuthenticationResponseDTO,
} from "../dto/AuthenticateStudentDTO";
import { ForbiddenError, UnauthorizedError, ValidationError } from "../errors/ApplicationError";
import { verifyPassword } from "../security/passwordHash";
import type { StudentRegistrationRepository } from "../../domain/repositories/StudentRegistrationRepository";

export class AuthenticateStudentUseCase {
  constructor(private readonly studentRegistrationRepository: StudentRegistrationRepository) {}

  async execute(dto: AuthenticateStudentDTO): Promise<StudentAuthenticationResponseDTO> {
    const identity = dto.identity?.trim().toLowerCase() ?? "";
    const password = dto.password ?? "";

    if (!identity || !password) {
      throw new ValidationError({
        credentials: "Email or username and password are required.",
      });
    }

    const student =
      (await this.studentRegistrationRepository.findByEmail(identity)) ??
      (await this.studentRegistrationRepository.findByUsername(identity));

    if (!student || !verifyPassword(password, student.passwordHash)) {
      throw new UnauthorizedError();
    }

    if (student.approvalStatus !== "approved") {
      throw new ForbiddenError(
        student.approvalStatus === "rejected"
          ? "This student account was rejected by admin."
          : "This student account is pending admin approval.",
      );
    }

    return {
      student: student.toJSON(),
      session: {
        token: randomUUID(),
        issuedAt: new Date().toISOString(),
      },
    };
  }

}
