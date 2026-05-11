import {
  BadgeCheck,
  Cake,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  IdCard,
  LockKeyhole,
  Mail,
  Phone,
  Search,
  ShieldCheck,
  UserRound,
  UserRoundCheck,
  X,
  type LucideIcon,
} from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  getStudentRegistrations,
  updateStudentApprovalStatus,
  updateStudentPassword,
  updateStudentRegistrationProfile,
} from "../services/adminRegistrationService";
import type {
  StudentApprovalStatus,
  StudentGender,
  StudentRegistration,
  StudentRegistrationProfilePayload,
} from "../types/studentRegistration";
import { showErrorAlert, showSuccessAlert } from "../utils/alerts";

type DirectoryStudent = {
  id: string;
  name: string;
  email: string;
  phone: string;
  username: string;
  gender: string;
  accountRole: "student";
  status: StudentApprovalStatus;
  dateOfBirth: string;
  age: number;
  joinedAt: string;
  initials: string;
};

const filters = [
  { label: "All", value: "all" as const },
  { label: "Approved", value: "approved" as const },
  { label: "Pending", value: "pending" as const },
  { label: "Rejected", value: "rejected" as const },
];

type FilterValue = (typeof filters)[number]["value"];
type SortValue = "recent" | "name" | "age";

const studentsPerPage = 6;
const studentGenderOptions: StudentGender[] = ["Female", "Male", "Other", "Prefer not to say"];
const profileInputClass =
  "min-h-12 w-full rounded-lg border border-white/10 bg-[#0b0310] px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-white/35 focus:border-[#f0b7ff]/60 focus:ring-2 focus:ring-[#f0b7ff]/20";
const profileLabelClass = "text-xs font-black uppercase tracking-[0.14em] text-[#f0b7ff]";

