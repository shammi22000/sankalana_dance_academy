import { CalendarDays, Mail, UserRound } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import type { StudentAuthentication } from "../types/auth";

const sessionStorageKey = "sankalanaStudentSession";

function getStoredStudentSession(): StudentAuthentication | null {
  const storedSession = localStorage.getItem(sessionStorageKey);

  if (!storedSession) {
    return null;
  }

  try {
    return JSON.parse(storedSession) as StudentAuthentication;
  } catch {
    localStorage.removeItem(sessionStorageKey);
    return null;
  }
}

export function StudentDashboardPage() {
  const navigate = useNavigate();
  const authentication = getStoredStudentSession();

  if (!authentication) {
    return <Navigate to="/student-login" replace />;
  }

  function handleLogout() {
    localStorage.removeItem(sessionStorageKey);
    navigate("/student-login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-[#120405] text-white">
      <PageHeader ctaLabel="Logout" onCtaClick={handleLogout} />

      <main className="relative min-h-[calc(100svh-5rem)] overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(217,28,255,0.14),transparent_25rem),radial-gradient(circle_at_78%_30%,rgba(41,216,255,0.1),transparent_25rem)]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#5c2520] to-transparent" />

        <section className="relative z-10 mx-auto max-w-5xl pt-4">
          <p className="text-sm font-black uppercase tracking-[0.42em] text-champagne">
            Student Portal
          </p>
          <h1 className="mt-5 text-5xl font-black leading-none text-white sm:text-7xl">
            Welcome, {authentication.student.fullName}
          </h1>
          <p className="mt-5 max-w-3xl text-lg font-medium leading-8 text-white/75">
            You are signed in to your Sankalana student account. Your session started on{" "}
            {new Date(authentication.session.issuedAt).toLocaleString()}.
          </p>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            <article className="rounded-[1.75rem] border border-[#5c2520] bg-[#180607]/82 p-6 shadow-[0_26px_80px_rgba(0,0,0,0.25)]">
              <UserRound className="text-champagne" size={28} />
              <h2 className="mt-5 text-xl font-black">Username</h2>
              <p className="mt-2 text-base font-semibold text-[#d9c8ba]">{authentication.student.username}</p>
            </article>

            <article className="rounded-[1.75rem] border border-[#5c2520] bg-[#180607]/82 p-6 shadow-[0_26px_80px_rgba(0,0,0,0.25)]">
              <Mail className="text-cyanGlow" size={28} />
              <h2 className="mt-5 text-xl font-black">Email</h2>
              <p className="mt-2 break-words text-base font-semibold text-[#d9c8ba]">
                {authentication.student.email}
              </p>
            </article>

            <article className="rounded-[1.75rem] border border-[#5c2520] bg-[#180607]/82 p-6 shadow-[0_26px_80px_rgba(0,0,0,0.25)]">
              <CalendarDays className="text-champagne" size={28} />
              <h2 className="mt-5 text-xl font-black">Member Since</h2>
              <p className="mt-2 text-base font-semibold text-[#d9c8ba]">
                {new Date(authentication.student.createdAt).toLocaleDateString()}
              </p>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
