import { AuthLoginPage } from "../components/AuthLoginPage";
import { loginStudent } from "../services/authService";
import type { LoginCredentials } from "../types/auth";
import { useNavigate } from "react-router-dom";

export function StudentLoginPage() {
  const navigate = useNavigate();

  async function handleStudentLogin(credentials: LoginCredentials) {
    const authentication = await loginStudent(credentials);

    localStorage.setItem("sankalanaStudentSession", JSON.stringify(authentication));
    window.setTimeout(() => {
      navigate("/student-dashboard", { replace: true });
    }, 400);

    return `Welcome back, ${authentication.student.fullName}. Login successful.`;
  }

  return (
    <AuthLoginPage
      roleLabel="Student"
      subtitle="Enter the spotlight and continue your learning journey."
      statusMessage="Student login successful."
      onSubmit={handleStudentLogin}
    />
  );
}