export function StudentManagementSection() {
  const [studentRegistrations, setStudentRegistrations] = useState<StudentRegistration[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortValue>("recent");
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [updatingStudentId, setUpdatingStudentId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<DirectoryStudent | null>(null);

  useEffect(() => {
    let ignore = false;

    setIsLoadingStudents(true);
    getStudentRegistrations()
      .then((students) => {
        if (!ignore) {
          setStudentRegistrations(students);
        }
      })
      .catch((error) => {
        if (!ignore) {
          void showErrorAlert(
            "Unable to Load Students",
            error instanceof Error ? error.message : "Unable to load student registrations.",
          );
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoadingStudents(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const directoryStudents = useMemo(
    () => studentRegistrations.map(toDirectoryStudent),
    [studentRegistrations],
  );

  const filteredStudents = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return directoryStudents
      .filter((student) => activeFilter === "all" || student.status === activeFilter)
      .filter((student) => {
        if (!normalizedSearch) {
          return true;
        }

        return `${student.name} ${student.username} ${student.email} ${student.phone} ${student.gender}`
          .toLowerCase()
          .includes(normalizedSearch);
      })
      .sort((first, second) => {
        if (sortBy === "name") {
          return first.name.localeCompare(second.name);
        }

        if (sortBy === "age") {
          return second.age - first.age;
        }

        return Date.parse(second.joinedAt) - Date.parse(first.joinedAt);
      });
  }, [activeFilter, directoryStudents, searchTerm, sortBy]);

  const counts = {
    all: directoryStudents.length,
    approved: directoryStudents.filter((student) => student.status === "approved").length,
    pending: directoryStudents.filter((student) => student.status === "pending").length,
    rejected: directoryStudents.filter((student) => student.status === "rejected").length,
  };
  const totalPages = Math.max(1, Math.ceil(filteredStudents.length / studentsPerPage));
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * studentsPerPage,
    currentPage * studentsPerPage,
  );
  const shouldShowPagination = filteredStudents.length > studentsPerPage;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchTerm, sortBy]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  async function handleToggleStudent(student: DirectoryStudent) {
    const nextStatus: StudentApprovalStatus = student.status === "approved" ? "rejected" : "approved";

    setUpdatingStudentId(student.id);

    try {
      const updatedStudent = await updateStudentApprovalStatus(student.id, nextStatus);

      setStudentRegistrations((currentStudents) =>
        currentStudents.map((currentStudent) =>
          currentStudent.id === updatedStudent.id ? updatedStudent : currentStudent,
        ),
      );
      setSelectedStudent((currentStudent) =>
        currentStudent?.id === updatedStudent.id ? toDirectoryStudent(updatedStudent) : currentStudent,
      );
      await showSuccessAlert(
        nextStatus === "approved" ? "Student Activated" : "Student Deactivated",
        `${updatedStudent.fullName} is now ${statusLabel(updatedStudent.approvalStatus)}.`,
      );
    } catch (error) {
      await showErrorAlert(
        "Update Failed",
        error instanceof Error ? error.message : "Unable to update student status.",
      );
    } finally {
      setUpdatingStudentId(null);
    }
  }

  async function handleSaveStudentProfile(studentId: string, payload: StudentRegistrationProfilePayload) {
    const updatedStudent = await updateStudentRegistrationProfile(studentId, payload);
    const updatedDirectoryStudent = toDirectoryStudent(updatedStudent);

    setStudentRegistrations((currentStudents) =>
      currentStudents.map((currentStudent) =>
        currentStudent.id === updatedStudent.id ? updatedStudent : currentStudent,
      ),
    );
    setSelectedStudent(updatedDirectoryStudent);
    void showSuccessAlert("Profile Updated", `${updatedStudent.fullName}'s profile has been updated.`);

    return updatedDirectoryStudent;
  }

  return (
    <section className="relative z-10 mx-auto max-w-7xl">
      <div className="flex flex-col gap-6 border-b border-white/10 pb-6 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-4xl font-black leading-none text-[#f0b7ff] sm:text-5xl">Student Directory</h1>
          <p className="mt-2 text-sm font-black tracking-[0.05em] text-white/55">Manage registered student accounts</p>
        </div>

        <label className="flex min-h-12 items-center gap-3 rounded-full border border-white/10 bg-[#1a0a20]/92 px-5 text-white/70 shadow-[0_18px_55px_rgba(0,0,0,0.22)] focus-within:border-orchid/45">
          <Search size={22} className="text-white/50" />
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full bg-transparent text-sm font-bold text-white outline-none placeholder:text-white/35 sm:w-72"
            placeholder="Search students..."
          />
        </label>
      </div>

      <div className="mt-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3">
          {filters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setActiveFilter(filter.value)}
              className={`min-h-9 rounded-full px-4 text-xs font-black transition ${
                activeFilter === filter.value
                  ? "bg-cyanGlow/18 text-cyanGlow"
                  : "bg-white/[0.075] text-white/56 hover:text-white"
              }`}
            >
              {filter.label} ({counts[filter.value]})
            </button>
          ))}
        </div>

        <label className="flex w-fit items-center gap-3 text-sm font-black text-white/60">
          Sort by:
          <span className="relative">
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortValue)}
              className="appearance-none bg-transparent py-2 pr-8 text-[#f0b7ff] outline-none"
            >
              <option value="recent" className="bg-[#140616] text-white">Recent First</option>
              <option value="name" className="bg-[#140616] text-white">Name</option>
              <option value="age" className="bg-[#140616] text-white">Age</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-0 top-2.5 text-white/40" size={17} />
          </span>
        </label>
      </div>

      {isLoadingStudents ? (
        <div className="mt-8 rounded-[1.35rem] border border-white/[0.12] bg-white/[0.055] p-8 text-sm font-black text-white/65">
          Loading student registrations...
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="mt-8 rounded-[1.35rem] border border-white/[0.12] bg-white/[0.055] p-8 text-sm font-black text-white/65">
          No students match the current filters.
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {paginatedStudents.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              onToggle={() => void handleToggleStudent(student)}
              onView={() => setSelectedStudent(student)}
              isUpdating={updatingStudentId === student.id}
            />
          ))}
        </div>
      )}

      {shouldShowPagination && (
        <div className="mt-10 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={currentPage === 1}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-white/65 transition hover:border-cyanGlow/40 hover:text-cyanGlow disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-white/10 disabled:hover:text-white/65"
            aria-label="Previous students page"
          >
            <ChevronLeft size={22} />
          </button>
          {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => setCurrentPage(page)}
              className={`h-11 w-11 rounded-full border text-sm font-black transition ${
                page === currentPage
                  ? "border-[#f0b7ff] bg-[#f0b7ff] text-[#17061d]"
                  : "border-white/10 text-white/58 hover:border-cyanGlow/35 hover:text-cyanGlow"
              }`}
              aria-label={`Students page ${page}`}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            disabled={currentPage === totalPages}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 text-white/65 transition hover:border-cyanGlow/40 hover:text-cyanGlow disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:border-white/10 disabled:hover:text-white/65"
            aria-label="Next students page"
          >
            <ChevronRight size={22} />
          </button>
        </div>
      )}

      {selectedStudent && (
        <StudentProfileModal
          student={selectedStudent}
          onSave={handleSaveStudentProfile}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </section>
  );
}

