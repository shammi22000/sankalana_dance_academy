import { randomUUID } from "crypto";
import type {
  AuthenticateTeacherDTO,
  TeacherAuthenticationResponseDTO,
} from "../dto/AuthenticateTeacherDTO";
import { ForbiddenError, UnauthorizedError, ValidationError } from "../errors/ApplicationError";
import { verifyPassword } from "../security/passwordHash";
import type { TeacherRegistrationRepository } from "../../domain/repositories/TeacherRegistrationRepository";

export class AuthenticateTeacherUseCase {
  constructor(private readonly teacherRegistrationRepository: TeacherRegistrationRepository) {}

  async execute(dto: AuthenticateTeacherDTO): Promise<TeacherAuthenticationResponseDTO> {
    const identity = dto.identity?.trim().toLowerCase() ?? "";
    const password = dto.password ?? "";

    if (!identity || !password) {
      throw new ValidationError({
        credentials: "Email or username and password are required.",
      });
    }

    const teacher =
      (await this.teacherRegistrationRepository.findByEmail(identity)) ??
      (await this.teacherRegistrationRepository.findByUsername(identity));

    if (!teacher || !verifyPassword(password, teacher.passwordHash)) {
      throw new UnauthorizedError();
    }

    if (teacher.applicationStatus !== "approved") {
      throw new ForbiddenError(
        teacher.applicationStatus === "rejected"
          ? "This teacher account was rejected by admin."
          : "This teacher account is pending admin approval.",
      );
    }

    return {
      teacher: teacher.toJSON(),
      session: {
        token: randomUUID(),
        issuedAt: new Date().toISOString(),
      },
    };
  }
}
