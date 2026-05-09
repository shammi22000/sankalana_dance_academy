import {
  Bell,
  CalendarDays,
  Clock3,
  CreditCard,
  FileText,
  Grid2X2,
  HelpCircle,
  History,
  LogOut,
  Settings,
  Sparkles,
  Theater,
  UserRoundPen,
  BadgePlus,
} from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { danceImages } from "../assets/danceImages";
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

function formatMonthDay(date: Date) {
  return date.toLocaleDateString("en", {
    month: "short",
    day: "numeric",
  });
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

  const student = authentication.student;
  const firstName = student.fullName.split(" ")[0] || student.fullName;
  const createdAt = new Date(student.createdAt);
  const expectedUpdate = new Date(createdAt);
  const approvalStatusLabel = student.approvalStatus.charAt(0).toUpperCase() + student.approvalStatus.slice(1);

  expectedUpdate.setDate(expectedUpdate.getDate() + 6);

  const sidebarItems = [
    { label: "Dashboard", icon: Grid2X2, active: true },
    { label: "My Classes", icon: Sparkles },
    { label: "Schedule", icon: CalendarDays },
    { label: "Performances", icon: Theater },
    { label: "Payments", icon: CreditCard },
    { label: "Settings", icon: Settings },
  ];

  const quickActions = [
    { label: "New Enrollment", icon: BadgePlus, color: "bg-orchid/35 text-orchid" },
    { label: "Edit Profile", icon: UserRoundPen, color: "bg-cyanGlow/25 text-cyanGlow" },
    { label: "View History", icon: History, color: "bg-[#e234a8]/25 text-[#ff7ed3]" },
    { label: "Support", icon: HelpCircle, color: "bg-white/10 text-white/70" },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <PageHeader ctaLabel="Logout" onCtaClick={handleLogout} />

      <div className="grid min-h-[calc(100svh-5rem)] lg:grid-cols-[19rem_1fr]">
        <aside className="relative z-20 border-b border-white/10 bg-[#120415]/96 px-4 py-5 shadow-[18px_0_70px_rgba(134,20,190,0.12)] lg:border-b-0 lg:border-r">
          <nav className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1" aria-label="Student dashboard">
            {sidebarItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  type="button"
                  className={`flex min-h-14 items-center gap-4 rounded-2xl px-5 text-left text-sm font-black transition ${
                    item.active
                      ? "bg-gradient-to-r from-orchid to-[#bb26ff] text-white shadow-[0_18px_45px_rgba(217,28,255,0.34)]"
                      : "text-white/[0.58] hover:bg-white/[0.08] hover:text-white"
                  }`}
                >
                  <Icon size={23} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-8 flex min-h-14 w-full items-center gap-4 rounded-2xl border border-white/10 px-5 text-left text-sm font-black text-white/65 transition hover:border-orchid/50 hover:text-white"
          >
            <LogOut size={22} />
            Logout
          </button>
        </aside>

        <main className="relative overflow-hidden px-5 py-8 sm:px-8 lg:px-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_18%,rgba(188,38,255,0.23),transparent_28rem),radial-gradient(circle_at_84%_85%,rgba(41,216,255,0.14),transparent_24rem)]" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#1b071f]/78 via-black to-[#020404]" />

          <section className="relative z-10 mx-auto max-w-7xl">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h1 className="text-5xl font-black leading-none text-[#f4e7fb] sm:text-6xl">
                  Welcome back, {firstName}!
                </h1>
                <p className="mt-4 text-lg font-semibold text-white/[0.62]">
                  You're making great progress this season.
                </p>
              </div>

              <button
                type="button"
                className="relative inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.08] text-white/80 shadow-[0_12px_35px_rgba(0,0,0,0.28)]"
                aria-label="Notifications"
              >
                <Bell size={23} />
                <span className="absolute right-4 top-3 h-2.5 w-2.5 rounded-full bg-cyanGlow" />
              </button>
            </div>

            <div className="mt-12 grid gap-7 xl:grid-cols-[23rem_1fr]">
              <article className="rounded-[1.75rem] border border-white/[0.12] bg-white/[0.055] p-8 shadow-[0_24px_90px_rgba(0,0,0,0.26)] backdrop-blur-xl">
                <div className="mx-auto flex aspect-square max-w-52 items-center justify-center rounded-full bg-[conic-gradient(#c026ff_0deg,#c026ff_331deg,rgba(255,255,255,0.11)_331deg,rgba(255,255,255,0.11)_360deg)] p-3">
                  <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-[#17061d]">
                    <p className="text-5xl font-black text-[#f0c6ff]">92%</p>
                    <p className="mt-1 text-sm font-black text-white/[0.62]">Attendance</p>
                  </div>
                </div>
                <p className="mx-auto mt-9 max-w-56 text-center text-base font-semibold leading-7 text-white/[0.62]">
                  You've attended 23 out of 25 sessions this month. Keep it up!
                </p>
              </article>

              <article className="rounded-[1.75rem] border border-white/[0.12] bg-white/[0.055] p-8 shadow-[0_24px_90px_rgba(0,0,0,0.26)] backdrop-blur-xl">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.32em] text-white/70">
                      Application Status
                    </p>
                    <h2 className="mt-4 max-w-xl text-4xl font-black leading-tight text-[#f4e7fb]">
                      Sri Lankan Classical Dance Enrollment
                    </h2>
                  </div>

                  <span className="inline-flex w-fit items-center gap-3 rounded-full border border-white/10 bg-white/[0.08] px-5 py-3 text-sm font-black leading-4 text-white/[0.78]">
                    <span className="h-2.5 w-2.5 rounded-full bg-cyanGlow" />
                    {approvalStatusLabel}
                  </span>
                </div>

                <div className="mt-9 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl bg-white/[0.07] p-5">
                    <p className="text-sm font-bold text-white/52">Submitted</p>
                    <p className="mt-2 text-3xl font-black text-[#f4e7fb]">{formatMonthDay(createdAt)}</p>
                  </div>
                  <div className="rounded-2xl bg-white/[0.07] p-5">
                    <p className="text-sm font-bold text-white/52">Expected Update</p>
                    <p className="mt-2 text-3xl font-black text-[#f4e7fb]">{formatMonthDay(expectedUpdate)}</p>
                  </div>
                  <div className="rounded-2xl bg-white/[0.07] p-5">
                    <p className="text-sm font-bold text-white/52">Instructor</p>
                    <p className="mt-2 text-3xl font-black text-[#f4e7fb]">S. Faculty</p>
                  </div>
                </div>

                <button
                  type="button"
                  className="mt-8 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] text-lg font-black text-white/80 transition hover:border-orchid/50 hover:text-white"
                >
                  <FileText size={20} />
                  View Details
                </button>
              </article>
            </div>

            <div className="mt-7 grid gap-7 xl:grid-cols-[1fr_29rem]">
              <article className="rounded-[1.75rem] border border-white/[0.12] bg-white/[0.055] p-8 shadow-[0_24px_90px_rgba(0,0,0,0.26)] backdrop-blur-xl">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="flex items-center gap-4 text-3xl font-black text-[#f4e7fb]">
                    <Clock3 className="text-[#f0b7ff]" size={31} />
                    Next Performance Practice
                  </h2>
                  <p className="text-sm font-black text-[#f0b7ff]">Starts in 45m</p>
                </div>

                <div className="mt-8 flex flex-col gap-7 sm:flex-row sm:items-center">
                  <img
                    src={danceImages.heroCarousel[1].src}
                    alt=""
                    className="h-28 w-32 rounded-2xl object-cover shadow-[0_16px_35px_rgba(0,0,0,0.35)]"
                  />
                  <div>
                    <h3 className="text-3xl font-black text-[#f4e7fb]">Winter Showcase Prep</h3>
                    <p className="mt-3 text-lg font-semibold text-white/[0.62]">
                      Studio 4 - Level 3 - Stage Formations
                    </p>
                    <p className="mt-5 text-sm font-black text-white/[0.62]">
                      with Sankalana group and 14 others
                    </p>
                  </div>
                </div>
              </article>

              <div className="grid gap-5 sm:grid-cols-2">
                {quickActions.map((action) => {
                  const Icon = action.icon;

                  return (
                    <button
                      key={action.label}
                      type="button"
                      className="flex min-h-36 flex-col items-center justify-center rounded-[1.75rem] border border-white/[0.12] bg-white/[0.055] p-6 text-center shadow-[0_24px_90px_rgba(0,0,0,0.22)] transition hover:-translate-y-1 hover:border-orchid/45"
                    >
                      <span className={`inline-flex h-14 w-14 items-center justify-center rounded-full ${action.color}`}>
                        <Icon size={28} />
                      </span>
                      <span className="mt-4 text-sm font-black text-white/70">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
