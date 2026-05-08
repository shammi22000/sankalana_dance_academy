import type { StudentRegistrationResponseDTO } from "./CreateStudentRegistrationDTO";

export interface AuthenticateStudentDTO {
  identity: string;
  password: string;
}

export interface StudentAuthenticationResponseDTO {
  student: StudentRegistrationResponseDTO;
  session: {
    token: string;
    issuedAt: string;
  };
}
