import type { TeacherRegistrationResponseDTO } from "./CreateTeacherRegistrationDTO";

export interface AuthenticateTeacherDTO {
  identity: string;
  password: string;
}

export interface TeacherAuthenticationResponseDTO {
  teacher: TeacherRegistrationResponseDTO;
  session: {
    token: string;
    issuedAt: string;
  };
}
