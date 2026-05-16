import { BadgeCheck, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, ClipboardCheck, ClipboardList, Clock3, Edit3, FileText, Grid2X2, ListFilter, LogOut, Mail, MapPin, Phone, Plus, Save, Search, Settings, Sparkles, Star, Theater, Trash2, Upload, UserRound, UsersRound, X, XCircle, } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Navigate, useNavigate } from "react-router-dom";
import { danceImages } from "../assets/danceImages";
import { PageHeader } from "../components/PageHeader";
import { attendanceRecordsCacheKey, getTeacherAttendanceRecords, saveTeacherAttendanceSession, updateTeacherAttendanceRecord, } from "../services/attendanceService";
import { getTeacherEnrolments, submittedEnrolmentApplicationsCacheKey, submittedEnrolmentCacheKey, updateTeacherEnrolmentStatus, } from "../services/enrolmentService";
import { createTeacherClass, deleteTeacherClass, getMyTeacherClasses, teacherClassCacheKey, updateTeacherClass, } from "../services/teacherClassService";
import { showConfirmAlert, showErrorAlert, showSuccessAlert } from "../utils/alerts";
import { cn } from "../utils/cn";
const sessionStorageKey = "sankalanaTeacherSession";
const attendanceStorageKey = attendanceRecordsCacheKey;
const createdClassesStorageKey = teacherClassCacheKey;
const submittedEnrolmentStorageKey = submittedEnrolmentCacheKey;
const submittedEnrolmentApplicationsStorageKey = submittedEnrolmentApplicationsCacheKey;
const classDayOptions = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const attendanceStatusOptions = ["present", "absent", "late"];
function getStoredTeacherSession() {
    const storedSession = localStorage.getItem(sessionStorageKey);
    if (!storedSession) {
        return null;
    }
    try {
        return JSON.parse(storedSession);
    }
    catch {
        localStorage.removeItem(sessionStorageKey);
        return null;
    }
}
function getTodayInputValue() {
    const date = new Date();
    const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 10);
}
function formatAttendanceDate(value) {
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
function readAttendanceRecords() {
    const storedRecords = localStorage.getItem(attendanceStorageKey);
    if (!storedRecords) {
        return [];
    }
    try {
        const parsedRecords = JSON.parse(storedRecords);
        return Array.isArray(parsedRecords)
            ? parsedRecords.filter((record) => attendanceStatusOptions.includes(record.status))
            : [];
    }
    catch {
        localStorage.removeItem(attendanceStorageKey);
        return [];
    }
}
function persistAttendanceRecords(records) {
    localStorage.setItem(attendanceStorageKey, JSON.stringify(records));
}
function readCreatedClasses() {
    const storedClasses = localStorage.getItem(createdClassesStorageKey);
    if (!storedClasses) {
        return [];
    }
    try {
        const parsedClasses = JSON.parse(storedClasses);
        return Array.isArray(parsedClasses)
            ? parsedClasses.filter((classItem) => classItem.id && classItem.className)
            : [];
    }
    catch {
        localStorage.removeItem(createdClassesStorageKey);
        return [];
    }
}
function isClassOwnedByTeacher(classItem, teacher) {
    if (classItem.teacherId) {
        return classItem.teacherId === teacher.id;
    }
    return classItem.danceStyle === teacher.danceStyles;
}
function toTeacherClassPayload(classItem) {
    return {
        className: classItem.className,
        danceStyle: classItem.danceStyle,
        classLevel: classItem.classLevel,
        description: classItem.description,
        days: classItem.days,
        startTime: classItem.startTime,
        endTime: classItem.endTime,
        studio: classItem.studio,
        capacity: classItem.capacity,
        posterFileName: classItem.posterFileName,
        milestones: classItem.milestones,
    };
}
function readTeacherReviewApplications() {
    const applications = [];
    const storedApplications = localStorage.getItem(submittedEnrolmentApplicationsStorageKey);
    if (storedApplications) {
        try {
            const parsedApplications = JSON.parse(storedApplications);
            if (Array.isArray(parsedApplications)) {
                applications.push(...parsedApplications.filter((application) => application.applicationId));
            }
        }
        catch {
            localStorage.removeItem(submittedEnrolmentApplicationsStorageKey);
        }
    }
    const storedApplication = localStorage.getItem(submittedEnrolmentStorageKey);
    if (storedApplication) {
        try {
            const application = JSON.parse(storedApplication);
            if (application?.applicationId &&
                !applications.some((currentApplication) => currentApplication.applicationId === application.applicationId)) {
                applications.push(application);
            }
        }
        catch {
            localStorage.removeItem(submittedEnrolmentStorageKey);
        }
    }
    return applications.sort((first, second) => new Date(second.submittedAt).getTime() - new Date(first.submittedAt).getTime());
}
function persistTeacherReviewApplications(applications) {
    const sortedApplications = [...applications].sort((first, second) => new Date(second.submittedAt).getTime() - new Date(first.submittedAt).getTime());
    const currentSingleApplication = localStorage.getItem(submittedEnrolmentStorageKey);
    localStorage.setItem(submittedEnrolmentApplicationsStorageKey, JSON.stringify(sortedApplications));
    if (!currentSingleApplication) {
        return;
    }
    try {
        const singleApplication = JSON.parse(currentSingleApplication);
        const updatedSingleApplication = sortedApplications.find((application) => application.applicationId === singleApplication.applicationId);
        if (updatedSingleApplication) {
            localStorage.setItem(submittedEnrolmentStorageKey, JSON.stringify(updatedSingleApplication));
        }
    }
    catch {
        localStorage.removeItem(submittedEnrolmentStorageKey);
    }
}
function getApplicationsForTeacher(teacher) {
    return readTeacherReviewApplications().filter((application) => application.data.teacherId === teacher.id);
}
function getClassForApplication(application) {
    return readCreatedClasses().find((classItem) => classItem.id === application.data.slotId);
}
function getApprovedApplicationsForTeacher(teacher) {
    return getApplicationsForTeacher(teacher).filter((application) => application.status === "Approved");
}
function getAttendanceStudentsForClass(applications, classId) {
    const studentsById = new Map();
    applications
        .filter((application) => application.status === "Approved" && application.data.slotId === classId)
        .forEach((application, index) => {
        const studentId = application.studentId || application.applicationId;
        if (!studentId || studentsById.has(studentId)) {
            return;
        }
        studentsById.set(studentId, {
            id: studentId,
            applicationId: application.applicationId,
            name: application.data.personal.fullName || "Unnamed Student",
            email: application.data.personal.email || "",
            phone: application.data.personal.phone || "",
            avatar: danceImages.story[index % danceImages.story.length],
        });
    });
    return Array.from(studentsById.values()).sort((first, second) => first.name.localeCompare(second.name));
}
function createAttendanceEntriesForStudents(students, records, classId, date) {
    return students.reduce((entries, student) => {
        const savedRecord = records.find((record) => record.classId === classId && record.date === date && record.studentId === student.id);
        const savedStatus = attendanceStatusOptions.includes(savedRecord?.status) ? savedRecord.status : "";
        entries[student.id] = {
            status: savedStatus,
            remarks: savedRecord?.remarks ?? "",
        };
        return entries;
    }, {});
}
function formatClassSchedule(classItem) {
    if (!classItem) {
        return "Class schedule not found";
    }
    return `${classItem.days.join(", ") || "Flexible"} • ${classItem.startTime} - ${classItem.endTime}`;
}
function getStatusLabel(status) {
    return status.charAt(0).toUpperCase() + status.slice(1);
}
function getImageSource(image) {
    if (typeof image === "string") {
        return image;
    }
    return image?.src ?? danceImages.heroCarousel[0].src;
}
function formatClassDate(value) {
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
export function TeacherDashboardPage() {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState("Dashboard");
    const authentication = getStoredTeacherSession();
    if (!authentication) {
        return <Navigate to="/teacher-login" replace/>;
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
        { label: "Enrol Requests", icon: BadgeCheck },
        { label: "Attendance", icon: ClipboardCheck },
        { label: "Schedule", icon: CalendarDays },
        { label: "Performances", icon: Theater },
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
    return (<div className="min-h-screen bg-black text-white">
      <PageHeader ctaLabel="Logout" onCtaClick={handleLogout}/>

      <div className="grid min-h-[calc(100svh-5rem)] lg:grid-cols-[19rem_1fr]">
        <aside className="relative z-20 border-b border-white/10 bg-[#120415]/96 px-4 py-5 shadow-[18px_0_70px_rgba(134,20,190,0.12)] lg:border-b-0 lg:border-r">
          <nav className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1" aria-label="Teacher dashboard">
            {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (<button key={item.label} type="button" onClick={() => setActiveSection(item.label)} className={`flex min-h-14 items-center gap-4 rounded-2xl px-5 text-left text-sm font-black transition ${activeSection === item.label
                    ? "bg-gradient-to-r from-orchid to-[#bb26ff] text-white shadow-[0_18px_45px_rgba(217,28,255,0.34)]"
                    : "text-white/[0.58] hover:bg-white/[0.08] hover:text-white"}`}>
                  <Icon size={23}/>
                  {item.label}
                </button>);
        })}
          </nav>

          <button type="button" onClick={handleLogout} className="mt-8 flex min-h-14 w-full items-center gap-4 rounded-2xl border border-white/10 px-5 text-left text-sm font-black text-white/65 transition hover:border-orchid/50 hover:text-white">
            <LogOut size={22}/>
            Logout
          </button>
        </aside>

        <main className="relative overflow-hidden px-5 py-8 sm:px-8 lg:px-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_18%,rgba(188,38,255,0.22),transparent_28rem),radial-gradient(circle_at_86%_76%,rgba(41,216,255,0.13),transparent_24rem)]"/>
          <div className="absolute inset-0 bg-gradient-to-br from-[#1b071f]/78 via-black to-[#020404]"/>

          {activeSection === "My Info" ? (<section className="relative z-10 mx-auto max-w-7xl">
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
                  <span className="h-2.5 w-2.5 rounded-full bg-cyanGlow"/>
                  {teacher.applicationStatus}
                </span>
              </div>

              <div className="mt-12 grid gap-7 xl:grid-cols-[24rem_1fr]">
                <article className="rounded-[1.75rem] border border-white/[0.12] bg-white/[0.055] p-8 text-center shadow-[0_24px_90px_rgba(0,0,0,0.26)] backdrop-blur-xl">
                  <div className="relative mx-auto h-32 w-32 rounded-full border-4 border-[#f0b7ff] p-1 shadow-[0_0_40px_rgba(240,183,255,0.34)]">
                    <img src={avatarSrc} alt="" className="h-full w-full rounded-full object-cover"/>
                    <span className="absolute bottom-1 right-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-cyanGlow text-ink">
                      <Star size={17} fill="currentColor"/>
                    </span>
                  </div>

                  <h2 className="mt-7 text-3xl font-black text-[#f4e7fb]">{teacher.fullName}</h2>
                  <p className="mt-2 text-base font-black text-[#f0b7ff]">{instructorTitle}</p>
                  <p className="mt-4 break-words text-sm font-semibold leading-6 text-white/[0.58]">
                    {teacher.email}
                  </p>

                  <div className="mt-8 grid grid-cols-2 gap-3">
                    {profileStats.map((stat) => (<div key={stat.label} className="rounded-2xl bg-white/[0.07] p-4 text-left">
                        <p className="text-xs font-black uppercase tracking-[0.12em] text-white/45">{stat.label}</p>
                        <p className="mt-2 break-words text-base font-black capitalize text-[#f4e7fb]">{stat.value}</p>
                      </div>))}
                  </div>
                </article>

                <div className="grid gap-7">
                  <article className="rounded-[1.75rem] border border-white/[0.12] bg-white/[0.055] p-8 shadow-[0_24px_90px_rgba(0,0,0,0.26)] backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-orchid/25 text-[#f0b7ff]">
                        <UserRound size={25}/>
                      </span>
                      <h2 className="text-3xl font-black text-[#f4e7fb]">Personal Details</h2>
                    </div>

                    <div className="mt-7 grid gap-4 md:grid-cols-2">
                      {contactDetails.map((detail) => {
                const Icon = detail.icon;
                return (<div key={detail.label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
                            <div className="flex items-center gap-3 text-white/[0.58]">
                              <Icon size={19}/>
                              <p className="text-xs font-black uppercase tracking-[0.14em]">{detail.label}</p>
                            </div>
                            <p className="mt-3 break-words text-xl font-black text-[#f4e7fb]">{detail.value}</p>
                          </div>);
            })}
                    </div>
                  </article>

                  <article className="rounded-[1.75rem] border border-white/[0.12] bg-white/[0.055] p-8 shadow-[0_24px_90px_rgba(0,0,0,0.26)] backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                      <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-cyanGlow/20 text-cyanGlow">
                        <FileText size={25}/>
                      </span>
                      <h2 className="text-3xl font-black text-[#f4e7fb]">Teaching Information</h2>
                    </div>

                    <div className="mt-7 grid gap-4 md:grid-cols-2">
                      {professionalDetails.map((detail) => (<div key={detail.label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-5">
                          <p className="text-xs font-black uppercase tracking-[0.14em] text-white/[0.58]">
                            {detail.label}
                          </p>
                          <p className="mt-3 break-words text-xl font-black text-[#f4e7fb]">{detail.value}</p>
                        </div>))}
                    </div>

                    <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.06] p-6">
                      <p className="text-xs font-black uppercase tracking-[0.14em] text-white/[0.58]">Biography</p>
                      <p className="mt-3 text-base font-semibold leading-8 text-white/[0.72]">{teacher.biography}</p>
                    </div>
                  </article>

                  <article className="rounded-[1.75rem] border border-white/[0.12] bg-white/[0.055] p-8 shadow-[0_24px_90px_rgba(0,0,0,0.26)] backdrop-blur-xl">
                    <h2 className="text-3xl font-black text-[#f4e7fb]">Available Teaching Days</h2>
                    <div className="mt-6 flex flex-wrap gap-3">
                      {teacher.availableDays.map((day) => (<span key={day} className="inline-flex min-h-11 items-center rounded-full border border-cyanGlow/35 bg-cyanGlow/10 px-5 text-sm font-black text-cyanGlow">
                          {day}
                        </span>))}
                    </div>
                  </article>
                </div>
              </div>
            </section>) : activeSection === "My Classes" ? (<TeacherClassesSection teacher={teacher} onMarkAttendance={() => setActiveSection("Attendance")}/>) : activeSection === "Enrol Requests" ? (<TeacherEnrolmentRequestsSection teacher={teacher}/>) : activeSection === "Attendance" ? (<TeacherAttendanceSection teacher={teacher}/>) : (<section className="relative z-10 mx-auto max-w-7xl">
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
                <button type="button" onClick={() => setActiveSection("Attendance")} className="inline-flex min-h-16 items-center justify-center gap-4 rounded-full border border-cyanGlow/45 bg-cyanGlow/5 px-8 text-base font-black text-cyanGlow shadow-[0_18px_55px_rgba(41,216,255,0.12)] transition hover:bg-cyanGlow/10">
                  <CheckCircle2 size={25}/>
                  Mark Attendance
                </button>
                <button type="button" onClick={() => setActiveSection("My Classes")} className="inline-flex min-h-16 items-center justify-center gap-4 rounded-full bg-gradient-to-r from-[#bb26ff] to-[#e026b4] px-8 text-base font-black text-white shadow-[0_18px_55px_rgba(217,28,255,0.34)] transition hover:-translate-y-0.5">
                  <Plus size={27}/>
                  View Classes
                </button>
              </div>
            </div>

            <div className="mt-12 grid gap-7 xl:grid-cols-3">
              <article className="rounded-[1.75rem] border border-white/[0.12] bg-white/[0.055] p-8 shadow-[0_24px_90px_rgba(0,0,0,0.26)] backdrop-blur-xl">
                <CalendarDays className="text-[#f0b7ff]" size={39}/>
                <p className="mt-8 text-xs font-black uppercase tracking-[0.24em] text-white/60">
                  Today's Classes
                </p>
                <p className="mt-2 text-6xl font-black text-[#f4e7fb]">04</p>
                <p className="mt-4 text-base font-black text-[#f0b7ff]">Next class in 45 mins</p>
              </article>

              <article className="rounded-[1.75rem] border border-white/[0.12] bg-white/[0.055] p-8 shadow-[0_24px_90px_rgba(0,0,0,0.26)] backdrop-blur-xl">
                <UsersRound className="text-cyanGlow" size={39}/>
                <p className="mt-8 text-xs font-black uppercase tracking-[0.24em] text-white/60">
                  Total Students
                </p>
                <p className="mt-2 text-6xl font-black text-[#f4e7fb]">128</p>
                <p className="mt-4 text-base font-black text-cyanGlow">+12 this month</p>
              </article>

              <article className="rounded-[1.75rem] border border-white/[0.12] bg-white/[0.055] p-8 shadow-[0_24px_90px_rgba(0,0,0,0.26)] backdrop-blur-xl">
                <ClipboardCheck className="text-[#ff9edc]" size={39}/>
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
                  {scheduleItems.map((item) => (<article key={item.title} className={`relative overflow-hidden rounded-2xl border border-white/[0.12] bg-white/[0.055] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.2)] backdrop-blur-xl ${item.muted ? "opacity-55" : ""}`}>
                      <div className={`absolute bottom-6 left-6 top-6 w-1 rounded-full ${item.accent}`}/>
                      <div className="ml-7 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <h3 className="text-2xl font-black text-[#f4e7fb]">{item.title}</h3>
                          <p className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-white/[0.62]">
                            <span>{item.time}</span>
                            <span className="inline-flex items-center gap-2">
                              <MapPin size={15}/>
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
                    </article>))}
                </div>
              </section>

              <aside className="grid gap-7">
                <article className="rounded-[1.75rem] border border-white/[0.12] bg-white/[0.055] p-8 text-center shadow-[0_24px_90px_rgba(0,0,0,0.26)] backdrop-blur-xl">
                  <div className="relative mx-auto h-28 w-28 rounded-full border-4 border-[#f0b7ff] p-1 shadow-[0_0_35px_rgba(240,183,255,0.36)]">
                    <img src={avatarSrc} alt="" className="h-full w-full rounded-full object-cover"/>
                    <span className="absolute bottom-1 right-0 inline-flex h-7 w-7 items-center justify-center rounded-full bg-cyanGlow text-ink">
                      <Star size={16} fill="currentColor"/>
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
                return (<button key={task.label} type="button" className="flex min-h-16 items-center justify-between gap-4 rounded-2xl bg-white/[0.06] px-5 text-left transition hover:bg-white/[0.09]">
                          <span className="inline-flex items-center gap-4 text-sm font-black text-white/80">
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orchid/25 text-[#f0b7ff]">
                              <Icon size={21}/>
                            </span>
                            {task.label}
                          </span>
                          <ChevronRight size={18} className="text-white/45"/>
                        </button>);
            })}
                  </div>
                </article>
              </aside>
            </div>
          </section>)}
        </main>
      </div>
    </div>);
}
function TeacherEnrolmentRequestsSection({ teacher, }) {
    const [applications, setApplications] = useState(() => getApplicationsForTeacher(teacher));
    const [isLoadingRequests, setIsLoadingRequests] = useState(true);
    const [statusFilter, setStatusFilter] = useState("All");
    const [classFilter, setClassFilter] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const pendingCount = applications.filter((application) => application.status === "Pending Review").length;
    const approvedCount = applications.filter((application) => application.status === "Approved").length;
    const rejectedCount = applications.filter((application) => application.status === "Rejected").length;
    const classOptions = Array.from(new Map(applications.map((application) => {
        const classItem = getClassForApplication(application);
        return [application.data.slotId, classItem?.className ?? "Class not found"];
    })));
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();
    const filteredApplications = applications.filter((application) => {
        const classItem = getClassForApplication(application);
        const searchableText = [
            application.applicationId,
            application.data.personal.fullName,
            application.data.personal.email,
            application.data.personal.phone,
            application.data.guardian.fullName,
            classItem?.className,
            classItem?.classLevel,
        ].join(" ").toLowerCase();
        return ((statusFilter === "All" || application.status === statusFilter) &&
            (classFilter === "All" || application.data.slotId === classFilter) &&
            (!normalizedSearchTerm || searchableText.includes(normalizedSearchTerm)));
    });
    useEffect(() => {
        let isMounted = true;
        async function loadRequests() {
            setIsLoadingRequests(true);
            try {
                await getMyTeacherClasses();
                const teacherApplications = await getTeacherEnrolments();
                if (isMounted) {
                    setApplications(teacherApplications);
                }
            }
            catch (error) {
                if (isMounted) {
                    await showErrorAlert("Requests Not Loaded", error instanceof Error ? error.message : "Unable to load enrolment requests.");
                }
            }
            finally {
                if (isMounted) {
                    setIsLoadingRequests(false);
                }
            }
        }
        void loadRequests();
        return () => {
            isMounted = false;
        };
    }, [teacher.id]);
    async function handleDecision(application, status) {
        const approving = status === "Approved";
        const result = await showConfirmAlert(approving ? "Accept Enrolment" : "Reject Enrolment", `${approving ? "Accept" : "Reject"} ${application.data.personal.fullName}'s enrolment request?`, approving ? "Accept" : "Reject");
        if (!result.isConfirmed) {
            return;
        }
        try {
            const updatedApplication = await updateTeacherEnrolmentStatus(application.applicationId, status);
            const updatedApplications = applications.map((currentApplication) => currentApplication.applicationId === updatedApplication.applicationId ? updatedApplication : currentApplication);
            persistTeacherReviewApplications(updatedApplications);
            setApplications(updatedApplications);
            await showSuccessAlert(approving ? "Enrolment Accepted" : "Enrolment Rejected", `${application.data.personal.fullName}'s request has been ${approving ? "accepted" : "rejected"}.`);
        }
        catch (error) {
            await showErrorAlert("Decision Not Saved", error instanceof Error ? error.message : "Unable to update enrolment request.");
        }
    }
    return (<section className="relative z-10 mx-auto max-w-7xl pb-10">
      <div className="flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.24em] text-cyanGlow">Student Enrolments</p>
          <h1 className="mt-4 text-5xl font-black leading-none text-[#f4e7fb] sm:text-6xl">Enrol Requests</h1>
          <p className="mt-5 max-w-3xl text-xl font-semibold leading-9 text-white/[0.62]">
            Review students who selected your class during enrolment. Accept or reject each request from here.
          </p>
        </div>

        <span className="inline-flex w-fit items-center gap-3 rounded-full border border-cyanGlow/35 bg-cyanGlow/10 px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-cyanGlow">
          <BadgeCheck size={20}/>
          {pendingCount} Pending
        </span>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        <ClassMetric icon={BadgeCheck} label="Pending Review" value={String(pendingCount)} detail="Waiting for your decision"/>
        <ClassMetric icon={CheckCircle2} label="Accepted" value={String(approvedCount)} detail="Students approved"/>
        <ClassMetric icon={XCircle} label="Rejected" value={String(rejectedCount)} detail="Requests declined"/>
      </div>

      {applications.length > 0 && (<section className="mt-8 rounded-[1.5rem] border border-white/[0.12] bg-white/[0.055] p-5 shadow-[0_24px_90px_rgba(0,0,0,0.24)] backdrop-blur-xl">
          <div className="grid gap-4 xl:grid-cols-[1fr_13rem_16rem]">
            <label className="grid gap-3">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-white/52">Search Student</span>
              <span className="flex min-h-12 items-center gap-3 rounded-xl border border-white/10 bg-[#0b0310]/82 px-4 text-white/70 focus-within:border-cyanGlow/55">
                <Search size={18} className="text-cyanGlow"/>
                <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Name, email, phone, application ID..." className="min-h-11 flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/32"/>
              </span>
            </label>

            <label className="grid gap-3">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-white/52">Status</span>
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="min-h-12 rounded-xl border border-white/10 bg-[#0b0310] px-4 text-sm font-black text-white outline-none focus:border-cyanGlow/55">
                {["All", "Pending Review", "Approved", "Rejected"].map((status) => (<option key={status} value={status} className="bg-[#0b0310] text-white">
                    {status}
                  </option>))}
              </select>
            </label>

            <label className="grid gap-3">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-white/52">Class</span>
              <select value={classFilter} onChange={(event) => setClassFilter(event.target.value)} className="min-h-12 rounded-xl border border-white/10 bg-[#0b0310] px-4 text-sm font-black text-white outline-none focus:border-cyanGlow/55">
                <option value="All" className="bg-[#0b0310] text-white">All Classes</option>
                {classOptions.map(([classId, className]) => (<option key={classId} value={classId} className="bg-[#0b0310] text-white">
                    {className}
                  </option>))}
              </select>
            </label>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-black uppercase tracking-[0.12em] text-white/48">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-4 py-2">
              <ListFilter size={15}/>
              Showing {filteredApplications.length} of {applications.length}
            </span>
            {(statusFilter !== "All" || classFilter !== "All" || searchTerm.trim()) && (<button type="button" onClick={() => {
                    setStatusFilter("All");
                    setClassFilter("All");
                    setSearchTerm("");
                }} className="rounded-full border border-white/10 px-4 py-2 text-[#f0b7ff] transition hover:border-[#f0b7ff]/45 hover:text-white">
                Clear Filters
              </button>)}
          </div>
        </section>)}

      {isLoadingRequests && applications.length === 0 ? (<article className="mt-10 rounded-[2rem] border border-white/[0.12] bg-white/[0.055] p-10 text-center shadow-[0_32px_110px_rgba(0,0,0,0.36)] backdrop-blur-xl">
          <BadgeCheck className="mx-auto text-cyanGlow" size={44}/>
          <h2 className="mt-5 text-3xl font-black text-[#f4e7fb]">Loading enrolment requests</h2>
          <p className="mt-3 text-sm font-semibold text-white/60">Checking the database for students who selected your classes.</p>
        </article>) : applications.length === 0 ? (<article className="mt-10 overflow-hidden rounded-[2rem] border border-white/[0.12] bg-white/[0.055] shadow-[0_32px_110px_rgba(0,0,0,0.36)] backdrop-blur-xl">
          <div className="grid gap-8 p-7 lg:grid-cols-[1fr_24rem] lg:p-10">
            <div className="flex flex-col justify-center">
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-cyanGlow/18 text-cyanGlow shadow-[0_18px_45px_rgba(34,211,238,0.16)]">
                <BadgeCheck size={31}/>
              </span>
              <h2 className="mt-7 text-4xl font-black leading-tight text-[#f4e7fb]">No enrolment requests yet</h2>
              <p className="mt-4 max-w-2xl text-base font-semibold leading-8 text-white/62">
                Requests will appear here when students choose one of your created classes during the student enrolment flow.
              </p>
            </div>
            <div className="relative min-h-72 overflow-hidden rounded-[1.5rem] border border-cyanGlow/18">
              <img src={danceImages.heroCarousel[1].src} alt="" className="absolute inset-0 h-full w-full object-cover opacity-72"/>
              <div className="absolute inset-0 bg-gradient-to-t from-[#17091d] via-[#17091d]/25 to-transparent"/>
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-cyanGlow">Class Requests</p>
                <p className="mt-2 text-2xl font-black text-white">Student choices arrive after enrolment submission.</p>
              </div>
            </div>
          </div>
        </article>) : (<section className="mt-8 overflow-hidden rounded-[1.5rem] border border-white/[0.12] bg-[#17091d]/92 shadow-[0_24px_90px_rgba(0,0,0,0.28)]">
          <div className="hidden grid-cols-[1.15fr_1.25fr_1fr_0.85fr_0.9fr] gap-4 border-b border-white/10 bg-white/[0.04] px-6 py-4 text-xs font-black uppercase tracking-[0.14em] text-white/42 xl:grid">
            <span>Student</span>
            <span>Class</span>
            <span>Contact</span>
            <span>Status</span>
            <span className="text-right">Action</span>
          </div>

          <div className="divide-y divide-white/10">
            {filteredApplications.length > 0 ? filteredApplications.map((application) => (<TeacherRequestRow key={application.applicationId} application={application} classItem={getClassForApplication(application)} onApprove={() => handleDecision(application, "Approved")} onReject={() => handleDecision(application, "Rejected")}/>)) : (<div className="p-7 text-center">
                <Search className="mx-auto text-[#f0b7ff]" size={34}/>
                <h3 className="mt-4 text-2xl font-black text-white">No matching enrolment rows</h3>
                <p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-7 text-white/58">
                  Change the filters or clear them to view all enrolment requests.
                </p>
              </div>)}
          </div>
        </section>)}
    </section>);
}
function TeacherRequestRow({ application, classItem, onApprove, onReject, }) {
    const pending = application.status === "Pending Review";
    return (<article className={cn("grid gap-5 px-5 py-5 transition hover:bg-white/[0.035] xl:grid-cols-[1.15fr_1.25fr_1fr_0.85fr_0.9fr] xl:items-center xl:px-6", application.status === "Approved" ? "bg-cyanGlow/[0.035]" : application.status === "Rejected" ? "bg-[#ff7aa8]/[0.035]" : "")}>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-1.5 text-[0.68rem] font-black uppercase tracking-[0.1em] text-white/48">
            {application.applicationId}
          </span>
          <span className="text-xs font-semibold text-white/42">
            {formatClassDate(application.submittedAt)}
          </span>
        </div>
        <h3 className="mt-3 break-words text-xl font-black text-[#f4e7fb]">
          {application.data.personal.fullName}
        </h3>
        <p className="mt-1 text-xs font-semibold text-white/50">
          {application.data.personal.gender} • DOB {application.data.personal.dateOfBirth || "Not set"}
        </p>
      </div>

      <div className="min-w-0">
        <p className="text-sm font-black text-white">{classItem?.className ?? "Class not found"}</p>
        <p className="mt-2 text-xs font-semibold leading-5 text-white/56">{formatClassSchedule(classItem)}</p>
        <p className="mt-2 text-xs font-black uppercase tracking-[0.1em] text-cyanGlow">
          {classItem ? `${classItem.classLevel} • ${classItem.capacity} seats • ${classItem.studio}` : "Not available"}
        </p>
      </div>

      <div className="min-w-0">
        <p className="break-words text-sm font-black text-white/82">{application.data.personal.phone}</p>
        <p className="mt-1 break-words text-xs font-semibold text-white/52">{application.data.personal.email}</p>
        <p className="mt-2 break-words text-xs font-semibold text-white/48">
          Guardian: {application.data.guardian.fullName || "Not provided"} • {application.data.guardian.phone || "No phone"}
        </p>
      </div>

      <div>
        <TeacherRequestStatusBadge status={application.status}/>
        {!pending && (<p className="mt-2 text-xs font-semibold text-white/46">
            {application.reviewedAt ? `Reviewed ${formatClassDate(application.reviewedAt)}` : "Decision saved"}
          </p>)}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row xl:justify-end">
        {pending ? (<>
            <button type="button" onClick={onApprove} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-cyanGlow px-4 text-xs font-black text-ink transition hover:-translate-y-0.5">
              <CheckCircle2 size={17}/>
              Accept
            </button>
            <button type="button" onClick={onReject} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#ff7aa8]/55 px-4 text-xs font-black text-[#ffb0c8] transition hover:bg-[#ff7aa8]/10">
              <XCircle size={17}/>
              Reject
            </button>
          </>) : (<span className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/10 px-4 text-xs font-black uppercase tracking-[0.1em] text-white/46">
            Completed
          </span>)}
      </div>
    </article>);
}
function TeacherRequestStatusBadge({ status }) {
    const approved = status === "Approved";
    const rejected = status === "Rejected";
    return (<span className={cn("inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.1em]", approved
            ? "border-cyanGlow/45 bg-cyanGlow/14 text-cyanGlow"
            : rejected
                ? "border-[#ff7aa8]/45 bg-[#ff7aa8]/12 text-[#ffb0c8]"
                : "border-[#f0b7ff]/35 bg-[#f0b7ff]/12 text-[#f0b7ff]")}>
      {rejected ? <XCircle size={15}/> : <BadgeCheck size={15}/>}
      {status}
    </span>);
}
function TeacherClassesSection({ teacher, }) {
    const teacherDanceStyle = teacher.danceStyles || "Dance Faculty";
    const defaultDays = teacher.availableDays.length > 0 ? teacher.availableDays.slice(0, 2) : ["Tue", "Thu"];
    const [createdClasses, setCreatedClasses] = useState(() => readCreatedClasses().filter((classItem) => isClassOwnedByTeacher(classItem, teacher)));
    const [isLoadingClasses, setIsLoadingClasses] = useState(true);
    const [isAddClassOpen, setIsAddClassOpen] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const totalCapacity = createdClasses.reduce((total, classItem) => total + classItem.capacity, 0);
    const weeklySessions = createdClasses.reduce((total, classItem) => total + classItem.days.length, 0);
    useEffect(() => {
        let isMounted = true;
        async function loadTeacherClasses() {
            setIsLoadingClasses(true);
            try {
                const localOnlyClasses = readCreatedClasses().filter((classItem) => isClassOwnedByTeacher(classItem, teacher) && classItem.id.startsWith("CLS-"));
                const classes = await getMyTeacherClasses();
                const migratedClasses = [];
                for (const classItem of localOnlyClasses) {
                    migratedClasses.push(await createTeacherClass(toTeacherClassPayload(classItem)));
                }
                if (isMounted) {
                    setCreatedClasses([...migratedClasses, ...classes]);
                }
            }
            catch (error) {
                if (isMounted) {
                    await showErrorAlert("Classes Not Loaded", error instanceof Error ? error.message : "Unable to load your classes.");
                }
            }
            finally {
                if (isMounted) {
                    setIsLoadingClasses(false);
                }
            }
        }
        void loadTeacherClasses();
        return () => {
            isMounted = false;
        };
    }, [teacher.id]);
    async function handleCreateClass(payload) {
        try {
            const savedClass = await createTeacherClass(payload);
            setCreatedClasses((currentClasses) => [
                savedClass,
                ...currentClasses.filter((classItem) => classItem.id !== savedClass.id),
            ]);
            setIsAddClassOpen(false);
            await showSuccessAlert("Class Saved", `${savedClass.className} has been saved.`);
        }
        catch (error) {
            await showErrorAlert("Class Not Saved", error instanceof Error ? error.message : "Unable to save class.");
        }
    }
    async function handleUpdateClass(payload) {
        if (!editingClass) {
            return;
        }
        try {
            const updatedClass = await updateTeacherClass(editingClass.id, payload);
            setCreatedClasses((currentClasses) => currentClasses.map((classItem) => (classItem.id === editingClass.id ? updatedClass : classItem)));
            setEditingClass(null);
            await showSuccessAlert("Class Updated", `${updatedClass.className} has been updated.`);
        }
        catch (error) {
            await showErrorAlert("Class Not Updated", error instanceof Error ? error.message : "Unable to update class.");
        }
    }
    async function handleDeleteClass(classItem) {
        const result = await showConfirmAlert("Delete Class", `Delete ${classItem.className}? This removes it from My Classes.`, "Delete");
        if (!result.isConfirmed) {
            return;
        }
        try {
            await deleteTeacherClass(classItem.id);
            setCreatedClasses((currentClasses) => currentClasses.filter((currentClass) => currentClass.id !== classItem.id));
            await showSuccessAlert("Class Deleted", `${classItem.className} has been removed.`);
        }
        catch (error) {
            await showErrorAlert("Class Not Deleted", error instanceof Error ? error.message : "Unable to delete class.");
        }
    }
    return (<section className="relative z-10 mx-auto max-w-7xl pb-10">
      <div className="flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.24em] text-cyanGlow">Teacher Workspace</p>
          <h1 className="mt-4 text-5xl font-black leading-none text-[#f4e7fb] sm:text-6xl">My Classes</h1>
          <p className="mt-5 max-w-3xl text-xl font-semibold leading-9 text-white/[0.62]">
            Create, review, and manage your dance classes from one place.
          </p>
        </div>

        <button type="button" onClick={() => setIsAddClassOpen(true)} className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#bb26ff] to-[#e026b4] px-8 text-sm font-black text-white shadow-[0_18px_55px_rgba(217,28,255,0.34)] transition hover:-translate-y-0.5">
          <Plus size={22}/>
          Add New Class
        </button>
      </div>

      {isLoadingClasses && createdClasses.length === 0 ? (<article className="mt-12 rounded-[2rem] border border-white/[0.12] bg-white/[0.055] p-10 text-center shadow-[0_32px_110px_rgba(0,0,0,0.36)] backdrop-blur-xl">
          <Sparkles className="mx-auto text-[#f0b7ff]" size={44}/>
          <h2 className="mt-5 text-3xl font-black text-[#f4e7fb]">Loading your classes</h2>
          <p className="mt-3 text-sm font-semibold text-white/60">Checking the database for your saved class schedule.</p>
        </article>) : createdClasses.length === 0 ? (<article className="mt-12 overflow-hidden rounded-[2rem] border border-white/[0.12] bg-white/[0.055] shadow-[0_32px_110px_rgba(0,0,0,0.36)] backdrop-blur-xl">
          <div className="grid gap-8 p-7 lg:grid-cols-[1fr_26rem] lg:p-10">
            <div className="flex flex-col justify-center">
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-orchid/28 text-[#f0b7ff] shadow-[0_18px_45px_rgba(217,28,255,0.22)]">
                <Sparkles size={31}/>
              </span>
              <h2 className="mt-7 text-4xl font-black leading-tight text-[#f4e7fb]">No classes created yet</h2>
              <p className="mt-4 max-w-2xl text-base font-semibold leading-8 text-white/62">
                Start by creating your first class. Add the schedule, studio, capacity, and syllabus, then it will appear here as a class card.
              </p>
              <button type="button" onClick={() => setIsAddClassOpen(true)} className="mt-8 inline-flex min-h-14 w-fit items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#bb26ff] to-[#e026b4] px-8 text-sm font-black text-white shadow-[0_18px_55px_rgba(217,28,255,0.34)] transition hover:-translate-y-0.5">
                <Plus size={22}/>
                Add New Class
              </button>
            </div>
            <div className="relative min-h-72 overflow-hidden rounded-[1.5rem] border border-[#f0b7ff]/18">
              <img src={danceImages.heroCarousel[2].src} alt="" className="absolute inset-0 h-full w-full object-cover opacity-72"/>
              <div className="absolute inset-0 bg-gradient-to-t from-[#17091d] via-[#17091d]/25 to-transparent"/>
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-cyanGlow">Class Builder</p>
                <p className="mt-2 text-2xl font-black text-white">Plan your next semester beautifully.</p>
              </div>
            </div>
          </div>
        </article>) : (<section className="mt-12">
          <div className="grid gap-5 md:grid-cols-3">
            <ClassMetric icon={Sparkles} label="Active Classes" value={String(createdClasses.length)} detail="Created by you"/>
            <ClassMetric icon={UsersRound} label="Total Capacity" value={String(totalCapacity)} detail="Available enrolment seats"/>
            <ClassMetric icon={CalendarDays} label="Weekly Sessions" value={String(weeklySessions)} detail="Across selected days"/>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-3">
            {createdClasses.map((classItem, index) => (<article key={classItem.id} className="overflow-hidden rounded-[1.35rem] border border-white/[0.12] bg-[#17091d]/90 shadow-[0_24px_90px_rgba(0,0,0,0.28)]">
                <div className="relative h-44">
                  <img src={danceImages.disciplines[index % danceImages.disciplines.length]} alt="" className="h-full w-full object-cover opacity-72"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#17091d] via-[#17091d]/20 to-transparent"/>
                  <span className="absolute left-5 top-5 rounded-full border border-cyanGlow/35 bg-cyanGlow/12 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-cyanGlow">
                    {classItem.classLevel}
                  </span>
                  <span className="absolute bottom-5 left-5 right-5 text-3xl font-black leading-tight text-[#f4e7fb]">
                    {classItem.className}
                  </span>
                </div>

                <div className="p-6">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#f0b7ff]">
                    {classItem.danceStyle}
                  </p>
                  <p className="mt-4 line-clamp-3 text-sm font-semibold leading-7 text-white/62">
                    {classItem.description}
                  </p>

                  <div className="mt-6 grid gap-3 text-sm font-black text-white/68">
                    <span className="inline-flex items-center gap-3">
                      <CalendarDays size={17} className="text-[#f0b7ff]"/>
                      {classItem.days.join(", ")}
                    </span>
                    <span className="inline-flex items-center gap-3">
                      <Clock3 size={17} className="text-[#f0b7ff]"/>
                      {classItem.startTime} - {classItem.endTime}
                    </span>
                    <span className="inline-flex items-center gap-3">
                      <MapPin size={17} className="text-[#f0b7ff]"/>
                      {classItem.studio}
                    </span>
                    <span className="inline-flex items-center gap-3">
                      <UsersRound size={17} className="text-[#f0b7ff]"/>
                      {classItem.capacity} seats
                    </span>
                  </div>

                  <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.055] p-4">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-white/42">Syllabus</p>
                    <p className="mt-2 text-sm font-black text-white/78">
                      {classItem.milestones.length} milestone{classItem.milestones.length === 1 ? "" : "s"}
                    </p>
                    <p className="mt-2 truncate text-sm font-semibold text-white/48">
                      {classItem.milestones[0]}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/10 pt-5">
                    <span className="text-xs font-black uppercase tracking-[0.12em] text-white/42">
                      Added {formatClassDate(classItem.createdAt)}
                    </span>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-white/58">
                      {classItem.posterFileName || "Default poster"}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <button type="button" onClick={() => setEditingClass(classItem)} className="inline-flex min-h-11 items-center justify-center gap-3 rounded-xl border border-cyanGlow/35 text-sm font-black text-cyanGlow transition hover:bg-cyanGlow/10">
                      <Edit3 size={18}/>
                      Edit
                    </button>
                    <button type="button" onClick={() => void handleDeleteClass(classItem)} className="inline-flex min-h-11 items-center justify-center gap-3 rounded-xl border border-[#ff7aa8]/35 text-sm font-black text-[#ffb0c8] transition hover:bg-[#ff7aa8]/10">
                      <Trash2 size={18}/>
                      Delete
                    </button>
                  </div>
                </div>
              </article>))}
          </div>
        </section>)}

      {isAddClassOpen && (<CreateClassModal teacherDanceStyle={teacherDanceStyle} defaultDays={defaultDays} onClose={() => setIsAddClassOpen(false)} onSubmit={handleCreateClass}/>)}

      {editingClass && (<CreateClassModal teacherDanceStyle={teacherDanceStyle} defaultDays={defaultDays} initialClass={editingClass} onClose={() => setEditingClass(null)} onSubmit={handleUpdateClass}/>)}
    </section>);
}
function CreateClassModal({ teacherDanceStyle, defaultDays, initialClass, onClose, onSubmit, }) {
    const isEditing = Boolean(initialClass);
    const [selectedDays, setSelectedDays] = useState(initialClass?.days ?? defaultDays);
    const [posterFileName, setPosterFileName] = useState(initialClass?.posterFileName ?? "");
    const [milestones, setMilestones] = useState(initialClass?.milestones.map((title, index) => ({ id: index + 1, title })) ?? [
        { id: 1, title: "Week 1-4: Foundation & Footwork" },
        { id: 2, title: "Week 5-8: Intermediate Choreography" },
    ]);
    const inputClass = "min-h-14 w-full rounded-xl border border-white/10 bg-[#190d1f] px-5 text-base font-black text-white outline-none transition placeholder:text-white/28 focus:border-[#f0b7ff]/60 focus:ring-2 focus:ring-[#f0b7ff]/20";
    const labelClass = "text-2xl font-black text-[#ead6ee]";
    function toggleDay(day) {
        setSelectedDays((currentDays) => currentDays.includes(day)
            ? currentDays.filter((currentDay) => currentDay !== day)
            : [...currentDays, day]);
    }
    function addMilestone() {
        setMilestones((currentMilestones) => [
            ...currentMilestones,
            {
                id: Date.now(),
                title: `Week ${currentMilestones.length * 4 + 1}-${currentMilestones.length * 4 + 4}: New Milestone`,
            },
        ]);
    }
    function updateMilestone(id, title) {
        setMilestones((currentMilestones) => currentMilestones.map((milestone) => (milestone.id === id ? { ...milestone, title } : milestone)));
    }
    function removeMilestone(id) {
        setMilestones((currentMilestones) => currentMilestones.length > 1 ? currentMilestones.filter((milestone) => milestone.id !== id) : currentMilestones);
    }
    async function handleSaveClass(event) {
        event.preventDefault();
        if (selectedDays.length === 0) {
            await showErrorAlert("Missing Schedule", "Select at least one class day.");
            return;
        }
        const formData = new FormData(event.currentTarget);
        const cleanMilestones = milestones.map((milestone) => milestone.title.trim()).filter(Boolean);
        if (cleanMilestones.length === 0) {
            await showErrorAlert("Missing Syllabus", "Add at least one course syllabus milestone.");
            return;
        }
        await onSubmit({
            className: String(formData.get("className") ?? ""),
            danceStyle: teacherDanceStyle,
            classLevel: String(formData.get("classLevel") ?? ""),
            description: String(formData.get("description") ?? ""),
            days: selectedDays,
            startTime: String(formData.get("startTime") ?? ""),
            endTime: String(formData.get("endTime") ?? ""),
            studio: String(formData.get("studio") ?? ""),
            capacity: Number(formData.get("capacity") ?? 0),
            posterFileName,
            milestones: cleanMilestones,
        });
    }
    return createPortal(<div className="fixed inset-0 z-[9999] overflow-y-auto bg-black px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-sm font-black text-white/70">
              My Classes <ChevronRight className="mx-2 inline text-white/40" size={15}/>{" "}
              <span className="text-[#f0b7ff]">{isEditing ? "Edit Class" : "Add New Class"}</span>
            </p>
            <h1 className="mt-7 text-5xl font-black leading-none text-[#f4e7fb] sm:text-6xl">
              {isEditing ? "Edit Class" : "Create New Class"}
            </h1>
            <p className="mt-5 max-w-2xl text-xl font-semibold leading-9 text-white/[0.68]">
              {isEditing
            ? "Update your dance curriculum, schedule, and studio details."
            : "Configure your dance curriculum, schedule, and studio space for the upcoming semester."}
            </p>
          </div>
          <button type="button" onClick={onClose} className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#211028] text-white/70 transition hover:border-[#f0b7ff]/45 hover:text-[#f0b7ff]" aria-label="Close add class form">
            <X size={23}/>
          </button>
        </div>

        <form className="mt-12 rounded-[2rem] border border-white/[0.12] bg-[#211028]/95 p-6 shadow-[0_32px_110px_rgba(0,0,0,0.55)] sm:p-8 lg:p-12" onSubmit={handleSaveClass}>
          <div className="grid gap-10 lg:grid-cols-[1fr_26rem]">
            <section className="grid content-start gap-8">
              <label className="grid gap-4">
                <span className={labelClass}>Class Name</span>
                <input className={inputClass} name="className" defaultValue={initialClass?.className ?? ""} placeholder="e.g. Advanced Contemporary Fusion" required/>
              </label>

              <div className="grid gap-6 sm:grid-cols-2">
                <label className="grid gap-4">
                  <span className={labelClass}>Dance Style</span>
                  <input className={`${inputClass} cursor-not-allowed bg-[#120817] text-white/72`} value={teacherDanceStyle} readOnly aria-readonly="true"/>
                </label>

                <label className="grid gap-4">
                  <span className={labelClass}>Class Level</span>
                  <select className={`${inputClass} cursor-pointer`} name="classLevel" defaultValue={initialClass?.classLevel ?? "Beginner"} required>
                    {["Beginner", "Intermediate", "Advanced", "Professional"].map((level) => (<option key={level} value={level} className="bg-[#140616] text-white">
                        {level}
                      </option>))}
                  </select>
                </label>
              </div>

              <label className="grid gap-4">
                <span className={labelClass}>Class Description</span>
                <textarea className={`${inputClass} min-h-40 resize-none py-5 leading-7`} name="description" defaultValue={initialClass?.description ?? ""} placeholder="Describe the artistic vision and technical requirements..." required/>
              </label>

              <section className="grid gap-4">
                <div className="flex items-center justify-between gap-4">
                  <h2 className={labelClass}>Course Syllabus</h2>
                  <button type="button" onClick={addMilestone} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.1em] text-cyanGlow transition hover:text-white">
                    <Plus size={16}/>
                    Add Milestone
                  </button>
                </div>

                <div className="grid gap-4">
                  {milestones.map((milestone, index) => (<div key={milestone.id} className="grid min-h-20 grid-cols-[3rem_1fr_2.5rem] items-center gap-4 rounded-xl border border-white/10 bg-white/[0.075] px-4">
                      <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-orchid/55 text-sm font-black text-white">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <input value={milestone.title} onChange={(event) => updateMilestone(milestone.id, event.target.value)} className="min-w-0 bg-transparent text-base font-black text-white/68 outline-none placeholder:text-white/28" placeholder="Week 1-4: Foundation & Footwork"/>
                      <button type="button" onClick={() => removeMilestone(milestone.id)} className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-white/38 transition hover:bg-white/10 hover:text-[#ff9fbd]" aria-label="Remove milestone">
                        <Trash2 size={19}/>
                      </button>
                    </div>))}
                </div>
              </section>
            </section>

            <aside className="grid content-start gap-8">
              <section className="rounded-[1.35rem] border border-[#f0b7ff]/18 bg-orchid/22 p-6 shadow-[0_20px_70px_rgba(188,38,255,0.18)]">
                <h2 className="flex items-center gap-3 text-lg font-black text-[#ead6ee]">
                  <Clock3 className="text-[#f0b7ff]" size={23}/>
                  Schedule / Time Slots
                </h2>

                <div className="mt-7">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-white/68">Day of Week</p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {classDayOptions.map((day) => (<button key={day} type="button" onClick={() => toggleDay(day)} className={cn("min-h-9 rounded-full border px-4 text-sm font-black transition", selectedDays.includes(day)
                ? "border-[#f0b7ff] bg-[#f0b7ff] text-[#2a1232]"
                : "border-white/15 bg-[#2a1232]/75 text-white/70 hover:border-[#f0b7ff]/50 hover:text-white")}>
                        {day}
                      </button>))}
                  </div>
                </div>

                <div className="mt-7 grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-3">
                    <span className="text-xs font-black uppercase tracking-[0.12em] text-white/68">Start Time</span>
                    <input className={inputClass} name="startTime" type="time" defaultValue={initialClass?.startTime ?? "16:00"} required/>
                  </label>
                  <label className="grid gap-3">
                    <span className="text-xs font-black uppercase tracking-[0.12em] text-white/68">End Time</span>
                    <input className={inputClass} name="endTime" type="time" defaultValue={initialClass?.endTime ?? "18:00"} required/>
                  </label>
                </div>
              </section>

              <label className="grid gap-4">
                <span className={labelClass}>Studio Location</span>
                <span className="relative">
                  <select className={`${inputClass} cursor-pointer pr-12`} name="studio" defaultValue={initialClass?.studio ?? "Studio A - Mirror Hall"} required>
                    {["Studio A - Mirror Hall", "Studio B - Practice Room", "Studio C - Main Stage", "Grand Hall"].map((studio) => (<option key={studio} value={studio} className="bg-[#140616] text-white">
                        {studio}
                      </option>))}
                  </select>
                  <MapPin className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-white/60" size={22}/>
                </span>
              </label>

              <label className="grid gap-4">
                <span className={labelClass}>Enrollment Capacity</span>
                <span className="relative">
                  <UsersRound className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-white/60" size={23}/>
                  <input className={`${inputClass} pl-16 text-2xl`} name="capacity" type="number" min={1} defaultValue={initialClass?.capacity ?? 25} required/>
                </span>
              </label>

              <label className="relative grid min-h-48 cursor-pointer place-items-center overflow-hidden rounded-[1.35rem] border border-dashed border-white/20 text-center transition hover:border-[#f0b7ff]/60">
                <img src={danceImages.disciplines[3]} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40"/>
                <span className="absolute inset-0 bg-gradient-to-t from-[#45105b]/85 via-[#211028]/40 to-transparent"/>
                <span className="relative z-10 grid justify-items-center gap-3 text-sm font-black uppercase tracking-[0.08em] text-[#f0b7ff]">
                  <Upload size={36}/>
              {posterFileName || "Upload Class Poster"}
                </span>
                <input className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => setPosterFileName(event.currentTarget.files?.[0]?.name ?? "")}/>
              </label>
            </aside>
          </div>

          <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-10 sm:flex-row sm:items-center sm:justify-end">
            <button type="button" onClick={onClose} className="inline-flex min-h-13 items-center justify-center rounded-full px-8 text-base font-black text-white/70 transition hover:text-white">
              Cancel
            </button>
            <button type="submit" className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#bb26ff] to-[#e026b4] px-10 text-base font-black text-white shadow-[0_18px_55px_rgba(217,28,255,0.34)] transition hover:-translate-y-0.5">
              <Save size={21}/>
              {isEditing ? "Update Class" : "Save Class"}
            </button>
          </div>
        </form>
      </div>
    </div>, document.body);
}
function ClassMetric({ icon: Icon, label, value, detail, }) {
    return (<article className="rounded-[1.35rem] border border-white/[0.12] bg-white/[0.055] p-6 shadow-[0_20px_70px_rgba(0,0,0,0.22)] backdrop-blur-xl">
      <Icon className="text-[#f0b7ff]" size={31}/>
      <p className="mt-6 text-xs font-black uppercase tracking-[0.2em] text-white/50">{label}</p>
      <p className="mt-2 text-4xl font-black text-[#f4e7fb]">{value}</p>
      <p className="mt-3 text-sm font-semibold text-white/52">{detail}</p>
    </article>);
}
function ClassProgress({ label, value, tone, }) {
    return (<div>
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-black text-white/58">{label}</p>
        <p className="text-sm font-black text-[#f0b7ff]">{value}%</p>
      </div>
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
        <div className={cn("h-full rounded-full", tone === "cyan"
            ? "bg-gradient-to-r from-cyanGlow to-[#6577ff]"
            : "bg-gradient-to-r from-[#bb26ff] to-[#e026b4]")} style={{ width: `${value}%` }}/>
      </div>
    </div>);
}
function TeacherAttendanceSection({ teacher }) {
    const [teacherClasses, setTeacherClasses] = useState(() => readCreatedClasses().filter((classItem) => isClassOwnedByTeacher(classItem, teacher)));
    const [approvedApplications, setApprovedApplications] = useState(() => getApprovedApplicationsForTeacher(teacher));
    const [selectedClassId, setSelectedClassId] = useState(() => teacherClasses[0]?.id ?? "");
    const [selectedDate, setSelectedDate] = useState(getTodayInputValue());
    const [searchQuery, setSearchQuery] = useState("");
    const [attendanceEntries, setAttendanceEntries] = useState({});
    const [records, setRecords] = useState(() => readAttendanceRecords());
    const [recordClassFilter, setRecordClassFilter] = useState("all");
    const [recordDateFilter, setRecordDateFilter] = useState("");
    const [recordStatusFilter, setRecordStatusFilter] = useState("all");
    const [recordsPage, setRecordsPage] = useState(1);
    const [isLoadingAttendance, setIsLoadingAttendance] = useState(true);
    const selectedClass = useMemo(() => teacherClasses.find((classItem) => classItem.id === selectedClassId) ?? teacherClasses[0] ?? null, [teacherClasses, selectedClassId]);
    const currentStudents = useMemo(() => getAttendanceStudentsForClass(approvedApplications, selectedClass?.id ?? ""), [approvedApplications, selectedClass]);
    useEffect(() => {
        let isMounted = true;
        async function loadAttendanceData() {
            setIsLoadingAttendance(true);
            try {
                const [classes, teacherApplications, databaseRecords] = await Promise.all([
                    getMyTeacherClasses(),
                    getTeacherEnrolments(),
                    getTeacherAttendanceRecords(),
                ]);
                if (isMounted) {
                    const cachedOwnedClasses = readCreatedClasses().filter((classItem) => isClassOwnedByTeacher(classItem, teacher));
                    const databaseOwnedClasses = classes.filter((classItem) => isClassOwnedByTeacher(classItem, teacher));
                    const ownedClasses = databaseOwnedClasses.length > 0 ? databaseOwnedClasses : cachedOwnedClasses;
                    setTeacherClasses(ownedClasses);
                    setApprovedApplications(teacherApplications.filter((application) => application.status === "Approved"));
                    setRecords(databaseRecords.filter((record) => attendanceStatusOptions.includes(record.status)));
                    setSelectedClassId((currentClassId) => currentClassId || ownedClasses[0]?.id || "");
                }
            }
            catch (error) {
                if (isMounted) {
                    await showErrorAlert("Attendance Not Loaded", error instanceof Error ? error.message : "Unable to load attendance data.");
                }
            }
            finally {
                if (isMounted) {
                    setIsLoadingAttendance(false);
                }
            }
        }
        void loadAttendanceData();
        return () => {
            isMounted = false;
        };
    }, [teacher.id]);
    useEffect(() => {
        setAttendanceEntries(createAttendanceEntriesForStudents(currentStudents, records, selectedClass?.id ?? "", selectedDate));
    }, [currentStudents, records, selectedClass, selectedDate]);
    const markedCount = currentStudents.filter((student) => attendanceEntries[student.id]?.status).length;
    const progressPercent = currentStudents.length > 0 ? Math.round((markedCount / currentStudents.length) * 100) : 0;
    const visibleStudents = currentStudents.filter((student) => {
        const searchValue = `${student.name} ${student.email} ${student.phone}`.toLowerCase();
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
    const paginatedRecords = filteredRecords.slice((currentRecordPage - 1) * recordsPerPage, currentRecordPage * recordsPerPage);
    const remainingCount = Math.max(currentStudents.length - markedCount, 0);
    const selectedSchedule = selectedClass
        ? `${selectedClass.startTime} - ${selectedClass.endTime} • ${selectedClass.studio}`
        : "No class selected";
    function updateAttendanceStatus(studentId, status) {
        setAttendanceEntries((current) => ({
            ...current,
            [studentId]: {
                status,
                remarks: current[studentId]?.remarks ?? "",
            },
        }));
    }
    function updateAttendanceRemarks(studentId, remarks) {
        setAttendanceEntries((current) => ({
            ...current,
            [studentId]: {
                status: current[studentId]?.status ?? "",
                remarks,
            },
        }));
    }
    function handleMarkAllPresent() {
        setAttendanceEntries((current) => currentStudents.reduce((entries, student) => {
            entries[student.id] = {
                status: "present",
                remarks: current[student.id]?.remarks ?? "",
            };
            return entries;
        }, {}));
    }
    async function handleSaveAttendance() {
        if (!selectedClass) {
            await showErrorAlert("Class Required", "Create a class before marking attendance.");
            return;
        }
        if (currentStudents.length === 0) {
            await showErrorAlert("No Approved Students", "Approve enrolment requests for this class before saving attendance.");
            return;
        }
        const unmarkedStudents = currentStudents.filter((student) => !attendanceEntries[student.id]?.status);
        if (unmarkedStudents.length > 0) {
            await showErrorAlert("Attendance Incomplete", `Please mark attendance for ${unmarkedStudents.length} student${unmarkedStudents.length === 1 ? "" : "s"} before saving.`);
            return;
        }
        const sessionRecords = currentStudents.map((student) => {
            const entry = attendanceEntries[student.id];
            return {
                id: `${selectedClass.id}-${selectedDate}-${student.id}`,
                classId: selectedClass.id,
                className: selectedClass.className,
                date: selectedDate,
                studentId: student.id,
                studentName: student.name,
                status: entry.status,
                remarks: entry.remarks.trim(),
            };
        });
        try {
            const savedSessionRecords = await saveTeacherAttendanceSession({
                classId: selectedClass.id,
                className: selectedClass.className,
                date: selectedDate,
                records: sessionRecords.map((record) => ({
                    studentId: record.studentId,
                    studentName: record.studentName,
                    status: record.status,
                    remarks: record.remarks,
                })),
            });
            const recordsWithoutCurrentSession = records.filter((record) => !(record.classId === selectedClass.id && record.date === selectedDate));
            const nextRecords = [...savedSessionRecords, ...recordsWithoutCurrentSession];
            setRecords(nextRecords);
            persistAttendanceRecords(nextRecords);
            setRecordClassFilter(selectedClass.id);
            setRecordDateFilter(selectedDate);
            setRecordsPage(1);
            await showSuccessAlert("Attendance Saved", `${selectedClass.className} attendance has been saved for ${formatAttendanceDate(selectedDate)}.`);
        }
        catch (error) {
            await showErrorAlert("Attendance Not Saved", error instanceof Error ? error.message : "Unable to save attendance.");
        }
    }
    async function handleUpdateAttendanceRecord(record, updates) {
        try {
            const updatedRecord = await updateTeacherAttendanceRecord(record.id, updates);
            const nextRecords = records.map((currentRecord) => currentRecord.id === updatedRecord.id ? updatedRecord : currentRecord);
            setRecords(nextRecords);
            persistAttendanceRecords(nextRecords);
            await showSuccessAlert("Attendance Updated", `${record.studentName}'s attendance record has been updated.`);
        }
        catch (error) {
            await showErrorAlert("Attendance Not Updated", error instanceof Error ? error.message : "Unable to update attendance record.");
            throw error;
        }
    }
    async function handleDeleteAttendanceRecord(record) {
        const result = await showConfirmAlert("Delete Attendance Record", `Delete ${record.studentName}'s attendance record for ${formatAttendanceDate(record.date)}?`, "Delete");
        if (!result.isConfirmed) {
            return;
        }
        try {
            const relatedSessionRecords = records.filter((currentRecord) => currentRecord.classId === record.classId && currentRecord.date === record.date && currentRecord.id !== record.id);
            const savedSessionRecords = await saveTeacherAttendanceSession({
                classId: record.classId,
                className: record.className,
                date: record.date,
                records: relatedSessionRecords.map((currentRecord) => ({
                    studentId: currentRecord.studentId,
                    studentName: currentRecord.studentName,
                    status: currentRecord.status,
                    remarks: currentRecord.remarks ?? "",
                })),
            });
            const unrelatedRecords = records.filter((currentRecord) => !(currentRecord.classId === record.classId && currentRecord.date === record.date));
            const nextRecords = [...savedSessionRecords, ...unrelatedRecords];
            setRecords(nextRecords);
            persistAttendanceRecords(nextRecords);
            await showSuccessAlert("Attendance Deleted", "The attendance record has been deleted.");
        }
        catch (error) {
            await showErrorAlert("Attendance Not Deleted", error instanceof Error ? error.message : "Unable to delete attendance record.");
        }
    }
    return (<section className="relative z-10 mx-auto max-w-7xl pb-10">
      <div className="grid gap-5 xl:grid-cols-[20rem_18rem_1fr] xl:items-end">
        <label className="block">
          <span className="text-xs font-black uppercase tracking-[0.16em] text-white/72">Class Selection</span>
          <select value={selectedClass?.id ?? ""} onChange={(event) => setSelectedClassId(event.target.value)} className="mt-2 h-16 w-full rounded-2xl border border-white/10 bg-[#241029] px-5 text-base font-black text-white outline-none transition focus:border-[#f0b7ff]">
            {teacherClasses.length === 0 && <option value="">No classes</option>}
            {teacherClasses.map((classItem) => (<option key={classItem.id} value={classItem.id}>
                {classItem.className}
              </option>))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-black uppercase tracking-[0.16em] text-white/72">Date</span>
          <span className="mt-2 flex h-16 items-center gap-4 rounded-2xl border border-white/10 bg-[#241029] px-5 text-white focus-within:border-[#f0b7ff]">
            <CalendarDays size={24} className="text-[#f0b7ff]"/>
            <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className="min-h-12 flex-1 bg-transparent text-base font-black text-white outline-none [color-scheme:dark]"/>
          </span>
        </label>

        <div className="flex justify-start xl:justify-end">
          <button type="button" onClick={handleMarkAllPresent} disabled={currentStudents.length === 0} className="inline-flex min-h-16 items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#bb26ff] to-[#e026b4] px-9 text-base font-black text-white shadow-[0_20px_60px_rgba(217,28,255,0.34)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45">
            <CheckCircle2 size={22}/>
            Mark All Present
          </button>
        </div>
      </div>

      <article className="mt-8 overflow-hidden rounded-[1.35rem] border-2 border-[#f0b7ff]/55 bg-white/[0.055] p-7 shadow-[0_24px_90px_rgba(0,0,0,0.26)] backdrop-blur-xl">
        <div className="grid gap-7 xl:grid-cols-[1fr_30rem] xl:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-black leading-none text-[#f4e7fb] sm:text-5xl">
                {selectedClass?.className ?? "Attendance"}
              </h1>
              <span className="rounded-full bg-[#f0b7ff]/18 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#f0b7ff]">
                In Progress
              </span>
            </div>
            <p className="mt-4 flex flex-wrap items-center gap-2 text-lg font-black text-white/66">
              <Clock3 size={18} className="text-white/50"/>
              {selectedSchedule}
            </p>
          </div>

          <div className="grid grid-cols-3 divide-x divide-white/10 rounded-2xl bg-black/10 p-4">
            <AttendanceMetric value={currentStudents.length} label="Enrolled" tone="pink"/>
            <AttendanceMetric value={markedCount} label="Marked" tone="cyan"/>
            <AttendanceMetric value={remainingCount} label="Remaining" tone="light"/>
          </div>
        </div>
        <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-gradient-to-r from-[#bb26ff] via-[#6577ff] to-cyanGlow" style={{ width: `${progressPercent}%` }}/>
        </div>
      </article>

      <div className="mt-12 grid gap-5 lg:grid-cols-[1fr_24rem] lg:items-end">
        <h2 className="text-3xl font-black text-[#f4e7fb]">Student Roster</h2>
        <label className="relative block">
          <Search className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-white/42" size={22}/>
          <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search students..." className="h-16 w-full rounded-2xl border border-white/10 bg-white/[0.055] pl-14 pr-4 text-base font-semibold text-white outline-none transition placeholder:text-white/34 focus:border-[#f0b7ff]"/>
        </label>
      </div>

      <div className="mt-7 grid gap-5">
        {isLoadingAttendance && currentStudents.length === 0 ? (<article className="rounded-[1.35rem] border border-white/10 bg-white/[0.055] p-8 text-center shadow-[0_18px_70px_rgba(0,0,0,0.18)] backdrop-blur-xl">
            <ClipboardCheck className="mx-auto text-cyanGlow" size={38}/>
            <h2 className="mt-4 text-2xl font-black text-[#f4e7fb]">Loading current students</h2>
            <p className="mt-2 text-sm font-semibold text-white/58">Checking approved enrolments for your classes.</p>
          </article>) : !selectedClass ? (<article className="rounded-[1.35rem] border border-white/10 bg-white/[0.055] p-8 text-center shadow-[0_18px_70px_rgba(0,0,0,0.18)] backdrop-blur-xl">
            <Sparkles className="mx-auto text-[#f0b7ff]" size={38}/>
            <h2 className="mt-4 text-2xl font-black text-[#f4e7fb]">Create a class first</h2>
            <p className="mt-2 text-sm font-semibold text-white/58">Attendance appears after students enrol in one of your created classes and you approve them.</p>
          </article>) : currentStudents.length === 0 ? (<article className="rounded-[1.35rem] border border-white/10 bg-white/[0.055] p-8 text-center shadow-[0_18px_70px_rgba(0,0,0,0.18)] backdrop-blur-xl">
            <UsersRound className="mx-auto text-cyanGlow" size={38}/>
            <h2 className="mt-4 text-2xl font-black text-[#f4e7fb]">No approved students in this class</h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold leading-7 text-white/58">
              Students will appear here after they enrol in {selectedClass.className} and you accept their request in Enrol Requests.
            </p>
          </article>) : visibleStudents.length === 0 ? (<article className="rounded-[1.35rem] border border-white/10 bg-white/[0.055] p-8 text-center shadow-[0_18px_70px_rgba(0,0,0,0.18)] backdrop-blur-xl">
            <Search className="mx-auto text-[#f0b7ff]" size={38}/>
            <h2 className="mt-4 text-2xl font-black text-[#f4e7fb]">No students match your search</h2>
            <p className="mt-2 text-sm font-semibold text-white/58">Clear the search to show all approved students for this class.</p>
          </article>) : visibleStudents.map((student) => {
            const entry = attendanceEntries[student.id] ?? { status: "", remarks: "" };
            const avatarSrc = getImageSource(student.avatar);
            return (<article key={student.id} className={cn("grid gap-5 rounded-[1.35rem] border border-white/10 bg-white/[0.055] p-5 shadow-[0_18px_70px_rgba(0,0,0,0.18)] backdrop-blur-xl xl:grid-cols-[21rem_1fr_22rem] xl:items-center", entry.status === "present" && "border-[#bb26ff]/50 bg-[#bb26ff]/[0.055]", entry.status === "absent" && "border-[#f6a89c]/55 bg-[#f6a89c]/[0.055]", entry.status === "late" && "border-cyanGlow/55 bg-cyanGlow/[0.055]")}>
              <div className="flex items-center gap-4">
                <img src={avatarSrc} alt="" className="h-14 w-14 rounded-full border border-[#f0b7ff]/40 object-cover shadow-[0_0_22px_rgba(240,183,255,0.18)]"/>
                <div>
                  <h3 className="text-base font-black text-[#f4e7fb]">{student.name}</h3>
                  <p className="mt-1 break-words text-xs font-semibold text-white/42">{student.email || student.phone || "Contact details not provided"}</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <AttendanceStatusButton status="present" active={entry.status === "present"} onClick={() => updateAttendanceStatus(student.id, "present")}/>
                <AttendanceStatusButton status="absent" active={entry.status === "absent"} onClick={() => updateAttendanceStatus(student.id, "absent")}/>
                <AttendanceStatusButton status="late" active={entry.status === "late"} onClick={() => updateAttendanceStatus(student.id, "late")}/>
              </div>

              <input value={entry.remarks} onChange={(event) => updateAttendanceRemarks(student.id, event.target.value)} placeholder="Add remark..." className="h-12 self-center rounded-xl border border-white/10 bg-black/10 px-4 text-sm font-semibold italic text-white outline-none transition placeholder:text-white/34 focus:border-[#f0b7ff]"/>
            </article>);
        })}
      </div>

      <div className="mt-8 flex justify-end">
        <button type="button" onClick={handleSaveAttendance} disabled={currentStudents.length === 0} className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#bb26ff] to-[#e026b4] px-7 text-base font-black text-white shadow-[0_18px_45px_rgba(217,28,255,0.3)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-45">
          <Save size={21}/>
          Save Attendance
        </button>
      </div>

      <AttendanceRecordsPanel records={paginatedRecords} classOptions={teacherClasses} currentPage={currentRecordPage} totalPages={totalRecordPages} classFilter={recordClassFilter} dateFilter={recordDateFilter} statusFilter={recordStatusFilter} onClassFilterChange={setRecordClassFilter} onDateFilterChange={setRecordDateFilter} onStatusFilterChange={setRecordStatusFilter} onApplyFilters={() => setRecordsPage(1)} onPreviousPage={() => setRecordsPage((page) => Math.max(1, page - 1))} onNextPage={() => setRecordsPage((page) => Math.min(totalRecordPages, page + 1))} onUpdateRecord={handleUpdateAttendanceRecord} onDeleteRecord={handleDeleteAttendanceRecord}/>
    </section>);
}
function AttendanceMetric({ value, label, tone }) {
    return (<div className="px-4 py-2 text-center">
      <p className={cn("text-4xl font-black leading-none", tone === "cyan" ? "text-cyanGlow" : tone === "light" ? "text-[#f4e7fb]" : "text-[#f0b7ff]")}>
        {String(value).padStart(2, "0")}
      </p>
      <p className="mt-1 text-xs font-black text-white/62">{label}</p>
    </div>);
}
function AttendanceStatusButton({ status, active, onClick, }) {
    const styles = {
        present: {
            Icon: CheckCircle2,
            active: "border-[#bb26ff]/60 bg-gradient-to-r from-[#bb26ff] to-[#d91cff] text-white shadow-[0_0_28px_rgba(187,38,255,0.35)]",
            inactive: "border-[#bb26ff]/16 bg-[#bb26ff]/[0.035] text-[#f0b7ff] hover:border-[#bb26ff]/40 hover:bg-[#bb26ff]/10",
        },
        absent: {
            Icon: XCircle,
            active: "border-[#f6a89c]/60 bg-[#f6a89c] text-[#17061d] shadow-[0_0_24px_rgba(246,168,156,0.28)]",
            inactive: "border-[#f6a89c]/16 bg-[#f6a89c]/[0.035] text-[#f6a89c] hover:border-[#f6a89c]/40 hover:bg-[#f6a89c]/10",
        },
        late: {
            Icon: Clock3,
            active: "border-cyanGlow/60 bg-cyanGlow text-ink shadow-[0_0_24px_rgba(41,216,255,0.28)]",
            inactive: "border-cyanGlow/16 bg-cyanGlow/[0.035] text-cyanGlow hover:border-cyanGlow/40 hover:bg-cyanGlow/10",
        },
    }[status];
    const Icon = styles.Icon;
    return (<button type="button" onClick={onClick} className={cn("inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-black uppercase tracking-[0.02em] transition hover:-translate-y-0.5", active ? styles.active : styles.inactive)}>
      <Icon size={15}/>
      {getStatusLabel(status)}
    </button>);
}
function AttendanceRecordsPanel({ records, classOptions, currentPage, totalPages, classFilter, dateFilter, statusFilter, onClassFilterChange, onDateFilterChange, onStatusFilterChange, onApplyFilters, onPreviousPage, onNextPage, onUpdateRecord, onDeleteRecord, }) {
    const [editingRecordId, setEditingRecordId] = useState("");
    const [editForm, setEditForm] = useState({ status: "present", remarks: "" });
    const [savingRecordId, setSavingRecordId] = useState("");
    function startEditingRecord(record) {
        setEditingRecordId(record.id);
        setEditForm({
            status: record.status,
            remarks: record.remarks ?? "",
        });
    }
    async function saveEditedRecord(record) {
        setSavingRecordId(record.id);
        try {
            await onUpdateRecord(record, editForm);
            setEditingRecordId("");
        }
        catch {
            // Parent handler already shows the alert.
        }
        finally {
            setSavingRecordId("");
        }
    }
    return (<section className="mt-14">
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
            <select value={classFilter} onChange={(event) => onClassFilterChange(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-[#211028] px-4 text-sm font-black text-white outline-none transition focus:border-[#f0b7ff]">
              <option value="all">All Classes</option>
              {classOptions.map((classItem) => (<option key={classItem.id} value={classItem.id}>
                  {classItem.className}
                </option>))}
            </select>
          </label>

          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-white/58">Date</span>
            <input type="date" value={dateFilter} onChange={(event) => onDateFilterChange(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-[#211028] px-4 text-sm font-black text-white outline-none transition focus:border-[#f0b7ff]"/>
          </label>

          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.18em] text-white/58">Attendance Status</span>
            <select value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-[#211028] px-4 text-sm font-black text-white outline-none transition focus:border-[#f0b7ff]">
              <option value="all">All Statuses</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
            </select>
          </label>

          <button type="button" onClick={onApplyFilters} className="mt-6 inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#bb26ff] to-[#e026b4] px-7 text-sm font-black text-white shadow-[0_18px_45px_rgba(217,28,255,0.28)] lg:mt-auto">
            <ListFilter size={18}/>
            Apply Filters
          </button>
        </div>
      </article>

      <div className="mt-8 overflow-x-auto">
        <div className="min-w-[70rem]">
          <div className="grid grid-cols-[10rem_15rem_14rem_10rem_1fr_9rem] gap-4 px-6 py-4 text-xs font-black uppercase tracking-[0.18em] text-white/70">
            <span>Date</span>
            <span>Class Name</span>
            <span>Student Name</span>
            <span>Status</span>
            <span>Remarks</span>
            <span>Actions</span>
          </div>

          <div className="grid gap-3">
            {records.map((record) => {
            const isEditing = editingRecordId === record.id;
            return (<article key={record.id} className={cn("grid min-h-16 grid-cols-[10rem_15rem_14rem_10rem_1fr_9rem] items-center gap-4 rounded-xl border border-white/10 bg-white/[0.045] px-6 py-3 text-sm font-black text-white/78 shadow-[0_16px_55px_rgba(0,0,0,0.16)]", isEditing && "border-[#f0b7ff]/45 bg-[#f0b7ff]/[0.06]")}>
                <span>
                  <span className="block text-[#f0b7ff]">{formatAttendanceDate(record.date)}</span>
                  <span className="mt-1 inline-flex rounded-full border border-white/10 px-2 py-0.5 text-[0.62rem] font-black uppercase tracking-[0.12em] text-white/45">
                    {record.id}
                  </span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="h-8 w-1 rounded-full bg-cyanGlow"/>
                  {record.className}
                </span>
                <span>{record.studentName}</span>
                {isEditing ? (<select value={editForm.status} onChange={(event) => setEditForm((current) => ({ ...current, status: event.target.value }))} className="h-11 rounded-xl border border-white/10 bg-[#211028] px-3 text-xs font-black uppercase text-white outline-none transition focus:border-[#f0b7ff]">
                    <option value="present">Present</option>
                    <option value="absent">Absent</option>
                    <option value="late">Late</option>
                  </select>) : (<AttendanceStatusBadge status={record.status}/>)}
                {isEditing ? (<input value={editForm.remarks} onChange={(event) => setEditForm((current) => ({ ...current, remarks: event.target.value }))} placeholder="Add remark..." className="h-11 rounded-xl border border-white/10 bg-black/10 px-3 text-sm font-semibold italic text-white outline-none transition placeholder:text-white/34 focus:border-[#f0b7ff]"/>) : (<span className="truncate italic text-white/58">{record.remarks || "-"}</span>)}
                <span className="flex items-center gap-2">
                  {isEditing ? (<>
                      <button type="button" onClick={() => void saveEditedRecord(record)} disabled={savingRecordId === record.id} className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-cyanGlow text-ink transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50" aria-label="Save attendance record">
                        <Save size={17}/>
                      </button>
                      <button type="button" onClick={() => setEditingRecordId("")} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-white/62 transition hover:border-white/25 hover:text-white" aria-label="Cancel edit">
                        <X size={17}/>
                      </button>
                    </>) : (<>
                      <button type="button" onClick={() => startEditingRecord(record)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-cyanGlow/25 bg-cyanGlow/[0.06] text-cyanGlow transition hover:-translate-y-0.5 hover:bg-cyanGlow/12" aria-label="Edit attendance record">
                        <Edit3 size={17}/>
                      </button>
                      <button type="button" onClick={() => void onDeleteRecord(record)} className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#ff7aa8]/25 bg-[#ff7aa8]/[0.06] text-[#ffb0c8] transition hover:-translate-y-0.5 hover:bg-[#ff7aa8]/12" aria-label="Delete attendance record">
                        <Trash2 size={17}/>
                      </button>
                    </>)}
                </span>
              </article>);
        })}
          </div>

          {records.length === 0 && (<div className="rounded-xl border border-white/10 bg-white/[0.045] px-6 py-10 text-center text-sm font-black text-white/56">
              No attendance records match the selected filters.
            </div>)}
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-4">
        <button type="button" onClick={onPreviousPage} disabled={currentPage <= 1} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-white/70 transition hover:border-[#f0b7ff]/40 hover:text-[#f0b7ff] disabled:cursor-not-allowed disabled:opacity-35" aria-label="Previous records page">
          <ChevronLeft size={20}/>
        </button>
        <span className="text-sm font-black text-white/84">
          Page {currentPage} of {totalPages}
        </span>
        <button type="button" onClick={onNextPage} disabled={currentPage >= totalPages} className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-white/70 transition hover:border-[#f0b7ff]/40 hover:text-[#f0b7ff] disabled:cursor-not-allowed disabled:opacity-35" aria-label="Next records page">
          <ChevronRight size={20}/>
        </button>
      </div>
    </section>);
}
function AttendanceStatusBadge({ status }) {
    return (<span className={cn("inline-flex w-fit items-center justify-center rounded-full px-3 py-1 text-[0.65rem] font-black uppercase", status === "present" && "bg-cyanGlow/18 text-cyanGlow", status === "absent" && "bg-[#ff7aa8]/18 text-[#ff9fbd]", status === "late" && "bg-[#e234a8]/18 text-[#ff8ee2]")}>
      {getStatusLabel(status)}
    </span>);
}