function StudentCard({
  student,
  onToggle,
  onView,
  isUpdating,
}: {
  student: DirectoryStudent;
  onToggle: () => void;
  onView: () => void;
  isUpdating: boolean;
}) {
  const isActive = student.status === "approved";
  const muted = student.status === "rejected";

  return (
    <article
      className={`min-h-[20rem] rounded-[1.35rem] border p-6 shadow-[0_24px_90px_rgba(0,0,0,0.26)] ${
        muted
          ? "border-white/[0.08] bg-[#0b0d0f]/86 text-white/52"
          : "border-white/[0.12] bg-[#17091d]/88 text-white"
      }`}
    >
      <div className="flex items-start justify-between gap-5">
        <div className="flex min-w-0 gap-4">
          <span className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-orchid/18 text-lg font-black text-[#f0b7ff]">
            {student.initials}
          </span>
          <div className="min-w-0">
            <h2 className="text-2xl font-black leading-tight text-[#f4e7fb]">{student.name}</h2>
            <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-cyanGlow">{student.username}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggle}
          disabled={isUpdating}
          className={`relative h-6 w-12 shrink-0 rounded-full transition disabled:cursor-not-allowed disabled:opacity-60 ${
            isActive ? "bg-orchid" : "bg-white/12"
          }`}
          aria-label={`${isActive ? "Deactivate" : "Activate"} ${student.name}`}
        >
          <span
            className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
              isActive ? "left-7" : "left-1"
            }`}
          />
        </button>
      </div>

      <div className="mt-7 flex flex-wrap gap-2">
        {[statusLabel(student.status), student.gender, `${student.age} Years`].map((badge) => (
          <span key={badge} className="rounded-md border border-white/10 bg-white/[0.055] px-3 py-2 text-xs font-black text-white/56">
            {badge}
          </span>
        ))}
      </div>

      <div className="mt-7 grid gap-3 text-sm font-semibold text-white/66">
        <p className="flex items-center gap-3">
          <Mail size={17} className="text-[#f0b7ff]" />
          <span className="truncate">{student.email}</span>
        </p>
        <p className="flex items-center gap-3">
          <Phone size={17} className="text-[#f0b7ff]" />
          <span>{student.phone}</span>
        </p>
        <p className="flex items-center gap-3">
          <CalendarDays size={17} className="text-[#f0b7ff]" />
          <span>Joined {formatDate(student.joinedAt)}</span>
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
        <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.1em] text-white/50">
          <UserRoundCheck size={17} />
          {statusLabel(student.status)}
        </span>
        <button
          type="button"
          onClick={onView}
          className="inline-flex items-center gap-2 text-sm font-black text-[#f0b7ff] transition hover:text-white"
        >
          View Profile
          <ChevronRight size={18} />
        </button>
      </div>
    </article>
  );
}

function StudentProfileModal({
  student,
  onSave,
  onClose,
}: {
  student: DirectoryStudent;
  onSave: (studentId: string, payload: StudentRegistrationProfilePayload) => Promise<DirectoryStudent>;
  onClose: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordEditing, setIsPasswordEditing] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const isApproved = student.status === "approved";
  const isRejected = student.status === "rejected";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    setIsSaving(true);

    try {
      await onSave(student.id, {
        fullName: String(formData.get("fullName") ?? ""),
        email: String(formData.get("email") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        username: String(formData.get("username") ?? ""),
        gender: String(formData.get("gender") ?? "") as StudentGender,
        dateOfBirth: String(formData.get("dateOfBirth") ?? ""),
      });
      setIsEditing(false);
    } catch (error) {
      await showErrorAlert(
        "Profile Not Updated",
        error instanceof Error ? error.message : "Unable to update student profile.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setIsUpdatingPassword(true);

    try {
      await updateStudentPassword(student.id, {
        password: String(formData.get("password") ?? ""),
        confirmPassword: String(formData.get("confirmPassword") ?? ""),
      });
      form.reset();
      setIsPasswordEditing(false);
      await showSuccessAlert("Password Updated", `${student.name}'s login password has been changed.`);
    } catch (error) {
      await showErrorAlert(
        "Password Not Updated",
        error instanceof Error ? error.message : "Unable to update student password.",
      );
    } finally {
      setIsUpdatingPassword(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-5xl rounded-[1.35rem] border border-white/12 bg-[#16051d] p-5 shadow-[0_32px_110px_rgba(0,0,0,0.55)] sm:p-7">
        <div className="flex items-start justify-between gap-5 border-b border-white/10 pb-6">
          <div className="flex min-w-0 items-center gap-5">
            <span className="inline-flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-[#f0b7ff]/30 bg-[#2a1232] text-2xl font-black text-[#f0b7ff] shadow-[0_0_38px_rgba(217,28,255,0.18)]">
              {student.initials}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-cyanGlow">Student Profile</p>
              <h2 className="mt-2 text-4xl font-black leading-tight text-[#f0b7ff]">{student.name}</h2>
              <p className="mt-2 text-sm font-black uppercase tracking-[0.12em] text-white/55">@{student.username}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#211028] text-white/65 transition hover:border-[#f0b7ff]/45 hover:text-[#f0b7ff]"
            aria-label="Close student profile"
          >
            <X size={22} />
          </button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_22rem]">
          <div className="grid gap-6">
            <form className="rounded-2xl border border-white/10 bg-[#211028] p-5 sm:p-6" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-white/48">Account Status</p>
                  <p className="mt-2 text-2xl font-black text-white">{statusLabel(student.status)}</p>
                </div>
                <span
                  className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.1em] ${
                    isApproved
                      ? "border-cyanGlow/45 bg-cyanGlow/14 text-cyanGlow"
                      : isRejected
                        ? "border-[#ff7aa8]/35 bg-[#ff7aa8]/12 text-[#ffb0c8]"
                        : "border-[#f0b7ff]/35 bg-[#f0b7ff]/12 text-[#f0b7ff]"
                  }`}
                >
                  <BadgeCheck size={16} />
                  {isApproved ? "Login Enabled" : isRejected ? "Access Disabled" : "Awaiting Approval"}
                </span>
              </div>

              {isEditing ? (
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <label className="grid gap-3 sm:col-span-2">
                    <span className={profileLabelClass}>Full Name</span>
                    <input className={profileInputClass} name="fullName" defaultValue={student.name} required />
                  </label>

                  <label className="grid gap-3">
                    <span className={profileLabelClass}>Email Address</span>
                    <input className={profileInputClass} name="email" type="email" defaultValue={student.email} required />
                  </label>

                  <label className="grid gap-3">
                    <span className={profileLabelClass}>Phone Number</span>
                    <input className={profileInputClass} name="phone" defaultValue={student.phone} required />
                  </label>

                  <label className="grid gap-3">
                    <span className={profileLabelClass}>Username</span>
                    <input className={profileInputClass} name="username" defaultValue={student.username} required />
                  </label>

                  <label className="grid gap-3">
                    <span className={profileLabelClass}>Date of Birth</span>
                    <input className={profileInputClass} name="dateOfBirth" type="date" defaultValue={student.dateOfBirth} required />
                  </label>

                  <label className="grid gap-3 sm:col-span-2">
                    <span className={profileLabelClass}>Gender</span>
                    <select className={`${profileInputClass} cursor-pointer`} name="gender" defaultValue={student.gender} required>
                      {studentGenderOptions.map((gender) => (
                        <option key={gender} value={gender} className="bg-[#140616] text-white">
                          {gender}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              ) : (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <ProfileDetail icon={UserRoundCheck} label="Full Name" value={student.name} />
                  <ProfileDetail icon={IdCard} label="Username" value={student.username} />
                  <ProfileDetail icon={ShieldCheck} label="Account Role" value={roleLabel(student.accountRole)} />
                  <ProfileDetail icon={BadgeCheck} label="Approval Status" value={statusLabel(student.status)} />
                  <ProfileDetail icon={Mail} label="Email Address" value={student.email} />
                  <ProfileDetail icon={Phone} label="Phone Number" value={student.phone} />
                  <ProfileDetail icon={UserRound} label="Gender" value={student.gender} />
                  <ProfileDetail icon={Cake} label="Age" value={`${student.age} years old`} />
                  <ProfileDetail icon={CalendarDays} label="Date of Birth" value={formatDate(student.dateOfBirth)} />
                  <ProfileDetail icon={Clock3} label="Registered At" value={formatDateTime(student.joinedAt)} />
                </div>
              )}

              {isEditing && (
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                    className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/12 px-6 text-sm font-black text-white/70 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Cancel Edit
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#f0b7ff] px-6 text-sm font-black text-[#17061d] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </form>
          </div>

          <aside className="grid content-start gap-5">
            <section className="rounded-2xl border border-white/10 bg-[#211028] p-5">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0b0310] text-[#f0b7ff]">
                  <ShieldCheck size={23} />
                </span>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-white/48">Role</p>
                  <p className="mt-1 text-xl font-black text-white">{roleLabel(student.accountRole)}</p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-[#211028] p-5">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-white/48">Profile Summary</p>
              <p className="mt-4 text-sm font-semibold leading-7 text-white/66">
                {student.name} registered as a {student.gender.toLowerCase()} student and currently has a{" "}
                <span className="font-black text-[#f0b7ff]">{statusLabel(student.status)}</span> account.
              </p>
            </section>

            <section className="rounded-2xl border border-white/10 bg-[#211028] p-5">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-cyanGlow/14 text-cyanGlow">
                  <ShieldCheck size={23} />
                </span>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-white/48">Account Security</p>
                  <p className="mt-1 text-xl font-black text-white">Protected</p>
                </div>
              </div>

              <div className="mt-5 grid gap-3">
                <ProfileDetail icon={LockKeyhole} label="Password" value="Protected - not viewable" />
                <ProfileDetail icon={ShieldCheck} label="Password Storage" value="Stored as a secure hash" />
              </div>
              <p className="mt-4 rounded-xl border border-cyanGlow/20 bg-cyanGlow/8 px-4 py-3 text-sm font-semibold leading-6 text-white/66">
                Admins can manage student access, but saved passwords are not exposed. Use a reset/change-password flow when a student needs new login credentials.
              </p>

              {isPasswordEditing ? (
                <form className="mt-5 grid gap-4" onSubmit={handlePasswordSubmit}>
                  <label className="grid gap-2">
                    <span className={profileLabelClass}>New Password</span>
                    <input
                      className={profileInputClass}
                      name="password"
                      type="password"
                      minLength={6}
                      placeholder="New password"
                      required
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className={profileLabelClass}>Confirm Password</span>
                    <input
                      className={profileInputClass}
                      name="confirmPassword"
                      type="password"
                      minLength={6}
                      placeholder="Confirm password"
                      required
                    />
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setIsPasswordEditing(false)}
                      disabled={isUpdatingPassword}
                      className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/12 px-4 text-sm font-black text-white/70 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdatingPassword}
                      className="inline-flex min-h-11 items-center justify-center rounded-xl bg-cyanGlow px-4 text-sm font-black text-[#061014] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isUpdatingPassword ? "Updating..." : "Save Password"}
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsPasswordEditing(true)}
                  disabled={isSaving}
                  className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-cyanGlow/35 px-5 text-sm font-black text-cyanGlow transition hover:bg-cyanGlow/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Set New Password
                </button>
              )}
            </section>

            <div className="grid gap-3">
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  disabled={isSaving}
                  className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#f0b7ff] px-6 text-sm font-black text-[#17061d] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Edit Profile
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/12 px-6 text-sm font-black text-white/70 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                Close Profile
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function ProfileDetail({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0b0310] p-4">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2a1232] text-[#f0b7ff]">
          <Icon size={20} />
        </span>
        <div className="min-w-0">
          <p className="text-[0.68rem] font-black uppercase tracking-[0.14em] text-white/42">{label}</p>
          <p className="mt-1 break-words text-sm font-black text-white/82">{value}</p>
        </div>
      </div>
    </div>
  );
}

function toDirectoryStudent(student: StudentRegistration): DirectoryStudent {
  return {
    id: student.id,
    name: student.fullName,
    email: student.email,
    phone: student.phone,
    username: student.username,
    gender: student.gender,
    accountRole: student.accountRole,
    status: student.approvalStatus,
    dateOfBirth: student.dateOfBirth,
    age: getAge(student.dateOfBirth),
    joinedAt: student.createdAt,
    initials: getInitials(student.fullName),
  };
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

function getAge(dateOfBirth: string) {
  const birthDate = new Date(dateOfBirth);

  if (Number.isNaN(birthDate.getTime())) {
    return 0;
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthOffset = today.getMonth() - birthDate.getMonth();

  if (monthOffset < 0 || (monthOffset === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return Math.max(age, 0);
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "recently";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "recently";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function statusLabel(status: StudentApprovalStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function roleLabel(role: DirectoryStudent["accountRole"]) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}
