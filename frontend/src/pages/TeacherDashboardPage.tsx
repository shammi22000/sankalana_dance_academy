import {
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  FileText,
  Grid2X2,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Plus,
  Settings,
  Sparkles,
  Star,
  Theater,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { danceImages } from "../assets/danceImages";
import { PageHeader } from "../components/PageHeader";
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
  const [activeSection, setActiveSection] = useState("Dashboard");
  const authentication = getStoredTeacherSession();

  if (!authentication) {
    return <Navigate to="/teacher-login" replace />;
  }

  function handleLogout() {
    localStorage.removeItem(sessionStorageKey);
    navigate("/teacher-login", { replace: true });
  }

  const teacher = authentication.teacher;
  const firstName = teacher.fullName.split(" ")[0] || teacher.fullName;
  const instructorTitle = teacher.experienceYears >= 5 ? "Senior Instructor" : "Dance Instructor";
  const avatarSrc = teacher.avatarImageDataUrl || danceImages.heroCarousel[0].src;

  const sidebarItems = [
    { label: "Dashboard", icon: Grid2X2 },
    { label: "My Info", icon: UserRound },
    { label: "My Classes", icon: Sparkles },
    { label: "Schedule", icon: CalendarDays },
    { label: "Performances", icon: Theater },
    { label: "Payments", icon: CreditCard },
    { label: "Settings", icon: Settings },
  ];

  const scheduleItems = [
    {
      title: "Advanced Contemporary",
      time: "04:00 PM - 05:30 PM",
      studio: "Studio A",
      students: 24,
      status: "Upcoming",
      accent: "bg-[#f0b7ff]",
    },
    {
      title: teacher.danceStyles || "Classical Foundations",
      time: "06:00 PM - 07:00 PM",
      studio: "Studio C",
      students: 18,
      status: "Scheduled",
      accent: "bg-cyanGlow",
    },
    {
      title: "Morning Stretch & Barre",
      time: "09:00 AM - 10:30 AM",
      studio: "Main Stage",
      students: 32,
      status: "Completed",
      accent: "bg-white/15",
      muted: true,
    },
  ];

  const adminTasks = [
    { label: "Submit Performance Scores", icon: ClipboardList },
    { label: "Review Enrollment Requests", icon: BadgeCheck },
    { label: "Update Weekly Schedule", icon: CalendarDays },
  ];
  const profileStats = [
    { label: "Role", value: teacher.accountRole },
    { label: "Status", value: teacher.applicationStatus },
    { label: "Experience", value: `${teacher.experienceYears} years` },
    { label: "Available", value: teacher.availableDays.join(", ") || "Not set" },
  ];
  const contactDetails = [
    { label: "Full Name", value: teacher.fullName, icon: UserRound },
    { label: "Username", value: teacher.username, icon: BadgeCheck },
    { label: "Email", value: teacher.email, icon: Mail },
    { label: "Phone", value: teacher.phone, icon: Phone },
  ];
  const professionalDetails = [
    { label: "Dance Styles", value: teacher.danceStyles },
    { label: "Qualifications", value: teacher.qualifications },
    { label: "Avatar File", value: teacher.avatarFileName || "Not uploaded" },
    { label: "Portfolio File", value: teacher.portfolioFileName || "Not uploaded" },
    { label: "Member Since", value: new Date(teacher.createdAt).toLocaleDateString() },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <PageHeader ctaLabel="Logout" onCtaClick={handleLogout} />

      <div className="grid min-h-[calc(100svh-5rem)] lg:grid-cols-[19rem_1fr]">
        <aside className="relative z-20 border-b border-white/10 bg-[#120415]/96 px-4 py-5 shadow-[18px_0_70px_rgba(134,20,190,0.12)] lg:border-b-0 lg:border-r">
          <nav className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1" aria-label="Teacher dashboard">
            {sidebarItems.map((item) => {
              const Icon = item.icon;

              return (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => setActiveSection(item.label)}
                  className={`flex min-h-14 items-center gap-4 rounded-2xl px-5 text-left text-sm font-black transition ${
                    activeSection === item.label
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
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_18%,rgba(188,38,255,0.22),transparent_28rem),radial-gradient(circle_at_86%_76%,rgba(41,216,255,0.13),transparent_24rem)]" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#1b071f]/78 via-black to-[#020404]" />

          {activeSection === "My Info" ? (
            <section className="relative z-10 mx-auto max-w-7xl">
              <div className="flex flex-col gap-7 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <p className="text-sm font-black uppercase tracking-[0.3em] text-cyanGlow">Teacher Profile</p>
                  <h1 className="mt-4 text-5xl font-black leading-none text-[#f4e7fb] sm:text-6xl">
                    My Info
                  </h1>
                  <p className="mt-5 max-w-3xl text-xl font-semibold leading-9 text-white/[0.62]">
                    Your account, teaching profile, contact details, and availability in one place.
                  </p>
                </div>

                <span className="inline-flex w-fit items-center gap-3 rounded-full border border-cyanGlow/35 bg-cyanGlow/5 px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-cyanGlow">
                  <span className="h-2.5 w-2.5 rounded-full bg-cyanGlow" />
                  {teacher.applicationStatus}
                </span>
              </div>

              <div className="mt-12 grid gap-7 xl:grid-cols-[24rem_1fr]">
                <article className="rounded-[1.75rem] border border-white/[0.12] bg-white/[0.055] p-8 text-center shadow-[0_24px_90px_rgba(0,0,0,0.26)] backdrop-blur-xl">
                  <div className="relative mx-auto h-32 w-32 rounded-full border-4 border-[#f0b7ff] p-1 shadow-[0_0_40px_rgba(240,183,255,0.34)]">
                    <img
                      src={avatarSrc}
                      alt=""
                      className="h-full w-full rounded-full object-cover"
                    />
                    <span className="absolute bottom-1 right-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-cyanGlow text-ink">
                      <Star size={17} fill="currentColor" />
                    </span>
                  </div>

                  <h2 className="mt-7 text-3xl font-black text-[#f4e7fb]">{teacher.fullName}</h2>
                  <p className="mt-2 text-base font-black text-[#f0b7ff]">{instructorTitle}</p>
                  <p className="mt-4 break-words text-sm font-semibold leading-6 text-white/[0.58]">
                    {teacher.email}
                  </p>

                  <div className="mt-8 grid grid-cols-2 gap-3">
                    {profileStats.map((stat) => (
                      <div key={stat.label} className="rounded-2xl bg-white/[0.07] p-4 text-left">
                        <p className="text-xs font-black uppercase tracking-[0.12em] text-white/45">{stat.label}</p>
                        <p className="mt-2 break-words text-base font-black capitalize text-[#f4e7fb]">{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </article>

                <div className="grid gap-7">
                  <article className="rounded-[1.75rem] border border-white/[0.12] bg-white/[0.055] p-8 shadow-[0_24px_90px_rgba(0,0,0,0.26)] backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-orchid/25 text-[#f0b7ff]">
                        <UserRound size={25} />
                      </span>
                      <h2 className="text-3xl font-black text-[#f4e7fb]">Personal Details</h2>
                    </div>

                    <div className="mt-7 grid gap-4 md:grid-cols-2">
                      {contactDetails.map((detail) => {
                        const Icon = detail.icon;

                        return (
                          <div key={detail.label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
                            <div className="flex items-center gap-3 text-white/[0.58]">
                              <Icon size={19} />
                              <p className="text-xs font-black uppercase tracking-[0.14em]">{detail.label}</p>
                            </div>
                            <p className="mt-3 break-words text-xl font-black text-[#f4e7fb]">{detail.value}</p>
                          </div>
                        );
                      })}
                    </div>
                  </article>

                  <article className="rounded-[1.75rem] border border-white/[0.12] bg-white/[0.055] p-8 shadow-[0_24px_90px_rgba(0,0,0,0.26)] backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyanGlow/20 text-cyanGlow">
                        <FileText size={25} />
                      </span>
                      <h2 className="text-3xl font-black text-[#f4e7fb]">Teaching Information</h2>
                    </div>

                    <div className="mt-7 grid gap-4 md:grid-cols-2">
                      {professionalDetails.map((detail) => (
                        <div key={detail.label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
                          <p className="text-xs font-black uppercase tracking-[0.14em] text-white/[0.58]">
                            {detail.label}
                          </p>
                          <p className="mt-3 break-words text-xl font-black text-[#f4e7fb]">{detail.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.06] p-6">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-white/[0.58]">Biography</p>
                      <p className="mt-3 text-base font-semibold leading-8 text-white/[0.72]">{teacher.biography}</p>
                    </div>
                  </article>

                  <article className="rounded-[1.75rem] border border-white/[0.12] bg-white/[0.055] p-8 shadow-[0_24px_90px_rgba(0,0,0,0.26)] backdrop-blur-xl">
                    <h2 className="text-3xl font-black text-[#f4e7fb]">Available Teaching Days</h2>
                    <div className="mt-6 flex flex-wrap gap-3">
                      {teacher.availableDays.map((day) => (
                        <span
                          key={day}
                          className="inline-flex min-h-11 items-center rounded-full border border-cyanGlow/35 bg-cyanGlow/10 px-5 text-sm font-black text-cyanGlow"
                        >
                          {day}
                        </span>
                      ))}
                    </div>
                  </article>
                </div>
              </div>
            </section>
          ) : (
            <section className="relative z-10 mx-auto max-w-7xl">
            <div className="flex flex-col gap-7 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <h1 className="text-5xl font-black leading-none text-[#f4e7fb] sm:text-6xl">
                  Welcome back, {firstName}.
                </h1>
                <p className="mt-5 max-w-3xl text-xl font-semibold leading-9 text-white/[0.62]">
                  Ready for today's rhythmic energy? You have 4 classes scheduled.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  className="inline-flex min-h-16 items-center justify-center gap-4 rounded-full border border-cyanGlow/45 bg-cyanGlow/5 px-8 text-base font-black text-cyanGlow shadow-[0_18px_55px_rgba(41,216,255,0.12)] transition hover:bg-cyanGlow/10"
                >
                  <CheckCircle2 size={25} />
                  Mark Attendance
                </button>
                <button
                  type="button"
                  className="inline-flex min-h-16 items-center justify-center gap-4 rounded-full bg-gradient-to-r from-[#bb26ff] to-[#e026b4] px-8 text-base font-black text-white shadow-[0_18px_55px_rgba(217,28,255,0.34)] transition hover:-translate-y-0.5"
                >
                  <Plus size={27} />
                  View Classes
                </button>
              </div>
            </div>

            <div className="mt-12 grid gap-7 xl:grid-cols-3">
              <article className="rounded-[1.75rem] border border-white/[0.12] bg-white/[0.055] p-8 shadow-[0_24px_90px_rgba(0,0,0,0.26)] backdrop-blur-xl">
                <CalendarDays className="text-[#f0b7ff]" size={39} />
                <p className="mt-8 text-xs font-black uppercase tracking-[0.24em] text-white/60">
                  Today's Classes
                </p>
                <p className="mt-2 text-6xl font-black text-[#f4e7fb]">04</p>
                <p className="mt-4 text-base font-black text-[#f0b7ff]">Next class in 45 mins</p>
              </article>

              <article className="rounded-[1.75rem] border border-white/[0.12] bg-white/[0.055] p-8 shadow-[0_24px_90px_rgba(0,0,0,0.26)] backdrop-blur-xl">
                <UsersRound className="text-cyanGlow" size={39} />
                <p className="mt-8 text-xs font-black uppercase tracking-[0.24em] text-white/60">
                  Total Students
                </p>
                <p className="mt-2 text-6xl font-black text-[#f4e7fb]">128</p>
                <p className="mt-4 text-base font-black text-cyanGlow">+12 this month</p>
              </article>

              <article className="rounded-[1.75rem] border border-white/[0.12] bg-white/[0.055] p-8 shadow-[0_24px_90px_rgba(0,0,0,0.26)] backdrop-blur-xl">
                <ClipboardCheck className="text-[#ff9edc]" size={39} />
                <p className="mt-8 text-xs font-black uppercase tracking-[0.24em] text-white/60">
                  Attendance Marked
                </p>
                <p className="mt-2 text-6xl font-black text-[#f4e7fb]">75%</p>
                <p className="mt-4 text-base font-black text-[#ff9edc]">2 classes remaining</p>
              </article>
            </div>

            <div className="mt-12 grid gap-7 xl:grid-cols-[1fr_22rem]">
              <section>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <h2 className="text-4xl font-black text-[#f4e7fb]">Today's Schedule</h2>
                  <button type="button" className="text-sm font-black text-[#f0b7ff] transition hover:text-white">
                    View Full Calendar
                  </button>
                </div>

                <div className="mt-7 grid gap-5">
                  {scheduleItems.map((item) => (
                    <article
                      key={item.title}
                      className={`relative overflow-hidden rounded-2xl border border-white/[0.12] bg-white/[0.055] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.2)] backdrop-blur-xl ${
                        item.muted ? "opacity-55" : ""
                      }`}
                    >
                      <div className={`absolute bottom-6 left-6 top-6 w-1 rounded-full ${item.accent}`} />
                      <div className="ml-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <h3 className="text-2xl font-black text-[#f4e7fb]">{item.title}</h3>
                          <p className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-white/[0.62]">
                            <span>{item.time}</span>
                            <span className="inline-flex items-center gap-2">
                              <MapPin size={15} />
                              {item.studio}
                            </span>
                          </p>
                        </div>
                        <div className="text-left lg:text-right">
                          <p className="text-lg font-black text-[#f4e7fb]">{item.students} Students</p>
                          <span className="mt-2 inline-flex rounded-lg bg-white/10 px-3 py-1 text-xs font-black uppercase text-[#f0b7ff]">
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <aside className="grid gap-7">
                <article className="rounded-[1.75rem] border border-white/[0.12] bg-white/[0.055] p-8 text-center shadow-[0_24px_90px_rgba(0,0,0,0.26)] backdrop-blur-xl">
                  <div className="relative mx-auto h-28 w-28 rounded-full border-4 border-[#f0b7ff] p-1 shadow-[0_0_35px_rgba(240,183,255,0.36)]">
                    <img
                      src={avatarSrc}
                      alt=""
                      className="h-full w-full rounded-full object-cover"
                    />
                    <span className="absolute bottom-1 right-0 inline-flex h-7 w-7 items-center justify-center rounded-full bg-cyanGlow text-ink">
                      <Star size={16} fill="currentColor" />
                    </span>
                  </div>

                  <h2 className="mt-6 text-3xl font-black text-[#f4e7fb]">{teacher.fullName}</h2>
                  <p className="mt-2 text-base font-black text-[#f0b7ff]">{instructorTitle}</p>

                  <div className="mt-7 grid grid-cols-3 gap-3 border-t border-white/10 pt-6">
                    <div>
                      <p className="text-xl font-black text-[#f4e7fb]">{teacher.experienceYears}</p>
                      <p className="mt-1 text-xs font-black uppercase text-white/48">Years</p>
                    </div>
                    <div className="border-x border-white/10">
                      <p className="text-xl font-black text-[#f4e7fb]">4.9</p>
                      <p className="mt-1 text-xs font-black uppercase text-white/48">Rating</p>
                    </div>
                    <div>
                      <p className="text-xl font-black text-[#f4e7fb]">850</p>
                      <p className="mt-1 text-xs font-black uppercase text-white/48">Hours</p>
                    </div>
                  </div>
                </article>

                <article className="rounded-[1.75rem] border border-white/[0.12] bg-white/[0.055] p-7 shadow-[0_24px_90px_rgba(0,0,0,0.26)] backdrop-blur-xl">
                  <h2 className="text-3xl font-black text-[#f4e7fb]">Admin Tasks</h2>

                  <div className="mt-6 grid gap-3">
                    {adminTasks.map((task) => {
                      const Icon = task.icon;

                      return (
                        <button
                          key={task.label}
                          type="button"
                          className="flex min-h-16 items-center justify-between gap-4 rounded-2xl bg-white/[0.06] px-5 text-left transition hover:bg-white/[0.09]"
                        >
                          <span className="inline-flex items-center gap-4 text-sm font-black text-white/80">
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orchid/25 text-[#f0b7ff]">
                              <Icon size={21} />
                            </span>
                            {task.label}
                          </span>
                          <ChevronRight size={18} className="text-white/45" />
                        </button>
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
