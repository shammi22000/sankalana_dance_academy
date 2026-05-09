import { useNavigate } from "react-router-dom";
import { AuthLoginPage } from "../components/AuthLoginPage";
import { loginTeacher } from "../services/authService";
import type { LoginCredentials } from "../types/auth";
import { showSuccessAlert } from "../utils/alerts";

export function TeacherLoginPage() {
  const navigate = useNavigate();

  async function handleTeacherLogin(credentials: LoginCredentials) {
    const authentication = await loginTeacher(credentials);

    localStorage.setItem("sankalanaTeacherSession", JSON.stringify(authentication));
    await showSuccessAlert("Login Successful", `Welcome back, ${authentication.teacher.fullName}.`);
    navigate("/teacher-dashboard", { replace: true });

    return;
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
