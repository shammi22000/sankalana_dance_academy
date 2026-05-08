import { BadgeCheck, CalendarDays, LogOut, Mail, UserRoundCheck } from "lucide-react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { brandAssets } from "../assets/brand";
import type { TeacherAuthentication } from "../types/auth";

const sessionStorageKey = "sankalanaTeacherSession";

function getStoredTeacherSession(): TeacherAuthentication | null {
  const storedSession = localStorage.getItem(sessionStorageKey);

  if (!storedSession) {
    return null;
  }

  try {
    return JSON.parse(storedSession) as TeacherAuthentication;
  } catch {
    localStorage.removeItem(sessionStorageKey);
    return null;
  }
}

export function TeacherDashboardPage() {
  const navigate = useNavigate();
  const authentication = getStoredTeacherSession();

  if (!authentication) {
    return <Navigate to="/teacher-login" replace />;
  }

  function handleLogout() {
    localStorage.removeItem(sessionStorageKey);
    navigate("/teacher-login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-[#130714] text-white">
      <header className="border-b border-white/10 bg-[#1b0c1d]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3" aria-label="Back to home">
            <span className="relative inline-flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-orchid/30 bg-black shadow-[0_0_24px_rgba(217,28,255,0.18)]">
              <img src={brandAssets.logo} alt="Sankalana logo" className="h-full w-full object-cover" />
            </span>
            <span className="text-2xl font-black tracking-tight text-[#efb8ff] sm:text-3xl">
              Sankalana
            </span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-white/15 px-5 text-sm font-black text-white/80 transition hover:border-orchid/60 hover:text-white"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </header>

      <main className="relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(217,28,255,0.2),transparent_24rem),radial-gradient(circle_at_82%_84%,rgba(41,216,255,0.1),transparent_24rem)]" />

        <section className="relative z-10 mx-auto max-w-5xl">
          <p className="text-sm font-black uppercase tracking-[0.42em] text-[#d4a265]">
            Teacher Portal
          </p>
          <h1 className="mt-5 text-5xl font-black leading-none text-white sm:text-7xl">
            Welcome, {authentication.teacher.fullName}
          </h1>
          <p className="mt-5 max-w-3xl text-lg font-medium leading-8 text-white/70">
            You are signed in to your Sankalana teacher account. Application status:{" "}
            <span className="font-black text-[#efb8ff]">{authentication.teacher.applicationStatus}</span>.
          </p>

          <div className="mt-12 grid gap-5 md:grid-cols-4">
            <article className="rounded-[1.75rem] border border-white/10 bg-white/[0.055] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
              <UserRoundCheck className="text-[#efb8ff]" size={28} />
              <h2 className="mt-5 text-xl font-black">Username</h2>
              <p className="mt-2 text-base font-semibold text-white/65">{authentication.teacher.username}</p>
            </article>

            <article className="rounded-[1.75rem] border border-white/10 bg-white/[0.055] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
              <Mail className="text-cyanGlow" size={28} />
              <h2 className="mt-5 text-xl font-black">Email</h2>
              <p className="mt-2 break-words text-base font-semibold text-white/65">
                {authentication.teacher.email}
              </p>
            </article>

            <article className="rounded-[1.75rem] border border-white/10 bg-white/[0.055] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
              <BadgeCheck className="text-[#d4a265]" size={28} />
              <h2 className="mt-5 text-xl font-black">Styles</h2>
              <p className="mt-2 text-base font-semibold text-white/65">{authentication.teacher.danceStyles}</p>
            </article>

            <article className="rounded-[1.75rem] border border-white/10 bg-white/[0.055] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.24)]">
              <CalendarDays className="text-[#efb8ff]" size={28} />
              <h2 className="mt-5 text-xl font-black">Available</h2>
              <p className="mt-2 text-base font-semibold text-white/65">
                {authentication.teacher.availableDays.join(", ")}
              </p>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
