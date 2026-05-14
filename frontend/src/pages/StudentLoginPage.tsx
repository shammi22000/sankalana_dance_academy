import { AuthLoginPage } from "../components/AuthLoginPage";
import { loginStudent } from "../services/authService";
import type { LoginCredentials } from "../types/auth";
import { useNavigate } from "react-router-dom";
import { showSuccessAlert } from "../utils/alerts";

export function StudentLoginPage() {
  const navigate = useNavigate();

  async function handleStudentLogin(credentials: LoginCredentials) {
    const authentication = await loginStudent(credentials);

    localStorage.setItem("sankalanaStudentSession", JSON.stringify(authentication));
    await showSuccessAlert("Login Successful", `Welcome back, ${authentication.student.fullName}.`);
    navigate("/student-dashboard", { replace: true });

    return;
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
