import { useEffect, useMemo, useState } from "react";
import { BarChart3, Bell, CalendarDays, Clock3, GraduationCap, Grid2X2, LogOut, MapPin, Search, ShieldCheck, Sparkles, UserRoundPlus, UsersRound, X, } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { StudentManagementSection } from "../components/StudentManagementSection";
import { TeacherManagementSection } from "../components/TeacherManagementSection";
import { getAdminEnrolments, getPendingRegistrations, getStudentRegistrations, getTeacherRegistrations, updateStudentApprovalStatus, updateTeacherApplicationStatus, } from "../services/adminRegistrationService";
import { getAllTeacherClasses } from "../services/teacherClassService";
import { showErrorAlert, showSuccessAlert } from "../utils/alerts";
const adminSessionKey = "sankalanaAdminSession";
function getStoredAdminSession() {
    const storedSession = localStorage.getItem(adminSessionKey);
    if (!storedSession) {
        return null;
    }
    try {
        return JSON.parse(storedSession);
    }
    catch {
        localStorage.removeItem(adminSessionKey);
        return null;
    }
}
function getInitials(name) {
    const initials = name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");
    return initials || "NA";
}
function toStudentRequest(student) {
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
function toTeacherRequest(teacher) {
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
function formatCount(value) {
    return new Intl.NumberFormat("en-US").format(value);
}
function isPendingEnrolment(application) {
    return application.status === "Pending Review";
}
function getStatusCount(items, fieldName, status) {
    return items.filter((item) => item[fieldName] === status).length;
}
function getDanceStyleLabel(value, fallback = "Unassigned") {
    const labels = {
        kandyan: "Kandyan Dancing",
        "low-country": "Low Country Dancing",
        sabaragamu: "Sabaragamu",
        contemporary: "Contemporary",
    };
    return labels[value] ?? fallback;
}
function getClassForEnrolment(application, classes) {
    return classes.find((classItem) => classItem.id === application.data?.slotId);
}
function getPendingEnrolmentRows(enrolments, classes) {
    return enrolments
        .filter(isPendingEnrolment)
        .sort((first, second) => Date.parse(second.submittedAt) - Date.parse(first.submittedAt))
        .slice(0, 5)
        .map((application) => {
        const classItem = getClassForEnrolment(application, classes);
        return {
            id: application.applicationId,
            studentName: application.data?.personal?.fullName || "Student",
            style: getDanceStyleLabel(application.data?.danceStyleId, classItem?.danceStyle ?? "Dance class"),
            className: classItem?.className ?? "Class not found",
            teacherName: classItem?.teacherName ?? "Teacher pending",
            submittedAt: application.submittedAt,
        };
    });
}
function getClassStyleChartData(classes) {
    const counts = classes.reduce((chartData, classItem) => {
        const label = classItem.danceStyle || "Unassigned";
        chartData.set(label, (chartData.get(label) ?? 0) + 1);
        return chartData;
    }, new Map());
    return Array.from(counts.entries())
        .map(([label, value]) => ({ label, value }))
        .sort((first, second) => second.value - first.value);
}
function formatClassTime(value = "") {
    const [hourValue, minuteValue] = value.split(":").map(Number);
    if (!Number.isFinite(hourValue) || !Number.isFinite(minuteValue)) {
        return value || "Time not set";
    }
    const period = hourValue >= 12 ? "PM" : "AM";
    const hour = hourValue % 12 || 12;
    return `${hour}:${String(minuteValue).padStart(2, "0")} ${period}`;
}
function formatClassDays(days) {
    const readableDays = Array.isArray(days) ? days.filter(Boolean) : [];
    return readableDays.length > 0 ? readableDays.join(", ") : "Flexible";
}
function getClassCapacity(classItem) {
    return Number(classItem?.capacity) || 0;
}
function getClassRemainingSeats(classItem) {
    const capacity = getClassCapacity(classItem);
    const remainingSeats = Number(classItem?.remainingSeats ?? classItem?.availableSeats);
    if (Number.isFinite(remainingSeats)) {
        return Math.max(remainingSeats, 0);
    }
    const enrolledStudentCount = Number(classItem?.enrolledStudentCount);
    return Number.isFinite(enrolledStudentCount) ? Math.max(capacity - enrolledStudentCount, 0) : capacity;
}
function getClassEnrolledStudentCount(classItem) {
    const enrolledStudentCount = Number(classItem?.enrolledStudentCount);
    if (Number.isFinite(enrolledStudentCount)) {
        return Math.max(enrolledStudentCount, 0);
    }
    return Math.max(getClassCapacity(classItem) - getClassRemainingSeats(classItem), 0);
}
function formatDate(value) {
    if (!value || Number.isNaN(Date.parse(value))) {
        return "Date not set";
    }
    return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(value));
}
function getUniqueOptions(items, fieldName) {
    return Array.from(new Set(items.map((item) => item[fieldName]).filter(Boolean))).sort();
}
function getApprovedStudentCountForClass(classId, enrolments) {
    return new Set(enrolments
        .filter((application) => application.status === "Approved" && application.data?.slotId === classId)
        .map((application) => application.studentId)
        .filter(Boolean)).size;
}
function getReservedStudentCountForClass(classId, enrolments) {
    return new Set(enrolments
        .filter((application) => application.status !== "Rejected" && application.data?.slotId === classId)
        .map((application) => application.studentId)
        .filter(Boolean)).size;
}
export function AdminDashboardPage({ onLogout } = {}) {
    const navigate = useNavigate();
    const authentication = getStoredAdminSession();
    const hasAuthentication = Boolean(authentication);
    const [activeSection, setActiveSection] = useState("Dashboard");
    const [pendingRegistrations, setPendingRegistrations] = useState({
        students: [],
        teachers: [],
    });
    const [dashboardData, setDashboardData] = useState({
        students: [],
        teachers: [],
        classes: [],
        enrolments: [],
    });
    const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
    const [activeRequestKey, setActiveRequestKey] = useState(null);
    const pendingRequests = useMemo(() => [
        ...pendingRegistrations.students.map(toStudentRequest),
        ...pendingRegistrations.teachers.map(toTeacherRequest),
    ].sort((first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt)), [pendingRegistrations]);
    useEffect(() => {
        if (!hasAuthentication) {
            setIsLoadingDashboard(false);
            return;
        }
        let ignore = false;
        setIsLoadingDashboard(true);
        Promise.all([
            getPendingRegistrations(),
            getStudentRegistrations(),
            getTeacherRegistrations(),
            getAllTeacherClasses(),
            getAdminEnrolments(),
        ])
            .then(([registrations, students, teachers, classes, enrolments]) => {
            if (!ignore) {
                setPendingRegistrations(registrations);
                setDashboardData({
                    students,
                    teachers,
                    classes,
                    enrolments,
                });
            }
        })
            .catch((error) => {
            if (!ignore) {
                const message = error instanceof Error ? error.message : "Unable to load admin dashboard data.";
                if (message === "Admin login required.") {
                    localStorage.removeItem(adminSessionKey);
                    onLogout?.();
                    navigate("/admin", { replace: true });
                    return;
                }
                void showErrorAlert("Unable to Load Dashboard", message);
            }
        })
            .finally(() => {
            if (!ignore) {
                setIsLoadingDashboard(false);
            }
        });
        return () => {
            ignore = true;
        };
    }, [hasAuthentication, navigate, onLogout]);
    if (!authentication) {
        return <Navigate to="/admin" replace/>;
    }
    function handleLogout() {
        localStorage.removeItem(adminSessionKey);
        onLogout?.();
        navigate("/admin", { replace: true });
    }
    async function handleUpdateRequest(request, status) {
        setActiveRequestKey(request.key);
        try {
            if (request.role === "student") {
                await updateStudentApprovalStatus(request.id, status);
            }
            else {
                await updateTeacherApplicationStatus(request.id, status);
            }
            setPendingRegistrations((current) => ({
                students: current.students.filter((student) => student.id !== request.id),
                teachers: current.teachers.filter((teacher) => teacher.id !== request.id),
            }));
            setDashboardData((current) => ({
                ...current,
                students: request.role === "student"
                    ? current.students.map((student) => student.id === request.id ? { ...student, approvalStatus: status } : student)
                    : current.students,
                teachers: request.role === "teacher"
                    ? current.teachers.map((teacher) => teacher.id === request.id ? { ...teacher, applicationStatus: status } : teacher)
                    : current.teachers,
            }));
            await showSuccessAlert(status === "approved" ? "Registration Approved" : "Registration Rejected", `${request.name} has been ${status}.`);
        }
        catch (error) {
            await showErrorAlert("Update Failed", error instanceof Error ? error.message : "Unable to update registration.");
        }
        finally {
            setActiveRequestKey(null);
        }
    }
    const sidebarItems = [
        { label: "Dashboard", icon: Grid2X2 },
        { label: "Students", icon: UsersRound },
        { label: "Teachers", icon: GraduationCap },
        { label: "Classes", icon: CalendarDays },
    ];
    const totalStudents = dashboardData.students.length;
    const totalTeachers = dashboardData.teachers.length;
    const activeClasses = dashboardData.classes.length;
    const pendingEnrolments = dashboardData.enrolments.filter(isPendingEnrolment);
    const approvedEnrolmentCount = dashboardData.enrolments.filter((application) => application.status === "Approved").length;
    const rejectedEnrolmentCount = dashboardData.enrolments.filter((application) => application.status === "Rejected").length;
    const pendingEnrolmentRows = getPendingEnrolmentRows(dashboardData.enrolments, dashboardData.classes);
    const classStyleChartData = getClassStyleChartData(dashboardData.classes);
    const peopleChartSegments = [
        { label: "Students", value: totalStudents, color: "#22d3ee" },
        { label: "Teachers", value: totalTeachers, color: "#f0b7ff" },
    ];
    const accountStatusChartData = [
        {
            label: "Approved students",
            value: getStatusCount(dashboardData.students, "approvalStatus", "approved"),
            color: "#22d3ee",
        },
        {
            label: "Approved teachers",
            value: getStatusCount(dashboardData.teachers, "applicationStatus", "approved"),
            color: "#f0b7ff",
        },
        {
            label: "Pending accounts",
            value: pendingRequests.length,
            color: "#ff9edc",
        },
    ];
    const operationChartData = [
        { label: "Total Teachers", value: totalTeachers, color: "#f0b7ff" },
        { label: "Total Students", value: totalStudents, color: "#22d3ee" },
        { label: "Pending Enrolments", value: pendingEnrolments.length, color: "#ff9edc" },
        { label: "Active Classes", value: activeClasses, color: "#8b5cf6" },
    ];
    const enrolmentPipelineChartData = [
        { label: "Pending Review", value: pendingEnrolments.length, color: "#ff9edc" },
        { label: "Approved", value: approvedEnrolmentCount, color: "#22d3ee" },
        { label: "Rejected", value: rejectedEnrolmentCount, color: "#f97390" },
    ];
    const stats = [
        {
            label: "Total Teachers",
            value: isLoadingDashboard ? "--" : formatCount(totalTeachers),
            meta: "Registered faculty",
            icon: GraduationCap,
            accent: "text-[#f0b7ff]",
        },
        {
            label: "Student Count",
            value: isLoadingDashboard ? "--" : formatCount(totalStudents),
            meta: "Registered learners",
            icon: UsersRound,
            accent: "text-cyanGlow",
        },
        {
            label: "Pending Enrolments",
            value: isLoadingDashboard ? "--" : formatCount(pendingEnrolments.length),
            meta: "Teacher review queue",
            icon: UserRoundPlus,
            accent: "text-[#ff9edc]",
        },
        {
            label: "Active Classes",
            value: isLoadingDashboard ? "--" : formatCount(activeClasses),
            meta: "Live class slots",
            icon: Sparkles,
            accent: "text-cyanGlow",
        },
    ];
    return (<div className="min-h-screen bg-black text-white">
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
            return (<button key={item.label} type="button" onClick={() => setActiveSection(item.label)} className={`flex min-h-14 items-center gap-4 rounded-2xl px-5 text-left text-sm font-black transition ${isActive
                    ? "bg-gradient-to-r from-orchid to-[#bb26ff] text-white shadow-[0_18px_45px_rgba(217,28,255,0.34)]"
                    : "text-white/[0.64] hover:bg-white/[0.08] hover:text-white"}`}>
                  <Icon size={23}/>
                  {item.label}
                </button>);
        })}
          </nav>

          <div className="mt-10 grid gap-4 lg:mt-auto">
            <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-5">
              <div className="flex items-center gap-4">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-orchid/25 text-[#f0b7ff]">
                  <ShieldCheck size={24}/>
                </span>
                <div>
                  <p className="font-black text-white">Admin Central</p>
                  <p className="text-xs font-black uppercase tracking-[0.08em] text-white/50">
                    {authentication.admin.displayName}
                  </p>
                </div>
              </div>
            </div>

            <button type="button" onClick={handleLogout} className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#bb26ff] to-[#e026b4] px-5 text-sm font-black text-white transition hover:-translate-y-0.5">
              <LogOut size={20}/>
              Logout
            </button>
          </div>
        </aside>

        <main className="relative overflow-hidden px-5 py-8 sm:px-8 lg:px-12">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_16%,rgba(188,38,255,0.21),transparent_28rem),radial-gradient(circle_at_84%_72%,rgba(41,216,255,0.14),transparent_25rem)]"/>
          <div className="absolute inset-0 bg-gradient-to-br from-[#1b071f]/78 via-black to-[#00120f]"/>

          {activeSection === "Students" ? (<StudentManagementSection />) : activeSection === "Teachers" ? (<TeacherManagementSection />) : activeSection === "Classes" ? (<AdminClassesSection classes={dashboardData.classes} enrolments={dashboardData.enrolments} isLoading={isLoadingDashboard}/>) : (<section className="relative z-10 mx-auto max-w-7xl">
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
                <button type="button" className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.055] text-white/80 transition hover:border-cyanGlow/45 hover:text-cyanGlow" aria-label="Notifications">
                  <Bell size={24}/>
                </button>
                <button type="button" className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.055] text-white/80 transition hover:border-cyanGlow/45 hover:text-cyanGlow" aria-label="Search">
                  <Search size={25}/>
                </button>
              </div>
            </div>

            <div className="mt-12 grid gap-6 xl:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (<article key={stat.label} className="relative overflow-hidden rounded-[1.5rem] border border-white/[0.12] bg-white/[0.055] p-7 shadow-[0_24px_90px_rgba(0,0,0,0.24)] backdrop-blur-xl">
                    <Icon className="absolute right-6 top-6 text-white/10" size={58}/>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-white/65">{stat.label}</p>
                    <div className="mt-4 flex items-end gap-4">
                      <p className="text-5xl font-black leading-none text-[#f4e7fb]">{stat.value}</p>
                      <p className={`pb-1 text-sm font-black ${stat.accent}`}>{stat.meta}</p>
                    </div>
                  </article>);
            })}
            </div>

            <div className="mt-10 grid gap-7 xl:grid-cols-2">
              <DonutChartCard title="Academy Community" subtitle="Registered students and teachers" segments={peopleChartSegments} totalLabel="people"/>
              <HorizontalMetricChart title="Live Admin Snapshot" subtitle="Counts loaded from the academy database" items={operationChartData}/>
            </div>

            <div className="mt-7 grid gap-7 xl:grid-cols-[1fr_24rem]">
              <div className="grid gap-7">
                <HorizontalMetricChart title="Enrolment Pipeline" subtitle="Student enrolment requests by teacher decision status" items={enrolmentPipelineChartData}/>

                <article className="rounded-[1.75rem] border border-white/[0.12] bg-white/[0.055] p-7 shadow-[0_24px_90px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:p-8">
                  <h3 className="text-3xl font-black text-[#f4e7fb]">Pending Enrolment Queue</h3>
                  <p className="mt-2 text-sm font-semibold text-white/60">
                    Waiting for teacher approval from submitted enrolment forms.
                  </p>

                  <div className="mt-7 grid gap-4">
                    {isLoadingDashboard && (<p className="rounded-2xl bg-white/[0.06] px-5 py-4 text-sm font-bold text-white/68">
                        Loading enrolments...
                      </p>)}

                    {!isLoadingDashboard && pendingEnrolmentRows.length === 0 && (<p className="rounded-2xl bg-white/[0.06] px-5 py-4 text-sm font-bold text-white/68">
                        No pending enrolments.
                      </p>)}

                    {!isLoadingDashboard &&
                pendingEnrolmentRows.map((enrolment, index) => (<div key={enrolment.id} className={`rounded-2xl bg-white/[0.06] p-5 ${index === 0 ? "border-l-2 border-[#ff9edc]" : ""}`}>
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="font-black text-white">{enrolment.studentName}</p>
                              <p className="mt-1 text-xs font-bold uppercase tracking-[0.08em] text-white/52">
                                {enrolment.style} • {enrolment.className}
                              </p>
                              <p className="mt-2 text-xs font-black uppercase tracking-[0.12em] text-cyanGlow">
                                {enrolment.teacherName}
                              </p>
                            </div>
                            <span className="w-fit rounded-full border border-[#ff9edc]/30 bg-[#ff9edc]/12 px-4 py-2 text-xs font-black uppercase tracking-[0.1em] text-[#ffb3e5]">
                              Pending Review
                            </span>
                          </div>
                        </div>))}
                  </div>
                </article>

                <article className="rounded-[1.75rem] border border-white/[0.12] bg-white/[0.055] p-7 shadow-[0_24px_90px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:p-8">
                  <h3 className="text-3xl font-black text-[#f4e7fb]">Account Approval Queue</h3>
                  <p className="mt-2 text-sm font-semibold text-white/60">
                    Student and teacher account requests that still need admin action.
                  </p>

                  <div className="mt-7 grid gap-4">
                    {isLoadingDashboard && (<p className="rounded-2xl bg-white/[0.06] px-5 py-4 text-sm font-bold text-white/68">
                        Loading pending registrations...
                      </p>)}

                    {!isLoadingDashboard && pendingRequests.length === 0 && (<p className="rounded-2xl bg-white/[0.06] px-5 py-4 text-sm font-bold text-white/68">
                        No pending student or teacher registrations.
                      </p>)}

                    {!isLoadingDashboard &&
                pendingRequests.map((request, index) => {
                    const isUpdating = activeRequestKey === request.key;
                    return (<div key={request.key} className={`flex flex-col gap-4 rounded-2xl bg-white/[0.06] p-5 sm:flex-row sm:items-center sm:justify-between ${index === 0 ? "border-l-2 border-[#ff9edc]" : ""}`}>
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
                              <button type="button" onClick={() => void handleUpdateRequest(request, "approved")} disabled={isUpdating} className="min-h-11 rounded-xl bg-[#6c5274] px-6 text-sm font-black text-[#f6d5ff] transition hover:bg-[#806088] disabled:cursor-not-allowed disabled:opacity-60">
                                {isUpdating ? "Saving..." : "Approve"}
                              </button>
                              <button type="button" onClick={() => void handleUpdateRequest(request, "rejected")} disabled={isUpdating} className="text-white/64 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-60" aria-label={`Reject ${request.name}`}>
                                <X size={24}/>
                              </button>
                            </div>
                          </div>);
                })}
                  </div>

                  <button type="button" className="mt-6 min-h-14 w-full rounded-2xl border border-dashed border-white/18 text-sm font-black text-white/78 transition hover:border-cyanGlow/40 hover:text-cyanGlow">
                    View All {pendingRequests.length} Requests
                  </button>
                </article>
              </div>

              <aside className="grid content-start gap-7">
                <HorizontalMetricChart title="Account Status" subtitle="Approved and pending users" items={accountStatusChartData} compact/>
                <HorizontalMetricChart title="Class Style Mix" subtitle="Active classes by dance discipline" items={classStyleChartData.length > 0
                ? classStyleChartData.map((item, index) => ({
                    ...item,
                    color: ["#22d3ee", "#f0b7ff", "#ff9edc", "#8b5cf6"][index % 4],
                }))
                : [{ label: "No classes yet", value: 0, color: "#475569" }]} compact/>
              </aside>
            </div>
          </section>)}
        </main>
      </div>
    </div>);
}
function AdminClassesSection({ classes, enrolments, isLoading }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [styleFilter, setStyleFilter] = useState("all");
    const [levelFilter, setLevelFilter] = useState("all");
    const classSummaries = useMemo(() => classes.map((classItem) => {
        const approvedStudentsFromClass = Number(classItem.approvedStudentCount);
        const pendingEnrolmentsFromClass = Number(classItem.pendingEnrolmentCount);
        const approvedStudents = Number.isFinite(approvedStudentsFromClass)
            ? approvedStudentsFromClass
            : getApprovedStudentCountForClass(classItem.id, enrolments);
        const pendingEnrolments = Number.isFinite(pendingEnrolmentsFromClass)
            ? pendingEnrolmentsFromClass
            : enrolments.filter((application) => application.status === "Pending Review" && application.data?.slotId === classItem.id).length;
        const capacity = getClassCapacity(classItem);
        const enrolledStudentCount = Number.isFinite(Number(classItem.enrolledStudentCount))
            ? getClassEnrolledStudentCount(classItem)
            : getReservedStudentCountForClass(classItem.id, enrolments);
        const remainingSeats = getClassRemainingSeats({
            ...classItem,
            enrolledStudentCount,
        });
        const fillPercent = capacity > 0 ? Math.min(100, Math.round((enrolledStudentCount / capacity) * 100)) : 0;
        return {
            ...classItem,
            approvedStudents,
            pendingEnrolments,
            enrolledStudentCount,
            capacity,
            remainingSeats,
            fillPercent,
        };
    }), [classes, enrolments]);
    const styleOptions = useMemo(() => getUniqueOptions(classes, "danceStyle"), [classes]);
    const levelOptions = useMemo(() => getUniqueOptions(classes, "classLevel"), [classes]);
    const filteredClasses = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();
        return classSummaries
            .filter((classItem) => styleFilter === "all" || classItem.danceStyle === styleFilter)
            .filter((classItem) => levelFilter === "all" || classItem.classLevel === levelFilter)
            .filter((classItem) => {
            if (!normalizedSearch) {
                return true;
            }
            return [
                classItem.className,
                classItem.danceStyle,
                classItem.classLevel,
                classItem.teacherName,
                classItem.teacherUsername,
                classItem.studio,
                formatClassDays(classItem.days),
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(normalizedSearch);
        })
            .sort((first, second) => Date.parse(second.createdAt) - Date.parse(first.createdAt));
    }, [classSummaries, levelFilter, searchTerm, styleFilter]);
    const totalCapacity = classSummaries.reduce((total, classItem) => total + classItem.capacity, 0);
    const remainingSeats = classSummaries.reduce((total, classItem) => total + classItem.remainingSeats, 0);
    const weeklySessions = classSummaries.reduce((total, classItem) => total + (Array.isArray(classItem.days) ? classItem.days.length : 0), 0);
    const activeTeacherCount = new Set(classSummaries.map((classItem) => classItem.teacherId).filter(Boolean)).size;
    const enrolledStudents = classSummaries.reduce((total, classItem) => total + classItem.enrolledStudentCount, 0);
    const classesByStyle = getClassStyleChartData(classes).map((item, index) => ({
        ...item,
        color: ["#22d3ee", "#f0b7ff", "#ff9edc", "#8b5cf6"][index % 4],
    }));
    const classStats = [
        { label: "Registered Classes", value: classes.length, detail: "Created by teachers", icon: CalendarDays },
        { label: "Active Teachers", value: activeTeacherCount, detail: "With published classes", icon: GraduationCap },
        { label: "Remaining Seats", value: remainingSeats, detail: `${totalCapacity} total, ${enrolledStudents} reserved`, icon: UsersRound },
        { label: "Weekly Sessions", value: weeklySessions, detail: "Across all schedules", icon: Sparkles },
    ];
    return (<section className="relative z-10 mx-auto max-w-7xl pb-10">
      <div className="flex flex-col gap-7 border-b border-white/10 pb-7 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.24em] text-cyanGlow">Admin Classes</p>
          <h1 className="mt-4 text-5xl font-black leading-none text-[#f4e7fb] sm:text-6xl">Registered Classes</h1>
          <p className="mt-5 max-w-3xl text-lg font-semibold leading-8 text-white/[0.64]">
            Review every class currently registered in the academy database, including teachers, schedule, studio, capacity, and enrolment status.
          </p>
        </div>
        <div className="rounded-2xl border border-cyanGlow/25 bg-cyanGlow/10 px-5 py-4 text-sm font-black text-cyanGlow">
          {isLoading ? "Syncing class data..." : `${formatCount(filteredClasses.length)} visible of ${formatCount(classes.length)} classes`}
        </div>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {classStats.map((stat) => {
            const Icon = stat.icon;
            return (<article key={stat.label} className="relative overflow-hidden rounded-[1.35rem] border border-white/[0.12] bg-white/[0.055] p-6 shadow-[0_22px_70px_rgba(0,0,0,0.22)] backdrop-blur-xl">
              <Icon className="absolute right-5 top-5 text-white/10" size={44}/>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/56">{stat.label}</p>
              <p className="mt-4 text-4xl font-black leading-none text-[#f4e7fb]">{isLoading ? "--" : formatCount(stat.value)}</p>
              <p className="mt-3 text-sm font-black text-[#f0b7ff]">{stat.detail}</p>
            </article>);
        })}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="grid gap-5 rounded-[1.35rem] border border-white/[0.12] bg-white/[0.055] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.2)] backdrop-blur-xl md:grid-cols-[1fr_13rem_13rem]">
          <label className="flex min-h-[3.25rem] items-center gap-3 rounded-2xl border border-white/10 bg-[#140616]/76 px-5 text-white/70 focus-within:border-cyanGlow/45">
            <Search size={21} className="text-white/42"/>
            <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="w-full bg-transparent text-sm font-bold text-white outline-none placeholder:text-white/35" placeholder="Search class, teacher, studio..."/>
          </label>
          <select value={styleFilter} onChange={(event) => setStyleFilter(event.target.value)} className="min-h-[3.25rem] rounded-2xl border border-white/10 bg-[#140616]/76 px-5 text-sm font-black text-white outline-none transition focus:border-[#f0b7ff]">
            <option value="all" className="bg-[#140616] text-white">All Styles</option>
            {styleOptions.map((style) => (<option key={style} value={style} className="bg-[#140616] text-white">{style}</option>))}
          </select>
          <select value={levelFilter} onChange={(event) => setLevelFilter(event.target.value)} className="min-h-[3.25rem] rounded-2xl border border-white/10 bg-[#140616]/76 px-5 text-sm font-black text-white outline-none transition focus:border-[#f0b7ff]">
            <option value="all" className="bg-[#140616] text-white">All Levels</option>
            {levelOptions.map((level) => (<option key={level} value={level} className="bg-[#140616] text-white">{level}</option>))}
          </select>
        </div>

        <HorizontalMetricChart title="Classes by Style" subtitle="Registered class distribution" items={classesByStyle.length > 0 ? classesByStyle : [{ label: "No classes yet", value: 0, color: "#475569" }]} compact/>
      </div>

      {isLoading ? (<article className="mt-8 rounded-[1.35rem] border border-white/[0.12] bg-white/[0.055] p-10 text-center shadow-[0_24px_90px_rgba(0,0,0,0.22)] backdrop-blur-xl">
          <Sparkles className="mx-auto text-[#f0b7ff]" size={42}/>
          <h2 className="mt-4 text-3xl font-black text-[#f4e7fb]">Loading registered classes</h2>
          <p className="mt-2 text-sm font-semibold text-white/58">Checking the database for current class records.</p>
        </article>) : classes.length === 0 ? (<article className="mt-8 rounded-[1.35rem] border border-white/[0.12] bg-white/[0.055] p-10 text-center shadow-[0_24px_90px_rgba(0,0,0,0.22)] backdrop-blur-xl">
          <CalendarDays className="mx-auto text-cyanGlow" size={42}/>
          <h2 className="mt-4 text-3xl font-black text-[#f4e7fb]">No registered classes</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm font-semibold leading-7 text-white/58">
            Teacher-created classes will appear here after they are saved.
          </p>
        </article>) : filteredClasses.length === 0 ? (<article className="mt-8 rounded-[1.35rem] border border-white/[0.12] bg-white/[0.055] p-10 text-center shadow-[0_24px_90px_rgba(0,0,0,0.22)] backdrop-blur-xl">
          <Search className="mx-auto text-[#f0b7ff]" size={42}/>
          <h2 className="mt-4 text-3xl font-black text-[#f4e7fb]">No classes match the filters</h2>
          <p className="mt-2 text-sm font-semibold text-white/58">Try another class name, teacher, style, or level.</p>
        </article>) : (<div className="mt-8 grid gap-6 xl:grid-cols-2">
          {filteredClasses.map((classItem) => (<article key={classItem.id} className="overflow-hidden rounded-[1.35rem] border border-white/[0.12] bg-[#17091d]/88 shadow-[0_24px_90px_rgba(0,0,0,0.25)]">
              <div className="grid gap-0 lg:grid-cols-[1fr_14rem]">
                <div className="p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-cyanGlow">{classItem.danceStyle || "Dance Class"}</p>
                      <h2 className="mt-2 text-3xl font-black leading-tight text-[#f4e7fb]">{classItem.className}</h2>
                    </div>
                    <span className="rounded-full border border-[#f0b7ff]/30 bg-[#f0b7ff]/12 px-4 py-2 text-xs font-black uppercase tracking-[0.1em] text-[#f0b7ff]">
                      {classItem.classLevel || "Level TBD"}
                    </span>
                  </div>

                  <p className="mt-4 line-clamp-2 text-sm font-semibold leading-7 text-white/62">
                    {classItem.description || "No description added."}
                  </p>

                  <div className="mt-6 grid gap-3 text-sm font-black text-white/68 sm:grid-cols-2">
                    <span className="inline-flex items-center gap-3">
                      <GraduationCap size={17} className="text-[#f0b7ff]"/>
                      {classItem.teacherName || classItem.teacherUsername || "Teacher not linked"}
                    </span>
                    <span className="inline-flex items-center gap-3">
                      <CalendarDays size={17} className="text-[#f0b7ff]"/>
                      {formatClassDays(classItem.days)}
                    </span>
                    <span className="inline-flex items-center gap-3">
                      <Clock3 size={17} className="text-[#f0b7ff]"/>
                      {formatClassTime(classItem.startTime)} - {formatClassTime(classItem.endTime)}
                    </span>
                    <span className="inline-flex items-center gap-3">
                      <MapPin size={17} className="text-[#f0b7ff]"/>
                      {classItem.studio || "Studio not set"}
                    </span>
                  </div>
                </div>

                <div className="border-t border-white/10 bg-black/[0.12] p-6 lg:border-l lg:border-t-0">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-white/42">Enrolment</p>
                  <div className="mt-4">
                    <div className="flex items-end justify-between gap-4">
                      <span className="text-4xl font-black leading-none text-[#f4e7fb]">{formatCount(classItem.remainingSeats)}</span>
                      <span className="pb-1 text-sm font-black text-white/54">of {formatCount(classItem.capacity)} seats left</span>
                    </div>
                    <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/[0.1]">
                      <div className="h-full rounded-full bg-gradient-to-r from-[#bb26ff] via-[#6577ff] to-cyanGlow" style={{ width: `${classItem.fillPercent}%` }}/>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3 text-sm">
                    <div className="flex items-center justify-between border-t border-white/10 pt-3">
                      <span className="font-black text-white/52">Reserved</span>
                      <span className="font-black text-[#f0b7ff]">{formatCount(classItem.enrolledStudentCount)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/10 pt-3">
                      <span className="font-black text-white/52">Pending</span>
                      <span className="font-black text-[#ff9edc]">{formatCount(classItem.pendingEnrolments)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/10 pt-3">
                      <span className="font-black text-white/52">Approved</span>
                      <span className="font-black text-cyanGlow">{formatCount(classItem.approvedStudents)}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/10 pt-3">
                      <span className="font-black text-white/52">Filled</span>
                      <span className="font-black text-cyanGlow">{classItem.fillPercent}%</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-white/10 pt-3">
                      <span className="font-black text-white/52">Added</span>
                      <span className="font-black text-white/72">{formatDate(classItem.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>))}
        </div>)}
    </section>);
}
function DonutChartCard({ title, subtitle, segments, totalLabel }) {
    const total = segments.reduce((sum, segment) => sum + segment.value, 0);
    let cursor = 0;
    const background = total > 0
        ? `conic-gradient(${segments.map((segment) => {
            const start = cursor;
            const end = cursor + (segment.value / total) * 360;
            cursor = end;
            return `${segment.color} ${start}deg ${end}deg`;
        }).join(", ")})`
        : "conic-gradient(#334155 0deg 360deg)";
    return (<article className="rounded-[1.75rem] border border-white/[0.12] bg-white/[0.055] p-7 shadow-[0_24px_90px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:p-8">
      <div className="flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyanGlow">{title}</p>
          <h3 className="mt-3 text-3xl font-black text-[#f4e7fb]">{formatCount(total)}</h3>
          <p className="mt-2 text-sm font-semibold text-white/60">{subtitle}</p>
        </div>

        <div className="grid place-items-center">
          <div className="grid h-44 w-44 place-items-center rounded-full p-3 shadow-[0_0_55px_rgba(34,211,238,0.12)]" style={{ background }}>
            <div className="grid h-full w-full place-items-center rounded-full border border-white/10 bg-[#0b0310] text-center">
              <span>
                <span className="block text-3xl font-black text-white">{formatCount(total)}</span>
                <span className="mt-1 block text-xs font-black uppercase tracking-[0.14em] text-white/48">{totalLabel}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        {segments.map((segment) => {
            const percentage = total > 0 ? Math.round((segment.value / total) * 100) : 0;
            return (<div key={segment.label} className="flex items-center justify-between gap-4 border-t border-white/10 pt-3">
              <span className="flex items-center gap-3 text-sm font-black text-white/72">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: segment.color }}/>
                {segment.label}
              </span>
              <span className="text-sm font-black text-[#f4e7fb]">{percentage}%</span>
            </div>);
        })}
      </div>
    </article>);
}
function HorizontalMetricChart({ title, subtitle, items, compact = false }) {
    const maxValue = Math.max(1, ...items.map((item) => item.value));
    return (<article className={`rounded-[1.75rem] border border-white/[0.12] bg-white/[0.055] p-7 shadow-[0_24px_90px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:p-8 ${compact ? "" : "min-h-[20rem]"}`}>
      <div className="flex items-start justify-between gap-5">
        <div>
          <h3 className="text-2xl font-black text-[#f4e7fb]">{title}</h3>
          <p className="mt-2 text-sm font-semibold text-white/60">{subtitle}</p>
        </div>
        <BarChart3 className="shrink-0 text-white/16" size={42}/>
      </div>

      <div className="mt-7 grid gap-5">
        {items.map((item) => {
            const width = `${Math.max(item.value === 0 ? 0 : 8, Math.round((item.value / maxValue) * 100))}%`;
            return (<div key={item.label}>
              <div className="mb-2 flex items-center justify-between gap-4 text-sm">
                <span className="font-black text-white/72">{item.label}</span>
                <span className="font-black text-[#f4e7fb]">{formatCount(item.value)}</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white/[0.08]">
                <div className="h-full rounded-full shadow-[0_0_22px_rgba(34,211,238,0.18)]" style={{ width, backgroundColor: item.color }}/>
              </div>
            </div>);
        })}
      </div>
    </article>);
}
