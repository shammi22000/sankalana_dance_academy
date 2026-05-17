import {
  ArrowRight,
  BadgeCheck,
  BadgePlus,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Flag,
  Grid2X2,
  HelpCircle,
  History,
  Hourglass,
  LogOut,
  Settings,
  Sparkles,
  Theater,
  UserRound,
  UserRoundPen,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { danceImages } from "../assets/danceImages";
import { PageHeader } from "../components/PageHeader";
import { getStudentEnrolments } from "../services/enrolmentService";
import type { StudentAuthentication } from "../types/auth";
import { cn } from "../utils/cn";
import {
  getClassSlot,
  getDanceStyle,
  getTeacher,
  readSubmittedEnrolment,
  type SubmittedEnrolment,
} from "./StudentEnrolmentPage";

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

function formatSubmittedDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return date.toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function StudentDashboardPage() {
  const navigate = useNavigate();
  const authentication = getStoredStudentSession();
  const [submittedEnrolment, setSubmittedEnrolment] = useState<SubmittedEnrolment | null>(() => readSubmittedEnrolment());

  useEffect(() => {
    if (!authentication) {
      return;
    }

    let isMounted = true;

    async function loadEnrolments() {
      try {
        const applications = await getStudentEnrolments();

        if (isMounted) {
          setSubmittedEnrolment(applications[0] ?? null);
        }
      } catch {
        if (isMounted) {
          setSubmittedEnrolment(readSubmittedEnrolment());
        }
      }
    }

    void loadEnrolments();

    return () => {
      isMounted = false;
    };
  }, [authentication?.student.id]);

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
    { label: "Enrolment", icon: BadgePlus, to: "/student/enrolment" },
    { label: "My Classes", icon: Sparkles },
    { label: "Schedule", icon: CalendarDays },
    { label: "Performances", icon: Theater },
    { label: "Settings", icon: Settings },
  ];

  const quickActions = [
    { label: "Add Enrolment", icon: BadgePlus, color: "bg-orchid/35 text-orchid", to: "/student/enrolment" },
    { label: "Edit Profile", icon: UserRoundPen, color: "bg-cyanGlow/25 text-cyanGlow" },
    { label: "View History", icon: History, color: "bg-[#e234a8]/25 text-[#ff7ed3]", to: "/student/enrolment/status" },
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
                  onClick={() => {
                    if (item.to) {
                      navigate(item.to);
                    }
                  }}
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

              <EnrolmentProgressCard
                enrolment={submittedEnrolment}
                fallbackStatus={approvalStatusLabel}
                fallbackSubmitted={formatMonthDay(createdAt)}
                fallbackExpectedUpdate={formatMonthDay(expectedUpdate)}
                onStart={() => navigate("/student/enrolment")}
                onViewProgress={() => navigate("/student/enrolment/status")}
              />
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
                      onClick={() => {
                        if (action.to) {
                          navigate(action.to);
                        }
                      }}
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

function EnrolmentProgressCard({
  enrolment,
  fallbackStatus,
  fallbackSubmitted,
  fallbackExpectedUpdate,
  onStart,
  onViewProgress,
}: {
  enrolment: SubmittedEnrolment | null;
  fallbackStatus: string;
  fallbackSubmitted: string;
  fallbackExpectedUpdate: string;
  onStart: () => void;
  onViewProgress: () => void;
}) {
  if (!enrolment) {
    return (
      <article className="rounded-[1.75rem] border border-white/[0.12] bg-white/[0.055] p-8 shadow-[0_24px_90px_rgba(0,0,0,0.26)] backdrop-blur-xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.32em] text-white/70">Student Status</p>
            <h2 className="mt-4 max-w-xl text-4xl font-black leading-tight text-[#f4e7fb]">
              No active enrolment yet
            </h2>
            <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-white/[0.62]">
              Start an enrolment to choose your dance style, class time, and teacher. Your progress will appear here.
            </p>
          </div>

          <span className="inline-flex w-fit items-center gap-3 rounded-full border border-white/10 bg-white/[0.08] px-5 py-3 text-sm font-black leading-4 text-white/[0.78]">
            <span className="h-2.5 w-2.5 rounded-full bg-cyanGlow" />
            {fallbackStatus}
          </span>
        </div>

        <div className="mt-9 grid gap-4 md:grid-cols-3">
          <DashboardStat label="Registered" value={fallbackSubmitted} />
          <DashboardStat label="Expected Update" value={fallbackExpectedUpdate} />
          <DashboardStat label="Enrolment" value="Not Started" />
        </div>

        <button
          type="button"
          onClick={onStart}
          className="mt-8 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#e8a3ff] via-[#c026ff] to-[#e026b4] text-lg font-black text-white shadow-[0_18px_45px_rgba(217,28,255,0.34)] transition hover:-translate-y-0.5"
        >
          <BadgePlus size={21} />
          Start Enrolment
        </button>
      </article>
    );
  }

  const selectedStyle = getDanceStyle(enrolment.data);
  const selectedSlot = getClassSlot(enrolment.data);
  const selectedTeacher = getTeacher(enrolment.data);
  const isApproved = enrolment.status === "Approved";
  const isRejected = enrolment.status === "Rejected";
  const progressValue = getProgressValue(enrolment.status);

  return (
    <article className="rounded-[1.75rem] border border-white/[0.12] bg-white/[0.055] p-8 shadow-[0_24px_90px_rgba(0,0,0,0.26)] backdrop-blur-xl">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.32em] text-cyanGlow">
            {isApproved ? "Enrolled Class" : "Enrolment Progress"}
          </p>
          <h2 className="mt-4 max-w-xl text-4xl font-black leading-tight text-[#f4e7fb]">
            {selectedStyle?.name ?? "Selected Dance Class"}
          </h2>
          <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-white/[0.62]">
            {isApproved
              ? "Your class is confirmed. Keep an eye on the schedule and prepare for your next session."
              : isRejected
                ? "Your application needs attention. Review the progress page and resubmit with updated details."
                : "Your application is being reviewed. We will update your class confirmation progress here."}
          </p>
        </div>

        <StatusPill status={enrolment.status} />
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-[#0b0310]/70 p-5">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-black text-white/64">Application Progress</p>
          <p className="text-sm font-black text-[#f0b7ff]">{progressValue}%</p>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
          <div
            className={cn(
              "h-full rounded-full",
              isRejected
                ? "bg-gradient-to-r from-[#ff7aa8] to-[#e234a8]"
                : "bg-gradient-to-r from-cyanGlow via-[#c026ff] to-[#e026b4]",
            )}
            style={{ width: `${progressValue}%` }}
          />
        </div>
        <MiniJourney status={enrolment.status} />
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-3">
        <DashboardStat label="Teacher" value={selectedTeacher?.name ?? "Pending"} />
        <DashboardStat
          label="Class Time"
          value={selectedSlot ? `${selectedSlot.day} ${selectedSlot.time}` : "Pending"}
        />
        <DashboardStat label="Submitted" value={formatSubmittedDate(enrolment.submittedAt)} />
      </div>

      <button
        type="button"
        onClick={onViewProgress}
        className="mt-8 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] text-lg font-black text-white/80 transition hover:border-orchid/50 hover:text-white"
      >
        <FileText size={20} />
        View Full Progress
        <ArrowRight size={20} />
      </button>
    </article>
  );
}

function DashboardStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/[0.07] p-5">
      <p className="text-sm font-bold text-white/52">{label}</p>
      <p className="mt-2 text-2xl font-black leading-tight text-[#f4e7fb]">{value}</p>
    </div>
  );
}

