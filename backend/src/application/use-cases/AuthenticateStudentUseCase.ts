import { randomUUID } from "crypto";
import type {
  AuthenticateStudentDTO,
  StudentAuthenticationResponseDTO,
} from "../dto/AuthenticateStudentDTO";
import { ForbiddenError, UnauthorizedError, ValidationError } from "../errors/ApplicationError";
import { verifyPassword } from "../security/passwordHash";
import type { StudentRegistrationRepository } from "../../domain/repositories/StudentRegistrationRepository";

export class AuthenticateStudentUseCase {
  private readonly sessionStudentIds = new Map<string, string>();

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

    const studentJson = student.toJSON();
    const token = randomUUID();

    this.sessionStudentIds.set(token, studentJson.id);

    return {
      student: studentJson,
      session: {
        token,
        issuedAt: new Date().toISOString(),
      },
    };
  }

  getStudentIdForSessionToken(token: string): string | null {
    return this.sessionStudentIds.get(token) ?? null;
  }
}
