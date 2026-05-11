import {
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Clock3,
  CreditCard,
  FileText,
  Grid2X2,
  ListFilter,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  Search,
  Settings,
  Sparkles,
  Star,
  Theater,
  UserRound,
  UsersRound,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { danceImages } from "../assets/danceImages";
import { PageHeader } from "../components/PageHeader";
import type { TeacherAuthentication } from "../types/auth";
import { showErrorAlert, showSuccessAlert } from "../utils/alerts";
import { cn } from "../utils/cn";

const sessionStorageKey = "sankalanaTeacherSession";
const attendanceStorageKey = "sankalanaTeacherAttendanceRecords";

type AttendanceStatus = "present" | "absent" | "late";

type StudentAttendanceEntry = {
  status: AttendanceStatus | "";
  remarks: string;
};

type AttendanceRecord = {
  id: string;
  classId: string;
  className: string;
  date: string;
  studentId: string;
  studentName: string;
  status: AttendanceStatus;
  remarks: string;
};

const attendanceClasses = [
  { id: "advanced-contemporary-jazz", name: "Advanced Contemporary Jazz", level: "Advanced", enrolled: 8 },
  { id: "kandyan-foundations", name: "Kandyan Foundations", level: "Beginner", enrolled: 8 },
  { id: "hip-hop-advanced", name: "Hip Hop Advanced", level: "Advanced", enrolled: 8 },
  { id: "classical-ballet", name: "Classical Ballet", level: "Intermediate", enrolled: 8 },
];

const attendanceStudents = [
  { id: "ST-8821", name: "Amara Perera", avatar: danceImages.story[0] },
  { id: "ST-8822", name: "Ethan Thorne", avatar: danceImages.story[1] },
  { id: "ST-8823", name: "Mila Chen", avatar: danceImages.story[2] },
  { id: "ST-8824", name: "Nethmi Fernando", avatar: danceImages.heroCarousel[0] },
  { id: "ST-8825", name: "Kavindu Silva", avatar: danceImages.heroCarousel[1] },
  { id: "ST-8826", name: "Sarah Jenkins", avatar: danceImages.heroCarousel[2] },
  { id: "ST-8827", name: "Liam Chen", avatar: danceImages.heroCarousel[3] },
  { id: "ST-8828", name: "Ananya Sharma", avatar: danceImages.story[0] },
];

const seededAttendanceRecords: AttendanceRecord[] = [
  {
    id: "seed-1",
    classId: "advanced-contemporary-jazz",
    className: "Advanced Contemporary Jazz",
    date: "2026-05-11",
    studentId: "ST-8822",
    studentName: "Ethan Thorne",
    status: "present",
    remarks: "Arrived 5 mins early.",
  },
  {
    id: "seed-2",
    classId: "classical-ballet",
    className: "Classical Ballet",
    date: "2026-05-10",
    studentId: "ST-8823",
    studentName: "Mila Chen",
    status: "late",
    remarks: "Traffic delay reported.",
  },
  {
    id: "seed-3",
    classId: "hip-hop-advanced",
    className: "Hip Hop Advanced",
    date: "2026-05-10",
    studentId: "ST-8826",
    studentName: "Sarah Jenkins",
    status: "absent",
    remarks: "No prior notice.",
  },
  {
    id: "seed-4",
    classId: "advanced-contemporary-jazz",
    className: "Advanced Contemporary Jazz",
    date: "2026-05-09",
    studentId: "ST-8827",
    studentName: "Liam Chen",
    status: "present",
    remarks: "",
  },
  {
    id: "seed-5",
    classId: "kandyan-foundations",
    className: "Kandyan Foundations",
    date: "2026-05-09",
    studentId: "ST-8828",
    studentName: "Ananya Sharma",
    status: "late",
    remarks: "Medical appointment.",
  },
];

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

function getTodayInputValue() {
  const date = new Date();
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);

  return localDate.toISOString().slice(0, 10);
}

