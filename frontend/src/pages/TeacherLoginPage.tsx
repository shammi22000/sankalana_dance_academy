import { useNavigate } from "react-router-dom";
import { AuthLoginPage } from "../components/AuthLoginPage";
import { loginTeacher } from "../services/authService";
import type { LoginCredentials } from "../types/auth";

export function TeacherLoginPage() {
  const navigate = useNavigate();

  async function handleTeacherLogin(credentials: LoginCredentials) {
    const authentication = await loginTeacher(credentials);

    localStorage.setItem("sankalanaTeacherSession", JSON.stringify(authentication));
    window.setTimeout(() => {
      navigate("/teacher-dashboard", { replace: true });
    }, 400);

    return `Welcome back, ${authentication.teacher.fullName}. Login successful.`;
  }

  return (
    <AuthLoginPage
      roleLabel="Teacher"
      subtitle="Access your classes, attendance tools, and teaching dashboard."
      statusMessage="Teacher login successful."
      onSubmit={handleTeacherLogin}
    />
  );
}
