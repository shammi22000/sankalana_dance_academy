export interface AuthenticateAdminDTO {
  username: string;
  password: string;
}

export interface AdminAuthenticationResponseDTO {
  admin: {
    username: string;
    displayName: string;
    role: "admin";
  };
  session: {
    token: string;
    issuedAt: string;
  };
}