function formatAttendanceDate(value: string) {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function createInitialAttendance(): Record<string, StudentAttendanceEntry> {
  return attendanceStudents.reduce<Record<string, StudentAttendanceEntry>>((entries, student, index) => {
    entries[student.id] = {
      status: index === 1 || index === 4 ? "present" : index === 2 ? "late" : "",
      remarks: index === 1 ? "Arrived 5 mins early for warm up" : index === 2 ? "Traffic delay reported" : "",
    };

    return entries;
  }, {});
}

function readAttendanceRecords(): AttendanceRecord[] {
  const storedRecords = localStorage.getItem(attendanceStorageKey);

  if (!storedRecords) {
    return seededAttendanceRecords;
  }

  try {
    const parsedRecords = JSON.parse(storedRecords) as AttendanceRecord[];

    return Array.isArray(parsedRecords) ? parsedRecords : seededAttendanceRecords;
  } catch {
    localStorage.removeItem(attendanceStorageKey);
    return seededAttendanceRecords;
  }
}

function persistAttendanceRecords(records: AttendanceRecord[]) {
  localStorage.setItem(attendanceStorageKey, JSON.stringify(records));
}

function getStatusLabel(status: AttendanceStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
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
    { label: "Attendance", icon: ClipboardCheck },
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
          ) : activeSection === "Attendance" ? (
            <TeacherAttendanceSection />
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
                  onClick={() => setActiveSection("Attendance")}
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

function TeacherAttendanceSection() {
  const [selectedClassId, setSelectedClassId] = useState(attendanceClasses[0].id);
  const [selectedDate, setSelectedDate] = useState(getTodayInputValue());
  const [searchQuery, setSearchQuery] = useState("");
  const [attendanceEntries, setAttendanceEntries] = useState<Record<string, StudentAttendanceEntry>>(
    () => createInitialAttendance(),
  );
  const [records, setRecords] = useState<AttendanceRecord[]>(() => readAttendanceRecords());
  const [recordClassFilter, setRecordClassFilter] = useState("all");
  const [recordDateFilter, setRecordDateFilter] = useState("");
  const [recordStatusFilter, setRecordStatusFilter] = useState("all");
  const [recordsPage, setRecordsPage] = useState(1);

  const selectedClass = attendanceClasses.find((classItem) => classItem.id === selectedClassId) ?? attendanceClasses[0];
  const markedCount = attendanceStudents.filter((student) => attendanceEntries[student.id]?.status).length;
  const progressPercent = Math.round((markedCount / attendanceStudents.length) * 100);
  const visibleStudents = attendanceStudents.filter((student) => {
    const searchValue = `${student.name} ${student.id}`.toLowerCase();

    return searchValue.includes(searchQuery.toLowerCase().trim());
  });
  const filteredRecords = records.filter((record) => {
    const classMatches = recordClassFilter === "all" || record.classId === recordClassFilter;
    const dateMatches = !recordDateFilter || record.date === recordDateFilter;
    const statusMatches = recordStatusFilter === "all" || record.status === recordStatusFilter;

    return classMatches && dateMatches && statusMatches;
  });
  const recordsPerPage = 5;
  const totalRecordPages = Math.max(1, Math.ceil(filteredRecords.length / recordsPerPage));
  const currentRecordPage = Math.min(recordsPage, totalRecordPages);
  const paginatedRecords = filteredRecords.slice(
    (currentRecordPage - 1) * recordsPerPage,
    currentRecordPage * recordsPerPage,
  );

  function updateAttendanceStatus(studentId: string, status: AttendanceStatus) {
    setAttendanceEntries((current) => ({
      ...current,
      [studentId]: {
        status,
        remarks: current[studentId]?.remarks ?? "",
      },
    }));
  }

  function updateAttendanceRemarks(studentId: string, remarks: string) {
    setAttendanceEntries((current) => ({
      ...current,
      [studentId]: {
        status: current[studentId]?.status ?? "",
        remarks,
      },
    }));
  }

  function handleMarkAllPresent() {
    setAttendanceEntries((current) =>
      attendanceStudents.reduce<Record<string, StudentAttendanceEntry>>((entries, student) => {
        entries[student.id] = {
          status: "present",
          remarks: current[student.id]?.remarks ?? "",
        };

        return entries;
      }, {}),
    );
  }

  async function handleSaveAttendance() {
    const unmarkedStudents = attendanceStudents.filter((student) => !attendanceEntries[student.id]?.status);

    if (unmarkedStudents.length > 0) {
      await showErrorAlert(
        "Attendance Incomplete",
        `Please mark attendance for ${unmarkedStudents.length} student${unmarkedStudents.length === 1 ? "" : "s"} before saving.`,
      );
      return;
    }

    const sessionRecords = attendanceStudents.map((student) => {
      const entry = attendanceEntries[student.id];

      return {
        id: `${selectedClass.id}-${selectedDate}-${student.id}`,
        classId: selectedClass.id,
        className: selectedClass.name,
        date: selectedDate,
        studentId: student.id,
        studentName: student.name,
        status: entry.status as AttendanceStatus,
        remarks: entry.remarks.trim(),
      };
    });
    const recordsWithoutCurrentSession = records.filter(
      (record) => !(record.classId === selectedClass.id && record.date === selectedDate),
    );
    const nextRecords = [...sessionRecords, ...recordsWithoutCurrentSession];

    setRecords(nextRecords);
    persistAttendanceRecords(nextRecords);
    setRecordClassFilter(selectedClass.id);
    setRecordDateFilter(selectedDate);
    setRecordsPage(1);
    await showSuccessAlert("Attendance Saved", `${selectedClass.name} attendance has been saved for ${formatAttendanceDate(selectedDate)}.`);
  }

  return (
    <section className="relative z-10 mx-auto max-w-7xl pb-10">
      <div className="flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h1 className="text-5xl font-black leading-none text-[#f0b7ff] sm:text-6xl">Attendance</h1>
          <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-white/70">
            Mark student participation for the current class session and review previous attendance logs.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-white/74">Select Class</span>
            <select
              value={selectedClassId}
              onChange={(event) => setSelectedClassId(event.target.value)}
              className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-[#2a1230] px-4 text-sm font-black text-white outline-none transition focus:border-[#f0b7ff]"
            >
              {attendanceClasses.map((classItem) => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-white/74">Date</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-[#2a1230] px-4 text-sm font-black text-white outline-none transition focus:border-[#f0b7ff]"
            />
          </label>
        </div>
      </div>

      <article className="mt-8 rounded-[1.35rem] border border-white/10 bg-white/[0.055] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.26)] backdrop-blur-xl">
        <div className="flex items-center justify-between gap-5">
          <div>
            <h2 className="flex items-center gap-3 text-base font-black text-white/78">
              <ClipboardCheck className="text-cyanGlow" size={21} />
              Completion Progress
            </h2>
            <p className="mt-2 text-sm font-semibold text-white/48">
              {selectedClass.level} class - {formatAttendanceDate(selectedDate)}
            </p>
          </div>
          <p className="text-sm font-black text-[#f0b7ff]">
            {markedCount} / {attendanceStudents.length} Students
          </p>
        </div>
        <div className="mt-5 h-4 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#bb26ff] via-[#6577ff] to-cyanGlow shadow-[0_0_30px_rgba(34,211,238,0.35)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </article>

      <div className="mt-7 grid gap-4 lg:grid-cols-[1fr_auto_auto]">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-white/34" size={21} />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search students by name or ID..."
            className="h-14 w-full rounded-xl border border-white/10 bg-white/[0.055] pl-14 pr-4 text-sm font-semibold text-white outline-none transition placeholder:text-white/34 focus:border-[#f0b7ff]"
          />
        </label>

        <button
          type="button"
          onClick={handleMarkAllPresent}
          className="inline-flex min-h-14 items-center justify-center gap-3 rounded-xl border border-[#f0b7ff]/60 px-7 text-sm font-black text-[#f0b7ff] transition hover:bg-[#f0b7ff]/10"
        >
          <CheckCircle2 size={20} />
          Mark All Present
        </button>

        <button
          type="button"
          onClick={handleSaveAttendance}
          className="inline-flex min-h-14 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#bb26ff] to-[#e026b4] px-7 text-sm font-black text-white shadow-[0_18px_45px_rgba(217,28,255,0.32)] transition hover:-translate-y-0.5"
        >
          <Save size={19} />
          Save Attendance
        </button>
      </div>

      <div className="mt-7 grid gap-4">
        {visibleStudents.map((student) => {
          const entry = attendanceEntries[student.id] ?? { status: "", remarks: "" };
          const avatarSrc = typeof student.avatar === "string" ? student.avatar : student.avatar.src;

          return (
            <article
              key={student.id}
              className={cn(
                "grid gap-5 rounded-[1.35rem] border border-white/10 bg-white/[0.055] p-5 shadow-[0_18px_70px_rgba(0,0,0,0.18)] backdrop-blur-xl lg:grid-cols-[12rem_10rem_1fr]",
                entry.status === "present" && "border-emerald-300/50 bg-emerald-300/[0.055]",
                entry.status === "absent" && "border-[#ff7aa8]/45 bg-[#ff7aa8]/[0.055]",
                entry.status === "late" && "border-amber-300/45 bg-amber-300/[0.055]",
              )}
            >
              <div className="flex items-center gap-4">
                <img
                  src={avatarSrc}
                  alt=""
                  className="h-14 w-14 rounded-full border border-[#f0b7ff]/40 object-cover shadow-[0_0_22px_rgba(240,183,255,0.18)]"
                />
                <div>
                  <h3 className="text-base font-black text-[#f4e7fb]">{student.name}</h3>
                  <p className="text-sm font-black text-white/58">ID: {student.id}</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <AttendanceStatusButton
                  status="present"
                  active={entry.status === "present"}
                  onClick={() => updateAttendanceStatus(student.id, "present")}
                />
                <AttendanceStatusButton
                  status="absent"
                  active={entry.status === "absent"}
                  onClick={() => updateAttendanceStatus(student.id, "absent")}
                />
                <AttendanceStatusButton
                  status="late"
                  active={entry.status === "late"}
                  onClick={() => updateAttendanceStatus(student.id, "late")}
                />
              </div>

              <input
                value={entry.remarks}
                onChange={(event) => updateAttendanceRemarks(student.id, event.target.value)}
                placeholder="Add remarks (optional)..."
                className="h-12 self-center rounded-none border border-white/10 bg-black/10 px-4 text-sm font-semibold italic text-white outline-none transition placeholder:text-white/34 focus:border-[#f0b7ff]"
              />
            </article>
          );
        })}
      </div>

      <AttendanceRecordsPanel
        records={paginatedRecords}
        currentPage={currentRecordPage}
        totalPages={totalRecordPages}
        classFilter={recordClassFilter}
        dateFilter={recordDateFilter}
        statusFilter={recordStatusFilter}
        onClassFilterChange={setRecordClassFilter}
        onDateFilterChange={setRecordDateFilter}
        onStatusFilterChange={setRecordStatusFilter}
        onApplyFilters={() => setRecordsPage(1)}
        onPreviousPage={() => setRecordsPage((page) => Math.max(1, page - 1))}
        onNextPage={() => setRecordsPage((page) => Math.min(totalRecordPages, page + 1))}
      />
    </section>
  );
}

function AttendanceStatusButton({
  status,
  active,
  onClick,
}: {
  status: AttendanceStatus;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = status === "present" ? CheckCircle2 : status === "absent" ? XCircle : Clock3;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-4 text-xs font-black uppercase transition",
        active
          ? status === "present"
            ? "border-emerald-300/45 bg-emerald-300/16 text-emerald-300 shadow-[0_0_24px_rgba(110,231,183,0.16)]"
            : status === "absent"
              ? "border-[#ff7aa8]/45 bg-[#ff7aa8]/16 text-[#ffb0c8] shadow-[0_0_24px_rgba(255,122,168,0.14)]"
              : "border-amber-300/50 bg-amber-300/16 text-amber-300 shadow-[0_0_24px_rgba(252,211,77,0.16)]"
          : "border-white/10 bg-white/10 text-white/64 hover:border-white/25 hover:text-white",
      )}
    >
      <Icon size={15} />
      {getStatusLabel(status)}
    </button>
  );
}

function AttendanceRecordsPanel({
  records,
  currentPage,
  totalPages,
  classFilter,
  dateFilter,
  statusFilter,
  onClassFilterChange,
  onDateFilterChange,
  onStatusFilterChange,
  onApplyFilters,
  onPreviousPage,
  onNextPage,
}: {
  records: AttendanceRecord[];
  currentPage: number;
  totalPages: number;
  classFilter: string;
  dateFilter: string;
  statusFilter: string;
  onClassFilterChange: (value: string) => void;
  onDateFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onApplyFilters: () => void;
  onPreviousPage: () => void;
  onNextPage: () => void;
}) {
  return (
    <section className="mt-14">
      <div>
        <h2 className="text-5xl font-black leading-none text-[#f0b7ff]">Attendance Records</h2>
        <p className="mt-4 max-w-3xl text-base font-semibold leading-7 text-white/70">
          Review and manage historical student attendance logs across dance styles.
        </p>
      </div>

      <article className="mt-8 rounded-[1.35rem] border border-white/10 bg-white/[0.045] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.22)] backdrop-blur-xl">
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr_1fr_auto]">
          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-white/58">Class Style</span>
            <select
              value={classFilter}
              onChange={(event) => onClassFilterChange(event.target.value)}
              className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-[#211028] px-4 text-sm font-black text-white outline-none transition focus:border-[#f0b7ff]"
            >
              <option value="all">All Classes</option>
              {attendanceClasses.map((classItem) => (
                <option key={classItem.id} value={classItem.id}>
                  {classItem.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-white/58">Date</span>
            <input
              type="date"
              value={dateFilter}
              onChange={(event) => onDateFilterChange(event.target.value)}
              className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-[#211028] px-4 text-sm font-black text-white outline-none transition focus:border-[#f0b7ff]"
            />
          </label>

          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-white/58">Attendance Status</span>
            <select
              value={statusFilter}
              onChange={(event) => onStatusFilterChange(event.target.value)}
              className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-[#211028] px-4 text-sm font-black text-white outline-none transition focus:border-[#f0b7ff]"
            >
              <option value="all">All Statuses</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
            </select>
          </label>

          <button
            type="button"
            onClick={onApplyFilters}
            className="mt-6 inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#bb26ff] to-[#e026b4] px-7 text-sm font-black text-white shadow-[0_18px_45px_rgba(217,28,255,0.28)] lg:mt-auto"
          >
            <ListFilter size={18} />
            Apply Filters
          </button>
        </div>
      </article>

      <div className="mt-8 overflow-x-auto">
        <div className="min-w-[58rem]">
          <div className="grid grid-cols-[10rem_14rem_10rem_13rem_8rem_1fr] gap-4 px-6 py-4 text-xs font-black uppercase tracking-[0.18em] text-white/70">
            <span>Date</span>
            <span>Class Name</span>
            <span>Student ID</span>
            <span>Student Name</span>
            <span>Status</span>
            <span>Remarks</span>
          </div>

          <div className="grid gap-3">
            {records.map((record) => (
              <article
                key={record.id}
                className="grid min-h-16 grid-cols-[10rem_14rem_10rem_13rem_8rem_1fr] items-center gap-4 rounded-xl border border-white/10 bg-white/[0.045] px-6 text-sm font-black text-white/78 shadow-[0_16px_55px_rgba(0,0,0,0.16)]"
              >
                <span className="text-[#f0b7ff]">{formatAttendanceDate(record.date)}</span>
                <span className="flex items-center gap-3">
                  <span className="h-8 w-1 rounded-full bg-cyanGlow" />
                  {record.className}
                </span>
                <span className="text-white/58">{record.studentId}</span>
                <span>{record.studentName}</span>
                <AttendanceStatusBadge status={record.status} />
                <span className="truncate italic text-white/58">{record.remarks || "-"}</span>
              </article>
            ))}
          </div>

          {records.length === 0 && (
            <div className="rounded-xl border border-white/10 bg-white/[0.045] px-6 py-10 text-center text-sm font-black text-white/56">
              No attendance records match the selected filters.
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={onPreviousPage}
          disabled={currentPage <= 1}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-white/70 transition hover:border-[#f0b7ff]/40 hover:text-[#f0b7ff] disabled:cursor-not-allowed disabled:opacity-35"
          aria-label="Previous records page"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-sm font-black text-white/84">
          Page {currentPage} of {totalPages}
        </span>
        <button
          type="button"
          onClick={onNextPage}
          disabled={currentPage >= totalPages}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-white/70 transition hover:border-[#f0b7ff]/40 hover:text-[#f0b7ff] disabled:cursor-not-allowed disabled:opacity-35"
          aria-label="Next records page"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </section>
  );
}

function AttendanceStatusBadge({ status }: { status: AttendanceStatus }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center justify-center rounded-full px-3 py-1 text-[0.65rem] font-black uppercase",
        status === "present" && "bg-cyanGlow/18 text-cyanGlow",
        status === "absent" && "bg-[#ff7aa8]/18 text-[#ff9fbd]",
        status === "late" && "bg-[#e234a8]/18 text-[#ff8ee2]",
      )}
    >
      {getStatusLabel(status)}
    </span>
  );
}
