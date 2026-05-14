import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  Grid2X2,
  LogOut,
  PlusCircle,
  ReceiptText,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  UserRoundPlus,
  UsersRound,
  WandSparkles,
  X,
} from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { danceImages } from "../assets/danceImages";
import { StudentManagementSection } from "../components/StudentManagementSection";
import { TeacherManagementSection } from "../components/TeacherManagementSection";
import {
  getPendingRegistrations,
  getStudentRegistrations,
  updateStudentApprovalStatus,
  updateTeacherApplicationStatus,
  type PendingRegistrations,
} from "../services/adminRegistrationService";
import type { AdminAuthentication } from "../types/auth";
import type { StudentRegistration } from "../types/studentRegistration";
import type { TeacherRegistration } from "../types/teacherRegistration";
import { showErrorAlert, showSuccessAlert } from "../utils/alerts";

const adminSessionKey = "sankalanaAdminSession";

type PendingRegistrationItem = {
  id: string;
  key: string;
  role: "student" | "teacher";
  initials: string;
  name: string;
  detail: string;
  createdAt: string;
};

function getStoredAdminSession(): AdminAuthentication | null {
  const storedSession = localStorage.getItem(adminSessionKey);

  if (!storedSession) {
    return null;
  }

  try {
    return JSON.parse(storedSession) as AdminAuthentication;
  } catch {
    localStorage.removeItem(adminSessionKey);
    return null;
  }
}

function getInitials(name: string) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return initials || "NA";
}

function toStudentRequest(student: StudentRegistration): PendingRegistrationItem {
  return {
    id: student.id,
    key: `student-${student.id}`,
    role: "student",
    initials: getInitials(student.fullName),
    name: student.fullName,
    detail: `Student • ${student.username} • ${student.phone}`,
    createdAt: student.createdAt,
  };
}

function toTeacherRequest(teacher: TeacherRegistration): PendingRegistrationItem {
  return {
    id: teacher.id,
    key: `teacher-${teacher.id}`,
    role: "teacher",
    initials: getInitials(teacher.fullName),
    name: teacher.fullName,
    detail: `${teacher.danceStyles} • ${teacher.experienceYears} years • ${teacher.username}`,
    createdAt: teacher.createdAt,
  };
}

interface AdminDashboardPageProps {
  onLogout?: () => void;
}

