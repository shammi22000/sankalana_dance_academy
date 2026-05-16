import { ArrowRight, BadgeCheck, BadgePlus, Bell, Cake, CalendarDays, CheckCircle2, ClipboardCheck, Download, FileText, Flag, Grid2X2, Hourglass, IdCard, ListFilter, Mail, MapPin, Phone, Settings, ShieldCheck, Sparkles, Theater, UserRound, XCircle, } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { getStudentAttendanceRecords, studentAttendanceRecordsCacheKey } from "../services/attendanceService";
import { getStudentEnrolments } from "../services/enrolmentService";
import { getAllTeacherClasses, teacherClassCacheKey } from "../services/teacherClassService";
import { cn } from "../utils/cn";
import { getClassSlot, getDanceStyle, getTeacher, readSubmittedEnrolment, } from "./StudentEnrolmentPage";
const sessionStorageKey = "sankalanaStudentSession";
const dayIndexes = {
    sun: 0,
    sunday: 0,
    mon: 1,
    monday: 1,
    tue: 2,
    tuesday: 2,
    wed: 3,
    wednesday: 3,
    thu: 4,
    thursday: 4,
    fri: 5,
    friday: 5,
    sat: 6,
    saturday: 6,
};
function getStoredStudentSession() {
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
function formatMonthDay(date) {
    return date.toLocaleDateString("en", {
        month: "short",
        day: "numeric",
    });
}
function formatSubmittedDate(value) {
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
function readCachedStudentAttendanceRecords() {
    const storedRecords = localStorage.getItem(studentAttendanceRecordsCacheKey);
    if (!storedRecords) {
        return [];
    }
    try {
        const parsedRecords = JSON.parse(storedRecords);
        return Array.isArray(parsedRecords) ? parsedRecords : [];
    }
    catch {
        localStorage.removeItem(studentAttendanceRecordsCacheKey);
        return [];
    }
}
function readCachedTeacherClasses() {
    const storedClasses = localStorage.getItem(teacherClassCacheKey);
    if (!storedClasses) {
        return [];
    }
    try {
        const parsedClasses = JSON.parse(storedClasses);
        return Array.isArray(parsedClasses) ? parsedClasses.filter((classItem) => classItem.id) : [];
    }
    catch {
        localStorage.removeItem(teacherClassCacheKey);
        return [];
    }
}
function getClassDayIndexes(classItem) {
    const days = Array.isArray(classItem?.days) ? classItem.days : [];
    return Array.from(new Set(days
        .map((day) => dayIndexes[String(day).trim().toLowerCase()])
        .filter((dayIndex) => Number.isInteger(dayIndex))));
}
function countMatchingWeekdaysInMonth(month, allowedDayIndexes) {
    if (!month || allowedDayIndexes.length === 0) {
        return 0;
    }
    const [yearValue, monthValue] = month.split("-").map(Number);
    if (!yearValue || !monthValue) {
        return 0;
    }
    const monthIndex = monthValue - 1;
    let count = 0;
    for (let date = new Date(yearValue, monthIndex, 1); date.getMonth() === monthIndex; date.setDate(date.getDate() + 1)) {
        if (allowedDayIndexes.includes(date.getDay())) {
            count += 1;
        }
    }
    return count;
}
function getScheduledSessionCount(month, classIds, teacherClasses) {
    const uniqueClassIds = Array.from(new Set(classIds.filter(Boolean)));
    return uniqueClassIds.reduce((total, classId) => {
        const classItem = teacherClasses.find((currentClass) => currentClass.id === classId);
        return total + countMatchingWeekdaysInMonth(month, getClassDayIndexes(classItem));
    }, 0);
}
function getEnrolledClassIds(enrolments) {
    const approvedClassIds = enrolments
        .filter((application) => String(application.status).toLowerCase() === "approved")
        .map((application) => application.data?.slotId)
        .filter(Boolean);
    if (approvedClassIds.length > 0) {
        return approvedClassIds;
    }
    return enrolments.map((application) => application.data?.slotId).filter(Boolean);
}
function getAttendanceClassIds(records, enrolments, classFilter = "all") {
    if (classFilter !== "all") {
        return [classFilter];
    }
    const enrolledClassIds = getEnrolledClassIds(enrolments);
    if (enrolledClassIds.length > 0) {
        return enrolledClassIds;
    }
    return Array.from(new Set(records.map((record) => record.classId).filter(Boolean)));
}
function getAttendanceStats(records, options = {}) {
    const present = records.filter((record) => record.status === "present").length;
    const late = records.filter((record) => record.status === "late").length;
    const absent = records.filter((record) => record.status === "absent").length;
    const excused = records.filter((record) => record.status === "excused").length;
    const attended = present + late;
    const countedTotal = present + late + absent;
    const scheduledTotal = getScheduledSessionCount(options.month, options.classIds ?? [], options.teacherClasses ?? []);
    const total = scheduledTotal > 0 ? scheduledTotal : countedTotal;
    const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;
    return {
        total,
        countedTotal,
        scheduledTotal,
        present,
        late,
        attended,
        absent,
        excused,
        percentage: Math.min(100, percentage),
        degrees: Math.round((Math.min(100, percentage) / 100) * 360),
        usesSchedule: scheduledTotal > 0,
    };
}
function getCurrentMonthInputValue() {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
function getAttendanceClassOptions(records, enrolments, teacherClasses) {
    const classOptions = new Map();
    getEnrolledClassIds(enrolments).forEach((classId) => {
        const classItem = teacherClasses.find((currentClass) => currentClass.id === classId);
        classOptions.set(classId, classItem?.className ?? "Enrolled Class");
    });
    records.forEach((record) => {
        if (record.classId && !classOptions.has(record.classId)) {
            classOptions.set(record.classId, record.className);
        }
    });
    return Array.from(classOptions.entries()).filter(([classId]) => classId);
}
function getTeacherNameForAttendance(record, enrolments) {
    const enrolment = enrolments.find((application) => application.data?.slotId === record.classId);
    if (!enrolment?.data) {
        return "Academy Faculty";
    }
    return getTeacher(enrolment.data)?.name ?? "Academy Faculty";
}
function formatAttendanceHistoryDate(value) {
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) {
        return { date: value, day: "" };
    }
    return {
        date: date.toLocaleDateString("en", {
            month: "short",
            day: "numeric",
            year: "numeric",
        }),
        day: date.toLocaleDateString("en", { weekday: "long" }),
    };
}
function downloadAttendanceReport(records, enrolments) {
    const header = ["Date", "Class Name", "Teacher", "Status", "Remarks"];
    const rows = records.map((record) => [
        record.date,
        record.className,
        getTeacherNameForAttendance(record, enrolments),
        getStatusLabel(record.status),
        record.remarks || "-",
    ]);
    const csv = [header, ...rows]
        .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
        .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "student-attendance-report.csv";
    link.click();
    URL.revokeObjectURL(url);
}
function getStatusLabel(status) {
    return status.charAt(0).toUpperCase() + status.slice(1);
}
function getClassForEnrolment(enrolment, teacherClasses) {
    return teacherClasses.find((classItem) => classItem.id === enrolment.data?.slotId);
}
function getDashboardClassTime(value = "") {
    const [hourValue, minuteValue] = value.split(":").map(Number);
    if (!Number.isInteger(hourValue) || !Number.isInteger(minuteValue)) {
        return value;
    }
    const period = hourValue >= 12 ? "PM" : "AM";
    const hour = hourValue % 12 || 12;
    return `${hour}:${String(minuteValue).padStart(2, "0")} ${period}`;
}
function getClassDaysLabel(classItem) {
    const days = Array.isArray(classItem?.days) ? classItem.days.filter(Boolean) : [];
    return days.length > 0 ? days.join(", ") : "Flexible days";
}
function getStudentClassSchedule(enrolment, classItem) {
    if (classItem) {
        const startTime = getDashboardClassTime(classItem.startTime);
        const endTime = getDashboardClassTime(classItem.endTime);
        const timeRange = startTime && endTime ? `${startTime} - ${endTime}` : "Time to be confirmed";
        return `${getClassDaysLabel(classItem)} • ${timeRange}`;
    }
    const selectedSlot = getClassSlot(enrolment.data);
    return selectedSlot ? `${selectedSlot.day} • ${selectedSlot.time}` : "Schedule pending";
}
function getStudentClassName(enrolment, classItem) {
    const selectedStyle = getDanceStyle(enrolment.data);
    const selectedSlot = getClassSlot(enrolment.data);
    return classItem?.className ?? selectedSlot?.className ?? selectedStyle?.name ?? "Selected Dance Class";
}
function getStudentClassTeacher(enrolment, classItem) {
    const selectedTeacher = getTeacher(enrolment.data);
    return classItem?.teacherName ?? selectedTeacher?.name ?? "Academy Faculty";
}
function getStudentClassStyle(enrolment, classItem) {
    const selectedStyle = getDanceStyle(enrolment.data);
    return classItem?.danceStyle ?? selectedStyle?.name ?? "Dance Style";
}
function getStudentClassStudio(enrolment, classItem) {
    const selectedSlot = getClassSlot(enrolment.data);
    return classItem?.studio ?? selectedSlot?.studio ?? "Studio pending";
}
function sortStudentEnrolments(first, second) {
    const statusOrder = {
        Approved: 0,
        "Pending Review": 1,
        Rejected: 2,
    };
    const firstStatus = statusOrder[first.status] ?? 3;
    const secondStatus = statusOrder[second.status] ?? 3;
    if (firstStatus !== secondStatus) {
        return firstStatus - secondStatus;
    }
    return new Date(second.submittedAt).getTime() - new Date(first.submittedAt).getTime();
}
function getInitials(name = "") {
    const initials = name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");
    return initials || "ST";
}
function getStudentAge(dateOfBirth) {
    const birthDate = new Date(dateOfBirth);
    if (Number.isNaN(birthDate.getTime())) {
        return null;
    }
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthOffset = today.getMonth() - birthDate.getMonth();
    if (monthOffset < 0 || (monthOffset === 0 && today.getDate() < birthDate.getDate())) {
        age -= 1;
    }
    return Math.max(age, 0);
}
function formatProfileDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "Not set";
    }
    return date.toLocaleDateString("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}
function formatProfileDateTime(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "Not set";
    }
    return date.toLocaleDateString("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}
function formatProfileLabel(value) {
    if (!value) {
        return "Not set";
    }
    return String(value).charAt(0).toUpperCase() + String(value).slice(1);
}
export function StudentDashboardPage() {
    const navigate = useNavigate();
    const authentication = getStoredStudentSession();
    const [activeSection, setActiveSection] = useState("Dashboard");
    const [submittedEnrolment, setSubmittedEnrolment] = useState(() => readSubmittedEnrolment());
    const [studentEnrolments, setStudentEnrolments] = useState(() => {
        const currentEnrolment = readSubmittedEnrolment();
        return currentEnrolment ? [currentEnrolment] : [];
    });
    const [attendanceRecords, setAttendanceRecords] = useState(() => readCachedStudentAttendanceRecords());
    const [teacherClasses, setTeacherClasses] = useState(() => readCachedTeacherClasses());
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
                    setStudentEnrolments(applications);
                }
            }
            catch {
                if (isMounted) {
                    const cachedEnrolment = readSubmittedEnrolment();
                    setSubmittedEnrolment(cachedEnrolment);
                    setStudentEnrolments(cachedEnrolment ? [cachedEnrolment] : []);
                }
            }
        }
        void loadEnrolments();
        return () => {
            isMounted = false;
        };
    }, [authentication?.student.id]);
    useEffect(() => {
        if (!authentication) {
            return;
        }
        let isMounted = true;
        async function loadTeacherClasses() {
            try {
                const classes = await getAllTeacherClasses();
                if (isMounted) {
                    setTeacherClasses(classes);
                }
            }
            catch {
                if (isMounted) {
                    setTeacherClasses(readCachedTeacherClasses());
                }
            }
        }
        void loadTeacherClasses();
        return () => {
            isMounted = false;
        };
    }, [authentication?.student.id]);
    useEffect(() => {
        if (!authentication) {
            return;
        }
        let isMounted = true;
        async function loadAttendance() {
            try {
                const records = await getStudentAttendanceRecords();
                if (isMounted) {
                    setAttendanceRecords(records);
                }
            }
            catch {
                if (isMounted) {
                    setAttendanceRecords(readCachedStudentAttendanceRecords());
                }
            }
        }
        void loadAttendance();
        return () => {
            isMounted = false;
        };
    }, [authentication?.student.id]);
    if (!authentication) {
        return <Navigate to="/student-login" replace/>;
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
    const currentMonth = getCurrentMonthInputValue();
    const dashboardClassIds = getAttendanceClassIds(attendanceRecords, studentEnrolments);
    const dashboardAttendanceRecords = attendanceRecords.filter((record) => {
        const classMatches = dashboardClassIds.length === 0 || dashboardClassIds.includes(record.classId);
        return classMatches && record.date.startsWith(currentMonth);
    });
    const attendanceStats = getAttendanceStats(dashboardAttendanceRecords, {
        month: currentMonth,
        classIds: dashboardClassIds,
        teacherClasses,
    });
    expectedUpdate.setDate(expectedUpdate.getDate() + 6);
    const sidebarItems = [
        { label: "Dashboard", icon: Grid2X2, section: "Dashboard" },
        { label: "My Profile", icon: UserRound, section: "My Profile" },
        { label: "My Attendance", icon: ClipboardCheck, section: "My Attendance" },
        { label: "Enrolment", icon: BadgePlus, to: "/student/enrolment" },
        { label: "My Classes", icon: Sparkles, section: "My Classes" },
    ];
    return (<div className="min-h-screen bg-black text-white">
      <PageHeader ctaLabel="Logout" onCtaClick={handleLogout}/>

      <div className="grid min-h-[calc(100svh-5rem)] lg:grid-cols-[19rem_1fr]">
        <aside className="relative z-20 border-b border-white/10 bg-[#120415]/96 px-4 py-5 shadow-[18px_0_70px_rgba(134,20,190,0.12)] lg:border-b-0 lg:border-r">
          <nav className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1" aria-label="Student dashboard">
            {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (<button key={item.label} type="button" onClick={() => {
                    if (item.to) {
                        navigate(item.to);
                        return;
                    }
                    if (item.section) {
                        setActiveSection(item.section);
                    }
                }} className={`flex min-h-14 items-center gap-4 rounded-2xl px-5 text-left text-sm font-black transition ${activeSection === item.section
                    ? "bg-gradient-to-r from-orchid to-[#bb26ff] text-white shadow-[0_18px_45px_rgba(217,28,255,0.34)]"
                    : "text-white/[0.58] hover:bg-white/[0.08] hover:text-white"}`}>
                  <Icon size={23}/>
                  {item.label}
                </button>);
        })}
          </nav>
        </aside>

        <main className="relative overflow-hidden px-5 py-8 sm:px-8 lg:px-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_18%,rgba(188,38,255,0.23),transparent_28rem),radial-gradient(circle_at_84%_85%,rgba(41,216,255,0.14),transparent_24rem)]"/>
          <div className="absolute inset-0 bg-gradient-to-br from-[#1b071f]/78 via-black to-[#020404]"/>

          {activeSection === "My Profile" ? (<MyProfileSection student={student} enrolments={studentEnrolments} teacherClasses={teacherClasses} attendanceStats={attendanceStats} onStartEnrolment={() => navigate("/student/enrolment")} onViewProgress={() => navigate("/student/enrolment/status")} onViewAttendance={() => setActiveSection("My Attendance")} onViewClasses={() => setActiveSection("My Classes")}/>) : activeSection === "My Attendance" ? (<MyAttendanceSection records={attendanceRecords} enrolments={studentEnrolments} teacherClasses={teacherClasses}/>) : activeSection === "My Classes" ? (<MyClassesSection enrolments={studentEnrolments} teacherClasses={teacherClasses} attendanceRecords={attendanceRecords} onStartEnrolment={() => navigate("/student/enrolment")}/>) : (<section className="relative z-10 mx-auto max-w-7xl">
            <div className="flex items-start justify-between gap-6">
              <div>
                <h1 className="text-5xl font-black leading-none text-[#f4e7fb] sm:text-6xl">
                  Welcome back, {firstName}!
                </h1>
                <p className="mt-4 text-lg font-semibold text-white/[0.62]">
                  You're making great progress this season.
                </p>
              </div>

              <button type="button" className="relative inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.08] text-white/80 shadow-[0_12px_35px_rgba(0,0,0,0.28)]" aria-label="Notifications">
                <Bell size={23}/>
                <span className="absolute right-4 top-3 h-2.5 w-2.5 rounded-full bg-cyanGlow"/>
              </button>
            </div>

            <div className="mt-12 grid gap-7 xl:grid-cols-[23rem_1fr]">
              <article className="rounded-[1.75rem] border border-white/[0.12] bg-white/[0.055] p-8 shadow-[0_24px_90px_rgba(0,0,0,0.26)] backdrop-blur-xl">
                <div className="mx-auto flex aspect-square max-w-52 items-center justify-center rounded-full p-3" style={{
            background: `conic-gradient(#c026ff 0deg, #c026ff ${attendanceStats.degrees}deg, rgba(255,255,255,0.11) ${attendanceStats.degrees}deg, rgba(255,255,255,0.11) 360deg)`,
        }}>
                  <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-[#17061d]">
                    <p className="text-5xl font-black text-[#f0c6ff]">{attendanceStats.percentage}%</p>
                    <p className="mt-1 text-sm font-black text-white/[0.62]">Attendance</p>
                  </div>
                </div>
                <p className="mx-auto mt-9 max-w-56 text-center text-base font-semibold leading-7 text-white/[0.62]">
                  {attendanceStats.total > 0
            ? `You've attended ${attendanceStats.attended} out of ${attendanceStats.total} ${attendanceStats.usesSchedule ? "scheduled class days this month" : "counted sessions"}. ${attendanceStats.absent > 0 ? `${attendanceStats.absent} absence${attendanceStats.absent === 1 ? "" : "s"} recorded.` : "No absences recorded."}`
            : "Attendance percentage will update after your class schedule or attendance records are available."}
                </p>
              </article>

              <EnrolmentProgressCard enrolment={submittedEnrolment} fallbackStatus={approvalStatusLabel} fallbackSubmitted={formatMonthDay(createdAt)} fallbackExpectedUpdate={formatMonthDay(expectedUpdate)} onStart={() => navigate("/student/enrolment")} onViewProgress={() => navigate("/student/enrolment/status")}/>
            </div>

          </section>)}
        </main>
      </div>
    </div>);
}
function MyProfileSection({ student, enrolments, teacherClasses, attendanceStats, onStartEnrolment, onViewProgress, onViewAttendance, onViewClasses }) {
    const sortedEnrolments = [...enrolments].sort(sortStudentEnrolments);
    const primaryEnrolment = sortedEnrolments[0] ?? null;
    const approvedEnrolments = sortedEnrolments.filter((enrolment) => enrolment.status === "Approved");
    const pendingEnrolments = sortedEnrolments.filter((enrolment) => enrolment.status === "Pending Review");
    const rejectedEnrolments = sortedEnrolments.filter((enrolment) => enrolment.status === "Rejected");
    const classItem = primaryEnrolment ? getClassForEnrolment(primaryEnrolment, teacherClasses) : null;
    const personal = primaryEnrolment?.data?.personal ?? {};
    const guardian = primaryEnrolment?.data?.guardian ?? {};
    const age = getStudentAge(student.dateOfBirth);
    const approvalStatus = formatProfileLabel(student.approvalStatus);
    const role = formatProfileLabel(student.accountRole);
    const profileAddress = [personal.address, personal.city].filter(Boolean).join(", ") || "Not provided";
    const profileStats = [
        { label: "Attendance", value: `${attendanceStats.percentage}%` },
        { label: "Active Classes", value: approvedEnrolments.length },
        { label: "Requests", value: sortedEnrolments.length },
        { label: "Joined", value: formatProfileDate(student.createdAt) },
    ];
    return (<section className="relative z-10 mx-auto max-w-7xl pb-10">
      <div className="flex flex-col gap-5 border-b border-white/10 pb-7 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-cyanGlow">Student Account</p>
          <h1 className="mt-3 text-4xl font-black leading-none text-[#f0b7ff] sm:text-5xl">My Profile</h1>
          <p className="mt-3 max-w-3xl text-lg font-semibold leading-8 text-white/62">
            Your personal details, account status, enrolment information, and class progress in one place.
          </p>
        </div>

        <StatusPill status={approvalStatus}/>
      </div>

      <div className="mt-10 grid gap-7 xl:grid-cols-[24rem_1fr]">
        <article className="rounded-[1.75rem] border border-white/[0.12] bg-white/[0.055] p-8 text-center shadow-[0_24px_90px_rgba(0,0,0,0.26)] backdrop-blur-xl">
          <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full border-4 border-[#f0b7ff] bg-gradient-to-br from-[#f0b7ff] via-[#c026ff] to-cyanGlow text-4xl font-black text-[#17061d] shadow-[0_0_44px_rgba(240,183,255,0.34)]">
            {getInitials(student.fullName)}
          </div>
          <h2 className="mt-7 text-3xl font-black leading-tight text-[#f4e7fb]">{student.fullName}</h2>
          <p className="mt-2 break-words text-sm font-black uppercase tracking-[0.16em] text-[#f0b7ff]">@{student.username}</p>
          <p className="mx-auto mt-4 max-w-64 break-words text-sm font-semibold leading-6 text-white/58">{student.email}</p>

          <div className="mt-8 grid grid-cols-2 gap-3">
            {profileStats.map((stat) => (<ProfileMiniStat key={stat.label} label={stat.label} value={stat.value}/>))}
          </div>

          <div className="mt-8 grid gap-3">
            <button type="button" onClick={onViewAttendance} className="inline-flex min-h-12 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#e8a3ff] via-[#c026ff] to-[#e026b4] px-5 text-sm font-black text-white shadow-[0_18px_45px_rgba(217,28,255,0.28)] transition hover:-translate-y-0.5">
              <ClipboardCheck size={18}/>
              View Attendance
            </button>
            <button type="button" onClick={onViewClasses} className="inline-flex min-h-12 items-center justify-center gap-3 rounded-2xl border border-white/10 px-5 text-sm font-black text-white/72 transition hover:border-cyanGlow/40 hover:text-white">
              <Sparkles size={18}/>
              My Classes
            </button>
          </div>
        </article>

        <div className="grid gap-7">
          <ProfilePanel icon={UserRound} title="Personal Details">
            <div className="grid gap-4 md:grid-cols-2">
              <ProfileInfoItem icon={UserRound} label="Full Name" value={student.fullName}/>
              <ProfileInfoItem icon={IdCard} label="Username" value={student.username}/>
              <ProfileInfoItem icon={Mail} label="Email Address" value={student.email}/>
              <ProfileInfoItem icon={Phone} label="Phone Number" value={student.phone}/>
              <ProfileInfoItem icon={UserRound} label="Gender" value={student.gender}/>
              <ProfileInfoItem icon={Cake} label="Age" value={age === null ? "Not set" : `${age} years old`}/>
              <ProfileInfoItem icon={CalendarDays} label="Date of Birth" value={formatProfileDate(student.dateOfBirth)}/>
              <ProfileInfoItem icon={ShieldCheck} label="Account Role" value={role}/>
              <ProfileInfoItem icon={BadgeCheck} label="Approval Status" value={approvalStatus}/>
              <ProfileInfoItem icon={CalendarDays} label="Registered At" value={formatProfileDateTime(student.createdAt)}/>
              <ProfileInfoItem icon={MapPin} label="Address" value={profileAddress} wide/>
            </div>
          </ProfilePanel>

          <ProfilePanel icon={Sparkles} title="Learning Profile">
            {primaryEnrolment ? (<>
                <div className="grid gap-4 md:grid-cols-2">
                  <ProfileInfoItem icon={Sparkles} label="Current Class" value={getStudentClassName(primaryEnrolment, classItem)}/>
                  <ProfileInfoItem icon={UserRound} label="Teacher" value={getStudentClassTeacher(primaryEnrolment, classItem)}/>
                  <ProfileInfoItem icon={CalendarDays} label="Schedule" value={getStudentClassSchedule(primaryEnrolment, classItem)}/>
                  <ProfileInfoItem icon={Theater} label="Studio" value={getStudentClassStudio(primaryEnrolment, classItem)}/>
                  <ProfileInfoItem icon={FileText} label="Application ID" value={primaryEnrolment.applicationId}/>
                  <ProfileInfoItem icon={BadgeCheck} label="Enrolment Status" value={primaryEnrolment.status}/>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <ProfileMiniStat label="Approved" value={approvedEnrolments.length}/>
                  <ProfileMiniStat label="Pending" value={pendingEnrolments.length}/>
                  <ProfileMiniStat label="Rejected" value={rejectedEnrolments.length}/>
                </div>

                <button type="button" onClick={onViewProgress} className="mt-6 inline-flex min-h-12 items-center justify-center gap-3 rounded-2xl border border-white/10 px-6 text-sm font-black text-[#f0b7ff] transition hover:border-[#f0b7ff]/45 hover:text-white">
                  <FileText size={18}/>
                  View Enrolment Progress
                  <ArrowRight size={18}/>
                </button>
              </>) : (<div className="rounded-[1.35rem] border border-[#f0b7ff]/20 bg-[#f0b7ff]/10 p-6">
                <h3 className="text-2xl font-black text-[#f4e7fb]">No enrolment yet</h3>
                <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-white/58">
                  Start an enrolment to connect your profile with a dance style, class time, teacher, and guardian details.
                </p>
                <button type="button" onClick={onStartEnrolment} className="mt-6 inline-flex min-h-12 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#e8a3ff] via-[#c026ff] to-[#e026b4] px-6 text-sm font-black text-white shadow-[0_18px_45px_rgba(217,28,255,0.28)]">
                  <BadgePlus size={18}/>
                  Start Enrolment
                </button>
              </div>)}
          </ProfilePanel>

          <ProfilePanel icon={Phone} title="Guardian & Emergency">
            <div className="grid gap-4 md:grid-cols-2">
              <ProfileInfoItem icon={UserRound} label="Guardian Name" value={guardian.fullName || "Not provided"}/>
              <ProfileInfoItem icon={BadgeCheck} label="Relationship" value={guardian.relationship || "Not provided"}/>
              <ProfileInfoItem icon={Phone} label="Guardian Phone" value={guardian.phone || "Not provided"}/>
              <ProfileInfoItem icon={Mail} label="Guardian Email" value={guardian.email || "Not provided"}/>
              <ProfileInfoItem icon={Phone} label="Emergency Contact" value={personal.emergencyContact || "Not provided"}/>
              <ProfileInfoItem icon={MapPin} label="Guardian Address" value={guardian.address || "Not provided"}/>
            </div>
          </ProfilePanel>
        </div>
      </div>
    </section>);
}
function ProfilePanel({ icon: Icon, title, children }) {
    return (<article className="rounded-[1.75rem] border border-white/[0.12] bg-white/[0.055] p-6 shadow-[0_24px_90px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:p-8">
      <div className="flex items-center gap-4">
        <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orchid/25 text-[#f0b7ff]">
          <Icon size={24}/>
        </span>
        <h2 className="text-2xl font-black leading-tight text-[#f4e7fb] sm:text-3xl">{title}</h2>
      </div>
      <div className="mt-7">
        {children}
      </div>
    </article>);
}
function ProfileInfoItem({ icon: Icon, label, value, wide = false }) {
    return (<div className={cn("rounded-2xl border border-white/10 bg-[#0b0310]/72 p-4", wide && "md:col-span-2")}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyanGlow/12 text-cyanGlow">
          <Icon size={19}/>
        </span>
        <span className="min-w-0">
          <span className="block text-[0.68rem] font-black uppercase tracking-[0.16em] text-white/42">{label}</span>
          <span className="mt-1 block break-words text-sm font-black leading-5 text-white/82">{value}</span>
        </span>
      </div>
    </div>);
}
function ProfileMiniStat({ label, value }) {
    return (<div className="rounded-2xl border border-white/10 bg-white/[0.065] p-4 text-left">
      <p className="text-xs font-black uppercase tracking-[0.13em] text-white/42">{label}</p>
      <p className="mt-2 break-words text-lg font-black leading-tight text-[#f4e7fb]">{value}</p>
    </div>);
}
function MyClassesSection({ enrolments, teacherClasses, attendanceRecords, onStartEnrolment }) {
    const currentMonth = getCurrentMonthInputValue();
    const sortedEnrolments = [...enrolments].sort(sortStudentEnrolments);
    const approvedEnrolments = sortedEnrolments.filter((enrolment) => enrolment.status === "Approved");
    const pendingEnrolments = sortedEnrolments.filter((enrolment) => enrolment.status === "Pending Review");
    const rejectedEnrolments = sortedEnrolments.filter((enrolment) => enrolment.status === "Rejected");
    const approvedClassIds = approvedEnrolments.map((enrolment) => enrolment.data?.slotId).filter(Boolean);
    const approvedMonthRecords = attendanceRecords.filter((record) => record.date.startsWith(currentMonth) && approvedClassIds.includes(record.classId));
    const monthlyStats = getAttendanceStats(approvedMonthRecords, {
        month: currentMonth,
        classIds: approvedClassIds,
        teacherClasses,
    });
    return (<section className="relative z-10 mx-auto max-w-7xl pb-10">
      <div className="flex flex-col gap-5 border-b border-white/10 pb-7 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-cyanGlow">Learning Overview</p>
          <h1 className="mt-3 text-4xl font-black leading-none text-[#f0b7ff] sm:text-5xl">My Classes</h1>
          <p className="mt-3 max-w-3xl text-lg font-semibold leading-8 text-white/62">
            View your enrolled classes, teacher details, class schedule, and monthly attendance progress.
          </p>
        </div>

        <button type="button" onClick={onStartEnrolment} className="inline-flex min-h-12 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#e8a3ff] via-[#c026ff] to-[#e026b4] px-6 text-sm font-black text-white shadow-[0_18px_45px_rgba(217,28,255,0.32)] transition hover:-translate-y-0.5">
          <BadgePlus size={19}/>
          Add Enrolment
        </button>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <ClassOverviewStat label="Active Classes" value={approvedEnrolments.length} detail="Teacher approved" tone="cyan"/>
        <ClassOverviewStat label="Pending Requests" value={pendingEnrolments.length} detail="Waiting for decision" tone="orchid"/>
        <ClassOverviewStat label="Rejected Requests" value={rejectedEnrolments.length} detail="Needs attention" tone="rose"/>
        <ClassOverviewStat label="This Month" value={`${monthlyStats.percentage}%`} detail={`${monthlyStats.attended}/${monthlyStats.total || 0} scheduled attended`} tone="pink"/>
      </div>

      {sortedEnrolments.length === 0 ? (<div className="mt-10 rounded-[1.75rem] border border-white/10 bg-white/[0.055] p-8 text-center shadow-[0_24px_90px_rgba(0,0,0,0.26)] backdrop-blur-xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#f0b7ff]/35 bg-[#f0b7ff]/12 text-[#f0b7ff]">
            <Sparkles size={34}/>
          </div>
          <h2 className="mt-6 text-3xl font-black text-[#f4e7fb]">No classes yet</h2>
          <p className="mx-auto mt-3 max-w-2xl text-base font-semibold leading-7 text-white/58">
            Start an enrolment to choose a dance style, select a teacher-created class, and track your progress here after approval.
          </p>
          <button type="button" onClick={onStartEnrolment} className="mt-7 inline-flex min-h-12 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#e8a3ff] via-[#c026ff] to-[#e026b4] px-7 text-sm font-black text-white shadow-[0_18px_45px_rgba(217,28,255,0.32)]">
            Start Enrolment
            <ArrowRight size={18}/>
          </button>
        </div>) : (<div className="mt-10 grid gap-6 xl:grid-cols-2">
          {sortedEnrolments.map((enrolment) => (<StudentClassCard key={enrolment.applicationId} enrolment={enrolment} classItem={getClassForEnrolment(enrolment, teacherClasses)} attendanceRecords={attendanceRecords} teacherClasses={teacherClasses} currentMonth={currentMonth}/>))}
        </div>)}
    </section>);
}
function ClassOverviewStat({ label, value, detail, tone }) {
    const toneClasses = {
        cyan: "text-cyanGlow",
        orchid: "text-[#f0b7ff]",
        rose: "text-[#ffb0c8]",
        pink: "text-[#ff91d8]",
    }[tone];
    return (<article className="rounded-[1.35rem] border border-white/10 bg-white/[0.045] p-6 shadow-[0_22px_75px_rgba(0,0,0,0.24)]">
      <p className={cn("text-4xl font-black leading-none", toneClasses)}>{value}</p>
      <p className="mt-4 text-sm font-black uppercase tracking-[0.18em] text-white/62">{label}</p>
      <p className="mt-2 text-sm font-semibold text-white/45">{detail}</p>
    </article>);
}
function StudentClassCard({ enrolment, classItem, attendanceRecords, teacherClasses, currentMonth }) {
    const classId = enrolment.data?.slotId;
    const classRecords = attendanceRecords.filter((record) => record.classId === classId && record.date.startsWith(currentMonth));
    const stats = getAttendanceStats(classRecords, {
        month: currentMonth,
        classIds: classId ? [classId] : [],
        teacherClasses,
    });
    const isApproved = enrolment.status === "Approved";
    const isRejected = enrolment.status === "Rejected";
    const attendanceSummary = stats.total > 0 ? `${stats.attended}/${stats.total} attended this month` : "Attendance starts after your first marked class";
    return (<article className={cn("overflow-hidden rounded-[1.65rem] border bg-[#150817]/90 shadow-[0_24px_90px_rgba(0,0,0,0.28)]", isApproved
            ? "border-cyanGlow/25"
            : isRejected
                ? "border-[#ff7aa8]/25"
                : "border-[#f0b7ff]/20")}>
      <div className="relative p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(217,28,255,0.18),transparent_20rem),radial-gradient(circle_at_100%_100%,rgba(41,216,255,0.13),transparent_18rem)]"/>
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.26em] text-cyanGlow">{getStudentClassStyle(enrolment, classItem)}</p>
            <h2 className="mt-3 text-3xl font-black leading-tight text-[#f4e7fb]">{getStudentClassName(enrolment, classItem)}</h2>
            <p className="mt-2 text-sm font-black text-white/50">{classItem?.classLevel ?? getClassSlot(enrolment.data)?.level ?? "Level pending"}</p>
          </div>
          <StatusPill status={enrolment.status}/>
        </div>

        <div className="relative mt-6 grid gap-3 md:grid-cols-2">
          <ClassInfoItem icon={CalendarDays} label="Schedule" value={getStudentClassSchedule(enrolment, classItem)}/>
          <ClassInfoItem icon={UserRound} label="Teacher" value={getStudentClassTeacher(enrolment, classItem)}/>
          <ClassInfoItem icon={Theater} label="Studio" value={getStudentClassStudio(enrolment, classItem)}/>
          <ClassInfoItem icon={FileText} label="Application" value={`${enrolment.applicationId} • ${formatSubmittedDate(enrolment.submittedAt)}`}/>
        </div>

        {isApproved ? (<div className="relative mt-6 rounded-2xl border border-white/10 bg-black/24 p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-white/45">Monthly Attendance</p>
                <p className="mt-2 text-sm font-semibold text-white/62">{attendanceSummary}</p>
              </div>
              <p className="text-3xl font-black text-cyanGlow">{stats.percentage}%</p>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-cyanGlow via-[#c026ff] to-[#e026b4]" style={{ width: `${stats.percentage}%` }}/>
            </div>
          </div>) : (<div className={cn("relative mt-6 rounded-2xl border p-5", isRejected
                ? "border-[#ff7aa8]/20 bg-[#ff7aa8]/10"
                : "border-[#f0b7ff]/20 bg-[#f0b7ff]/10")}>
            <p className="text-sm font-black text-[#f4e7fb]">
              {isRejected ? "This enrolment was rejected." : "This enrolment is waiting for teacher approval."}
            </p>
            <p className="mt-2 text-sm font-semibold leading-6 text-white/56">
              {isRejected
                ? "Open progress details to review the decision and submit another enrolment when ready."
                : "Your class will become active here once the selected teacher approves the request."}
            </p>
          </div>)}
      </div>
    </article>);
}
function ClassInfoItem({ icon: Icon, label, value }) {
    return (<div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyanGlow/12 text-cyanGlow">
          <Icon size={18}/>
        </span>
        <span>
          <span className="block text-[0.68rem] font-black uppercase tracking-[0.16em] text-white/42">{label}</span>
          <span className="mt-1 block text-sm font-black leading-5 text-white/78">{value}</span>
        </span>
      </div>
    </div>);
}
function MyAttendanceSection({ records, enrolments, teacherClasses }) {
    const [classFilter, setClassFilter] = useState("all");
    const [monthFilter, setMonthFilter] = useState(getCurrentMonthInputValue());
    const [appliedFilters, setAppliedFilters] = useState({
        classId: "all",
        month: getCurrentMonthInputValue(),
    });
    const classOptions = getAttendanceClassOptions(records, enrolments, teacherClasses);
    const selectedClassIds = getAttendanceClassIds(records, enrolments, appliedFilters.classId);
    const filteredRecords = records.filter((record) => {
        const classMatches = appliedFilters.classId === "all"
            ? selectedClassIds.length === 0 || selectedClassIds.includes(record.classId)
            : record.classId === appliedFilters.classId;
        const monthMatches = !appliedFilters.month || record.date.startsWith(appliedFilters.month);
        return classMatches && monthMatches;
    });
    const stats = getAttendanceStats(filteredRecords, {
        month: appliedFilters.month,
        classIds: selectedClassIds,
        teacherClasses,
    });
    function handleApplyFilters() {
        setAppliedFilters({
            classId: classFilter,
            month: monthFilter,
        });
    }
    return (<section className="relative z-10 mx-auto max-w-7xl pb-10">
      <div className="flex flex-col gap-5 border-b border-white/10 pb-7 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-4xl font-black leading-none text-[#f0b7ff] sm:text-5xl">My Attendance</h1>
          <p className="mt-3 text-lg font-semibold text-white/62">
            Track your progress and studio participation records.
          </p>
        </div>
        <div className="flex items-center gap-4 text-white/72">
          <Bell size={22}/>
          <Settings size={23}/>
        </div>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-[15rem_14rem_auto] md:items-end">
        <label className="block">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-white/68">Select Class</span>
          <select value={classFilter} onChange={(event) => setClassFilter(event.target.value)} className="mt-3 h-14 w-full rounded-xl border border-white/10 bg-[#231026] px-4 text-base font-semibold text-white outline-none focus:border-[#f0b7ff]">
            <option value="all">All Classes</option>
            {classOptions.map(([classId, className]) => (<option key={classId} value={classId}>
                {className}
              </option>))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-white/68">Month</span>
          <input type="month" value={monthFilter} onChange={(event) => setMonthFilter(event.target.value)} className="mt-3 h-14 w-full rounded-xl border border-white/10 bg-[#231026] px-4 text-base font-semibold text-white outline-none [color-scheme:dark] focus:border-[#f0b7ff]"/>
        </label>

        <button type="button" onClick={handleApplyFilters} className="inline-flex min-h-14 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#bb26ff] to-[#d91cff] px-7 text-base font-black text-white shadow-[0_18px_45px_rgba(187,38,255,0.3)] transition hover:-translate-y-0.5">
          <ListFilter size={21}/>
          Apply Filters
        </button>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1fr_1fr]">
        <AttendanceSummaryCard label="Present" value={stats.present} tone="present"/>
        <AttendanceSummaryCard label="Absent" value={stats.absent} tone="absent"/>
        <AttendanceSummaryCard label="Late" value={stats.late} tone="late"/>
        <AttendanceSummaryCard label="Scheduled" value={stats.total} tone="scheduled"/>
        <article className="rounded-[1.35rem] border border-white/10 bg-white/[0.045] p-6 shadow-[0_22px_75px_rgba(0,0,0,0.24)]">
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full p-2" style={{
            background: `conic-gradient(#bb26ff 0deg, #bb26ff ${stats.degrees}deg, rgba(255,255,255,0.1) ${stats.degrees}deg, rgba(255,255,255,0.1) 360deg)`,
        }}>
            <div className="flex h-full w-full items-center justify-center rounded-full bg-[#17061d]">
              <span className="text-2xl font-black text-[#f0b7ff]">{stats.percentage}%</span>
            </div>
          </div>
          <p className="mt-5 text-center text-sm font-black uppercase tracking-[0.18em] text-white/62">Attendance Rate</p>
        </article>
      </div>
      <p className="mt-4 text-sm font-semibold text-white/50">
        Attendance Percentage = ((Present + Late) / Scheduled class days in selected month) x 100
      </p>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-semibold text-white">Class History</h2>
        <button type="button" onClick={() => downloadAttendanceReport(filteredRecords, enrolments)} disabled={filteredRecords.length === 0} className="inline-flex min-h-11 items-center justify-center gap-3 rounded-full border border-white/10 px-5 text-xs font-black uppercase tracking-[0.22em] text-[#f0b7ff] transition hover:border-[#f0b7ff]/45 hover:text-white disabled:cursor-not-allowed disabled:opacity-45">
          <Download size={17}/>
          Download Report
        </button>
      </div>

      <div className="mt-5 overflow-x-auto rounded-[1.35rem] border border-white/10 bg-[#17091d]/88 shadow-[0_24px_90px_rgba(0,0,0,0.28)]">
        <div className="min-w-[58rem]">
          <div className="grid grid-cols-[10rem_16rem_14rem_9rem_1fr] gap-4 bg-white/[0.07] px-6 py-5 text-xs font-black uppercase tracking-[0.18em] text-white/64">
            <span>Date</span>
            <span>Class Name</span>
            <span>Teacher</span>
            <span>Status</span>
            <span>Remarks</span>
          </div>

          <div className="divide-y divide-white/10">
            {filteredRecords.map((record) => {
        const formattedDate = formatAttendanceHistoryDate(record.date);
        return (<article key={record.id} className="grid min-h-20 grid-cols-[10rem_16rem_14rem_9rem_1fr] items-center gap-4 px-6 py-4 text-sm font-black text-white/78">
                  <span>
                    <span className="block text-[#f4e7fb]">{formattedDate.date}</span>
                    <span className="mt-1 block text-xs font-semibold text-white/52">{formattedDate.day}</span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className={cn("h-9 w-1 rounded-full", record.status === "present" && "bg-[#bb26ff]", record.status === "late" && "bg-cyanGlow", record.status === "absent" && "bg-[#f6a89c]", record.status === "excused" && "bg-[#0f8f9d]")}/>
                    {record.className}
                  </span>
                  <span className="text-white/62">{getTeacherNameForAttendance(record, enrolments)}</span>
                  <AttendanceHistoryBadge status={record.status}/>
                  <span className="truncate italic text-white/58">{record.remarks || "-"}</span>
                </article>);
    })}
          </div>

          {filteredRecords.length === 0 && (<div className="px-6 py-12 text-center">
              <ClipboardCheck className="mx-auto text-[#f0b7ff]" size={38}/>
              <h3 className="mt-4 text-2xl font-black text-white">No attendance records found</h3>
              <p className="mt-2 text-sm font-semibold text-white/56">
                Change the class or month filter after your teacher marks attendance.
              </p>
            </div>)}
        </div>
      </div>
    </section>);
}
function AttendanceSummaryCard({ label, value, tone }) {
    const toneClasses = {
        present: { text: "text-[#f0b7ff]", bar: "bg-[#f0b7ff]/24" },
        absent: { text: "text-[#f6a89c]", bar: "bg-[#f6a89c]/22" },
        late: { text: "text-[#ff91c9]", bar: "bg-[#ff91c9]/22" },
        scheduled: { text: "text-cyanGlow", bar: "bg-cyanGlow/22" },
    }[tone];
    return (<article className="rounded-[1.35rem] border border-white/10 bg-white/[0.045] p-7 text-center shadow-[0_22px_75px_rgba(0,0,0,0.24)]">
      <p className={cn("text-5xl font-light leading-none", toneClasses.text)}>{value}</p>
      <p className="mt-4 text-sm font-black uppercase tracking-[0.2em] text-white/58">{label}</p>
      <span className={cn("mx-auto mt-6 block h-1 w-14 rounded-full", toneClasses.bar)}/>
    </article>);
}
function AttendanceHistoryBadge({ status }) {
    return (<span className={cn("inline-flex w-fit items-center justify-center rounded-full border px-4 py-1.5 text-[0.68rem] font-black uppercase", status === "present" && "border-emerald-300/25 bg-emerald-300/12 text-emerald-300", status === "late" && "border-[#ff7ed3]/25 bg-[#ff7ed3]/12 text-[#ff9edc]", status === "absent" && "border-[#ff7a7a]/25 bg-[#ff4f5e]/12 text-[#ffb0b0]", status === "excused" && "border-cyanGlow/25 bg-cyanGlow/12 text-cyanGlow")}>
      {getStatusLabel(status)}
    </span>);
}
function EnrolmentProgressCard({ enrolment, fallbackStatus, fallbackSubmitted, fallbackExpectedUpdate, onStart, onViewProgress, }) {
    if (!enrolment) {
        return (<article className="rounded-[1.75rem] border border-white/[0.12] bg-white/[0.055] p-8 shadow-[0_24px_90px_rgba(0,0,0,0.26)] backdrop-blur-xl">
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
            <span className="h-2.5 w-2.5 rounded-full bg-cyanGlow"/>
            {fallbackStatus}
          </span>
        </div>

        <div className="mt-9 grid gap-4 md:grid-cols-3">
          <DashboardStat label="Registered" value={fallbackSubmitted}/>
          <DashboardStat label="Expected Update" value={fallbackExpectedUpdate}/>
          <DashboardStat label="Enrolment" value="Not Started"/>
        </div>

        <button type="button" onClick={onStart} className="mt-8 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#e8a3ff] via-[#c026ff] to-[#e026b4] text-lg font-black text-white shadow-[0_18px_45px_rgba(217,28,255,0.34)] transition hover:-translate-y-0.5">
          <BadgePlus size={21}/>
          Start Enrolment
        </button>
      </article>);
    }
    const selectedStyle = getDanceStyle(enrolment.data);
    const selectedSlot = getClassSlot(enrolment.data);
    const selectedTeacher = getTeacher(enrolment.data);
    const isApproved = enrolment.status === "Approved";
    const isRejected = enrolment.status === "Rejected";
    const progressValue = getProgressValue(enrolment.status);
    return (<article className="rounded-[1.75rem] border border-white/[0.12] bg-white/[0.055] p-8 shadow-[0_24px_90px_rgba(0,0,0,0.26)] backdrop-blur-xl">
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

        <StatusPill status={enrolment.status}/>
      </div>

      <div className="mt-8 rounded-2xl border border-white/10 bg-[#0b0310]/70 p-5">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm font-black text-white/64">Application Progress</p>
          <p className="text-sm font-black text-[#f0b7ff]">{progressValue}%</p>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
          <div className={cn("h-full rounded-full", isRejected
            ? "bg-gradient-to-r from-[#ff7aa8] to-[#e234a8]"
            : "bg-gradient-to-r from-cyanGlow via-[#c026ff] to-[#e026b4]")} style={{ width: `${progressValue}%` }}/>
        </div>
        <MiniJourney status={enrolment.status}/>
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-3">
        <DashboardStat label="Teacher" value={selectedTeacher?.name ?? "Pending"}/>
        <DashboardStat label="Class Time" value={selectedSlot ? `${selectedSlot.day} ${selectedSlot.time}` : "Pending"}/>
        <DashboardStat label="Submitted" value={formatSubmittedDate(enrolment.submittedAt)}/>
      </div>

      <button type="button" onClick={onViewProgress} className="mt-8 inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] text-lg font-black text-white/80 transition hover:border-orchid/50 hover:text-white">
        <FileText size={20}/>
        View Full Progress
        <ArrowRight size={20}/>
      </button>
    </article>);
}
function DashboardStat({ label, value }) {
    return (<div className="rounded-2xl bg-white/[0.07] p-5">
      <p className="text-sm font-bold text-white/52">{label}</p>
      <p className="mt-2 text-2xl font-black leading-tight text-[#f4e7fb]">{value}</p>
    </div>);
}
function StatusPill({ status }) {
    const isApproved = status === "Approved";
    const isRejected = status === "Rejected";
    return (<span className={cn("inline-flex w-fit items-center gap-3 rounded-full border px-5 py-3 text-sm font-black leading-4", isApproved
            ? "border-cyanGlow/45 bg-cyanGlow/14 text-cyanGlow"
            : isRejected
                ? "border-[#ff7aa8]/45 bg-[#ff7aa8]/12 text-[#ffb0c8]"
                : "border-[#f0b7ff]/35 bg-[#f0b7ff]/12 text-[#f0b7ff]")}>
      {isRejected ? <XCircle size={17}/> : <BadgeCheck size={17}/>}
      {status}
    </span>);
}
function MiniJourney({ status }) {
    const steps = [
        { label: "Submitted", icon: CheckCircle2 },
        { label: "Reviewing", icon: Hourglass },
        { label: "Confirming", icon: UserRound },
        { label: "Decision", icon: Flag },
    ];
    const activeIndex = status === "Pending Review" ? 1 : 3;
    return (<div className="mt-5 grid gap-3 sm:grid-cols-4">
      {steps.map((step, index) => {
            const Icon = step.icon;
            const complete = status === "Approved" || index < activeIndex;
            const active = status === "Pending Review" && index === activeIndex;
            const rejected = status === "Rejected" && index === 3;
            return (<div key={step.label} className="flex items-center gap-2 rounded-xl bg-white/[0.055] px-3 py-2">
            <span className={cn("inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full", complete || active
                    ? "bg-[#f0b7ff] text-[#17061d]"
                    : rejected
                        ? "bg-[#ff7aa8]/18 text-[#ffb0c8]"
                        : "bg-white/10 text-white/42")}>
              <Icon size={16}/>
            </span>
            <span className="text-xs font-black text-white/68">{step.label}</span>
          </div>);
        })}
    </div>);
}
function getProgressValue(status) {
    if (status === "Approved" || status === "Rejected") {
        return 100;
    }
    return 50;
}
