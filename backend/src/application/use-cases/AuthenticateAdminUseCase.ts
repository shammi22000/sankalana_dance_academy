import { randomUUID } from "crypto";
import type { AdminAuthenticationResponseDTO, AuthenticateAdminDTO } from "../dto/AuthenticateAdminDTO";
import { UnauthorizedError, ValidationError } from "../errors/ApplicationError";

export class AuthenticateAdminUseCase {
  private readonly sessionTokens = new Set<string>();

  async execute(dto: AuthenticateAdminDTO): Promise<AdminAuthenticationResponseDTO> {
    const username = dto.username?.trim() ?? "";
    const password = dto.password ?? "";

    if (!username || !password) {
      throw new ValidationError({
        credentials: "Admin username and password are required.",
      });
    }

    if (username !== "admin" || password !== "admin") {
      throw new UnauthorizedError("Invalid admin username or password.");
    }

    const token = randomUUID();
    this.sessionTokens.add(token);

    return {
      admin: {
        username: "admin",
        displayName: "Admin",
        role: "admin",
      },
      session: {
        token,
        issuedAt: new Date().toISOString(),
      },
    };
  }

  isValidSessionToken(token: string) {
    return this.sessionTokens.has(token);
  }
}