export function AdminDashboardPage({ onLogout }: AdminDashboardPageProps = {}) {
  const navigate = useNavigate();
  const authentication = getStoredAdminSession();
  const hasAuthentication = Boolean(authentication);
  const [activeSection, setActiveSection] = useState("Dashboard");
  const [pendingRegistrations, setPendingRegistrations] = useState<PendingRegistrations>({
    students: [],
    teachers: [],
  });
  const [isLoadingPending, setIsLoadingPending] = useState(true);
  const [totalStudentCount, setTotalStudentCount] = useState(0);
  const [activeRequestKey, setActiveRequestKey] = useState<string | null>(null);
  const pendingRequests = useMemo(
    () =>
      [
        ...pendingRegistrations.students.map(toStudentRequest),
        ...pendingRegistrations.teachers.map(toTeacherRequest),
      ].sort((first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt)),
    [pendingRegistrations],
  );

  useEffect(() => {
    if (!hasAuthentication) {
      setIsLoadingPending(false);
      return;
    }

    let ignore = false;

    setIsLoadingPending(true);
    Promise.all([getPendingRegistrations(), getStudentRegistrations()])
      .then(([registrations, students]) => {
        if (!ignore) {
          setPendingRegistrations(registrations);
          setTotalStudentCount(students.length);
        }
      })
      .catch((error) => {
        if (!ignore) {
          const message = error instanceof Error ? error.message : "Unable to load pending registrations.";

          if (message === "Admin login required.") {
            localStorage.removeItem(adminSessionKey);
            onLogout?.();
            navigate("/admin", { replace: true });
            return;
          }

          void showErrorAlert("Unable to Load Requests", message);
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoadingPending(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [hasAuthentication, navigate, onLogout]);

  if (!authentication) {
    return <Navigate to="/admin" replace />;
  }

  function handleLogout() {
    localStorage.removeItem(adminSessionKey);
    onLogout?.();
    navigate("/admin", { replace: true });
  }

  async function handleUpdateRequest(request: PendingRegistrationItem, status: "approved" | "rejected") {
    setActiveRequestKey(request.key);

    try {
      if (request.role === "student") {
        await updateStudentApprovalStatus(request.id, status);
      } else {
        await updateTeacherApplicationStatus(request.id, status);
      }

      setPendingRegistrations((current) => ({
        students: current.students.filter((student) => student.id !== request.id),
        teachers: current.teachers.filter((teacher) => teacher.id !== request.id),
      }));
      await showSuccessAlert(
        status === "approved" ? "Registration Approved" : "Registration Rejected",
        `${request.name} has been ${status}.`,
      );
    } catch (error) {
      await showErrorAlert(
        "Update Failed",
        error instanceof Error ? error.message : "Unable to update registration.",
      );
    } finally {
      setActiveRequestKey(null);
    }
  }

  const sidebarItems = [
    { label: "Dashboard", icon: Grid2X2 },
    { label: "Students", icon: UsersRound },
    { label: "Teachers", icon: GraduationCap },
    { label: "Classes", icon: CalendarDays },
    { label: "Reports", icon: BarChart3 },
  ];

  const stats = [
    {
      label: "Total Students",
      value: isLoadingPending ? "--" : String(totalStudentCount).padStart(2, "0"),
      meta: "Registered",
      icon: UsersRound,
      accent: "text-cyanGlow",
    },
    {
      label: "Pending Enrolments",
      value: String(pendingRegistrations.students.length).padStart(2, "0"),
      meta: "Review Needed",
      icon: UserRoundPlus,
      accent: "text-[#ff9edc]",
    },
    {
      label: "Teacher Apps",
      value: String(pendingRegistrations.teachers.length).padStart(2, "0"),
      meta: "Review Needed",
      icon: Search,
      accent: "text-[#f4e7fb]",
    },
    { label: "Active Classes", value: "156", meta: "Live Now", icon: Sparkles, accent: "text-cyanGlow" },
  ];

  const shortcuts = [
    { label: "New Class", icon: PlusCircle },
    { label: "Send Broadcast", icon: Send },
    { label: "Invoicing", icon: ReceiptText },
    { label: "Audit Logs", icon: WandSparkles },
  ];

  const feed = [
    { title: "Payroll Processed", detail: "14:20 • All instructors paid", icon: CheckCircle2 },
    { title: "Studio 4 Leak Reported", detail: "13:45 • Maintenance notified", icon: Bell },
    { title: "New Teacher Application", detail: "12:10 • Review queue updated", icon: UserRoundPlus },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="grid min-h-screen lg:grid-cols-[20rem_1fr]">
        <aside className="relative z-20 flex flex-col border-b border-white/10 bg-[#120415]/96 px-5 py-7 shadow-[18px_0_70px_rgba(134,20,190,0.13)] lg:border-b-0 lg:border-r">
          <div>
            <h1 className="text-3xl font-black text-[#f0b7ff]">Sankalana</h1>
            <p className="mt-1 text-sm font-black uppercase tracking-[0.2em] text-white/70">Admin Portal</p>
          </div>

          <nav className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-1" aria-label="Admin dashboard">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.label;

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setActiveSection(item.label)}
                  className={`flex min-h-14 items-center gap-4 rounded-2xl px-5 text-left text-sm font-black transition ${
                    isActive
                      ? "bg-gradient-to-r from-orchid to-[#bb26ff] text-white shadow-[0_18px_45px_rgba(217,28,255,0.34)]"
                      : "text-white/[0.64] hover:bg-white/[0.08] hover:text-white"
                  }`}
                >
                  <Icon size={23} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-10 grid gap-4 lg:mt-auto">
            <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-5">
              <div className="flex items-center gap-4">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-orchid/25 text-[#f0b7ff]">
                  <ShieldCheck size={24} />
                </span>
                <div>
                  <p className="font-black text-white">Admin Central</p>
                  <p className="text-xs font-black uppercase tracking-[0.08em] text-white/50">
                    {authentication.admin.displayName}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#bb26ff] to-[#e026b4] px-5 text-sm font-black text-white transition hover:-translate-y-0.5"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </aside>

        <main className="relative overflow-hidden px-5 py-8 sm:px-8 lg:px-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_16%,rgba(188,38,255,0.21),transparent_28rem),radial-gradient(circle_at_84%_72%,rgba(41,216,255,0.14),transparent_25rem)]" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#1b071f]/78 via-black to-[#00120f]" />

          {activeSection === "Students" ? (
            <StudentManagementSection />
          ) : activeSection === "Teachers" ? (
            <TeacherManagementSection />
          ) : (
          <section className="relative z-10 mx-auto max-w-7xl">
            <div className="flex flex-col gap-7 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <h2 className="text-5xl font-black leading-none text-[#f4e7fb] sm:text-6xl">
                  Welcome back, <span className="text-[#f0b7ff]">Admin</span>.
                </h2>
                <p className="mt-5 text-xl font-semibold text-white/[0.72]">
                  Academy status: <span className="font-black text-cyanGlow">Operational</span>
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.055] text-white/80 transition hover:border-cyanGlow/45 hover:text-cyanGlow"
                  aria-label="Notifications"
                >
                  <Bell size={24} />
                </button>
                <button
                  type="button"
                  className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.055] text-white/80 transition hover:border-cyanGlow/45 hover:text-cyanGlow"
                  aria-label="Search"
                >
                  <Search size={25} />
                </button>
              </div>
            </div>

            <div className="mt-12 grid gap-6 xl:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <article
                    key={stat.label}
                    className="relative overflow-hidden rounded-[1.5rem] border border-white/[0.12] bg-white/[0.055] p-7 shadow-[0_24px_90px_rgba(0,0,0,0.24)] backdrop-blur-xl"
                  >
                    <Icon className="absolute right-6 top-6 text-white/10" size={58} />
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-white/65">{stat.label}</p>
                    <div className="mt-4 flex items-end gap-4">
                      <p className="text-5xl font-black leading-none text-[#f4e7fb]">{stat.value}</p>
                      <p className={`pb-1 text-sm font-black ${stat.accent}`}>{stat.meta}</p>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-10 grid gap-7 xl:grid-cols-[1fr_24rem]">
              <div className="grid gap-7">
                <article className="rounded-[1.75rem] border border-white/[0.12] bg-white/[0.055] p-7 shadow-[0_24px_90px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:p-8">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h3 className="text-3xl font-black text-[#f4e7fb]">Management Shortcuts</h3>
                      <p className="mt-2 text-base font-semibold text-white/60">
                        Quick access to frequent administrative tasks.
                      </p>
                    </div>
                    <button type="button" className="text-sm font-black text-[#f0b7ff] transition hover:text-white">
                      Customize Grid
                    </button>
                  </div>

                  <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {shortcuts.map((shortcut) => {
                      const Icon = shortcut.icon;

                      return (
                        <button
                          key={shortcut.label}
                          type="button"
                          className="grid min-h-36 place-items-center rounded-2xl border border-white/10 bg-white/[0.055] p-5 text-center transition hover:border-orchid/45 hover:bg-white/[0.085]"
                        >
                          <Icon className="text-cyanGlow" size={32} />
                          <span className="mt-4 text-sm font-black text-white/82">{shortcut.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </article>

                <article className="rounded-[1.75rem] border border-white/[0.12] bg-white/[0.055] p-7 shadow-[0_24px_90px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:p-8">
                  <h3 className="text-3xl font-black text-[#f4e7fb]">Recent Enrolment Requests</h3>

                  <div className="mt-7 grid gap-4">
                    {isLoadingPending && (
                      <p className="rounded-2xl bg-white/[0.06] px-5 py-4 text-sm font-bold text-white/68">
                        Loading pending registrations...
                      </p>
                    )}

                    {!isLoadingPending && pendingRequests.length === 0 && (
                      <p className="rounded-2xl bg-white/[0.06] px-5 py-4 text-sm font-bold text-white/68">
                        No pending student or teacher registrations.
                      </p>
                    )}

                    {!isLoadingPending &&
                      pendingRequests.map((request, index) => {
                        const isUpdating = activeRequestKey === request.key;

                        return (
                          <div
                            key={request.key}
                            className={`flex flex-col gap-4 rounded-2xl bg-white/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between ${
                              index === 0 ? "border-l-2 border-[#ff9edc]" : ""
                            }`}
                          >
                            <div className="flex items-center gap-4">
                              <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-orchid/15 text-lg font-black text-[#f0b7ff]">
                                {request.initials}
                              </span>
                              <div>
                                <p className="font-black text-white">{request.name}</p>
                                <p className="mt-1 text-xs font-bold uppercase tracking-[0.08em] text-white/52">
                                  {request.detail}
                                </p>
                                <p className="mt-2 text-xs font-black uppercase tracking-[0.12em] text-cyanGlow">
                                  {request.role} pending approval
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-4">
                              <button
                                type="button"
                                onClick={() => void handleUpdateRequest(request, "approved")}
                                disabled={isUpdating}
                                className="min-h-11 rounded-xl bg-[#6c5274] px-6 text-sm font-black text-[#f6d5ff] transition hover:bg-[#806088] disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                {isUpdating ? "Saving..." : "Approve"}
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleUpdateRequest(request, "rejected")}
                                disabled={isUpdating}
                                className="text-white/64 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                                aria-label={`Reject ${request.name}`}
                              >
                                <X size={24} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  <button
                    type="button"
                    className="mt-6 min-h-14 w-full rounded-2xl border border-dashed border-white/18 text-sm font-black text-white/78 transition hover:border-cyanGlow/40 hover:text-cyanGlow"
                  >
                    View All {pendingRequests.length} Requests
                  </button>
                </article>
              </div>

              <aside className="grid content-start gap-7">
                <article className="relative min-h-80 overflow-hidden rounded-[1.75rem] border border-white/[0.12] bg-white/[0.055] shadow-[0_24px_90px_rgba(0,0,0,0.25)]">
                  <img
                    src={danceImages.heroCarousel[0].src}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover opacity-55 saturate-125"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#140616] via-[#140616]/65 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-7">
                    <h3 className="text-3xl font-black text-white">Studio Health</h3>
                    <p className="mt-2 text-base font-black text-white/78">98% Room Utilization Today</p>
                  </div>
                </article>

                <article className="rounded-[1.75rem] border border-white/[0.12] bg-white/[0.055] p-7 shadow-[0_24px_90px_rgba(0,0,0,0.25)] backdrop-blur-xl">
                  <div className="flex items-center justify-between gap-5">
                    <h3 className="text-3xl font-black text-[#f4e7fb]">Live Feed</h3>
                    <span className="h-2.5 w-2.5 rounded-full bg-cyanGlow" />
                  </div>

                  <div className="mt-7 grid gap-5">
                    {feed.map((item) => {
                      const Icon = item.icon;

                      return (
                        <div key={item.title} className="flex gap-4">
                          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-cyanGlow/45 text-cyanGlow">
                            <Icon size={18} />
                          </span>
                          <div>
                            <p className="font-black text-white">{item.title}</p>
                            <p className="mt-1 text-xs font-semibold text-white/58">{item.detail}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </article>
              </aside>
            </div>
          </section>
          )}
        </main>
      </div>
    </div>
  );
}
