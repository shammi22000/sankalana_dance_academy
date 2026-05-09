import { Navigate, Route, Routes } from "react-router-dom";
import { LandingPage } from "../pages/LandingPage";
import { LoginChoicePage } from "../pages/LoginChoicePage";
import { RegistrationPage } from "../pages/RegistrationPage";
import { StudentRegistrationPage } from "../pages/StudentRegistrationPage";
import { StudentLoginPage } from "../pages/StudentLoginPage";
import { StudentDashboardPage } from "../pages/StudentDashboardPage";
import { TeacherRegistrationPage } from "../pages/TeacherRegistrationPage";
import { TeacherLoginPage } from "../pages/TeacherLoginPage";
import { TeacherDashboardPage } from "../pages/TeacherDashboardPage";
import { AdminLoginPage } from "../pages/AdminLoginPage";
import { AdminDashboardPage } from "../pages/AdminDashboardPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginChoicePage />} />
      <Route path="/register" element={<RegistrationPage />} />
      <Route path="/student-register" element={<StudentRegistrationPage />} />
      <Route path="/student-login" element={<StudentLoginPage />} />
      <Route path="/student-dashboard" element={<StudentDashboardPage />} />
      <Route path="/teacher-register" element={<TeacherRegistrationPage />} />
      <Route path="/teacher-login" element={<TeacherLoginPage />} />
      <Route path="/teacher-dashboard" element={<TeacherDashboardPage />} />
      <Route path="/admin" element={<AdminLoginPage />} />
      <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
      <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