function StatusPill({ status }: { status: SubmittedEnrolment["status"] }) {
  const isApproved = status === "Approved";
  const isRejected = status === "Rejected";

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-3 rounded-full border px-5 py-3 text-sm font-black leading-4",
        isApproved
          ? "border-cyanGlow/45 bg-cyanGlow/14 text-cyanGlow"
          : isRejected
            ? "border-[#ff7aa8]/45 bg-[#ff7aa8]/12 text-[#ffb0c8]"
            : "border-[#f0b7ff]/35 bg-[#f0b7ff]/12 text-[#f0b7ff]",
      )}
    >
      {isRejected ? <XCircle size={17} /> : <BadgeCheck size={17} />}
      {status}
    </span>
  );
}

function MiniJourney({ status }: { status: SubmittedEnrolment["status"] }) {
  const steps = [
    { label: "Submitted", icon: CheckCircle2 },
    { label: "Reviewing", icon: Hourglass },
    { label: "Confirming", icon: UserRound },
    { label: "Decision", icon: Flag },
  ];
  const activeIndex = status === "Pending Review" ? 1 : 3;

  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-4">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const complete = status === "Approved" || index < activeIndex;
        const active = status === "Pending Review" && index === activeIndex;
        const rejected = status === "Rejected" && index === 3;

        return (
          <div key={step.label} className="flex items-center gap-2 rounded-xl bg-white/[0.055] px-3 py-2">
            <span
              className={cn(
                "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                complete || active
                  ? "bg-[#f0b7ff] text-[#17061d]"
                  : rejected
                    ? "bg-[#ff7aa8]/18 text-[#ffb0c8]"
                    : "bg-white/10 text-white/42",
              )}
            >
              <Icon size={16} />
            </span>
            <span className="text-xs font-black text-white/68">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function getProgressValue(status: SubmittedEnrolment["status"]) {
  if (status === "Approved" || status === "Rejected") {
    return 100;
  }

  return 50;
}
