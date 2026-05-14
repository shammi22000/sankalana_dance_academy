import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CloudUpload,
  FileText,
  ImagePlus,
  LockKeyhole,
  Mail,
  Phone,
  Search,
  ShieldCheck,
  type LucideIcon,
  UserPlus,
  UserRound,
  X,
} from "lucide-react";
import { type ChangeEvent, type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { danceImages } from "../assets/danceImages";
import {
  createTeacherRegistration,
  getTeacherRegistrations,
  updateTeacherApplicationStatus,
  updateTeacherPassword,
} from "../services/adminRegistrationService";
import type { TeacherApplicationStatus, TeacherRegistration, TeacherRegistrationPayload, TeachingDay } from "../types/teacherRegistration";
import { showErrorAlert, showSuccessAlert } from "../utils/alerts";
import { cn } from "../utils/cn";

type DirectoryTeacher = {
  id: string;
  displayId: string;
  name: string;
  email: string;
  phone: string;
  username: string;
  specialty: string;
  status: TeacherApplicationStatus;
  avatar: string;
  badges: string[];
  availabilityCount: number;
  experienceYears: number;
  qualifications: string;
  summary: string;
  availableDays: TeachingDay[];
  avatarFileName?: string;
  portfolioFileName?: string;
  accountRole: "teacher";
  initials: string;
  createdAt: string;
};

const filters = [
  { label: "All", value: "all" as const },
  { label: "Approved", value: "approved" as const },
  { label: "Pending", value: "pending" as const },
  { label: "Rejected", value: "rejected" as const },
];

type FilterValue = (typeof filters)[number]["value"];
type SortValue = "recent" | "name" | "experience" | "availability";

const teachingDays: TeachingDay[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const danceStyleOptions = ["Kandyan Dancing", "Low Country Dancing", "Sabaragamu", "Contemporary"];
const maxAvatarFileSize = 1_000_000;
const avatarFileTypes = ["image/png", "image/jpeg", "image/webp"];
const teachersPerPage = 6;
const modalInputClass =
  "min-h-12 w-full rounded-lg border border-white/10 bg-[#0b0310] px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-white/35 focus:border-[#f0b7ff]/60 focus:ring-2 focus:ring-[#f0b7ff]/20";
const modalLabelClass = "text-xs font-black uppercase tracking-[0.14em] text-[#f0b7ff]";
const modalBackgroundColor = "#16051d";
const modalPanelColor = "#211028";
const modalFieldColor = "#0b0310";

export function TeacherManagementSection() {
  const [teacherRegistrations, setTeacherRegistrations] = useState<TeacherRegistration[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterValue>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortValue>("recent");
  const [isLoadingTeachers, setIsLoadingTeachers] = useState(true);
  const [updatingTeacherId, setUpdatingTeacherId] = useState<string | null>(null);
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [isCreatingTeacher, setIsCreatingTeacher] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTeacher, setSelectedTeacher] = useState<DirectoryTeacher | null>(null);

  useEffect(() => {
    let ignore = false;

    setIsLoadingTeachers(true);
    getTeacherRegistrations()
      .then((teachers) => {
        if (!ignore) {
          setTeacherRegistrations(teachers);
        }
      })
      .catch((error) => {
        if (!ignore) {
          void showErrorAlert(
            "Unable to Load Teachers",
            error instanceof Error ? error.message : "Unable to load teacher registrations.",
          );
        }
      })
      .finally(() => {
        if (!ignore) {
          setIsLoadingTeachers(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const directoryTeachers = useMemo(
    () => {
      const displayIds = new Map(
        [...teacherRegistrations]
          .sort((first, second) => Date.parse(first.createdAt) - Date.parse(second.createdAt))
          .map((teacher, index) => [teacher.id, String(index + 1)]),
      );

      return teacherRegistrations.map((teacher, index) =>
        toDirectoryTeacher(teacher, index, displayIds.get(teacher.id) ?? String(index + 1)),
      );
    },
    [teacherRegistrations],
  );

  const filteredTeachers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return directoryTeachers
      .filter((teacher) => activeFilter === "all" || teacher.status === activeFilter)
      .filter((teacher) => {
        if (!normalizedSearch) {
          return true;
        }

        return `${teacher.displayId} ${teacher.name} ${teacher.specialty} ${teacher.email} ${teacher.username} ${teacher.phone}`
          .toLowerCase()
          .includes(normalizedSearch);
      })
      .sort((first, second) => {
        if (sortBy === "name") {
          return first.name.localeCompare(second.name);
        }

        if (sortBy === "experience") {
          return second.experienceYears - first.experienceYears;
        }

        if (sortBy === "availability") {
          return second.availabilityCount - first.availabilityCount;
        }

        return Date.parse(second.createdAt) - Date.parse(first.createdAt);
      });
  }, [activeFilter, directoryTeachers, searchTerm, sortBy]);

  const counts = {
    all: directoryTeachers.length,
    approved: directoryTeachers.filter((teacher) => teacher.status === "approved").length,
    pending: directoryTeachers.filter((teacher) => teacher.status === "pending").length,
    rejected: directoryTeachers.filter((teacher) => teacher.status === "rejected").length,
  };
  const totalPages = Math.max(1, Math.ceil(filteredTeachers.length / teachersPerPage));
  const paginatedTeachers = filteredTeachers.slice(
    (currentPage - 1) * teachersPerPage,
    currentPage * teachersPerPage,
  );
  const shouldShowPagination = filteredTeachers.length > teachersPerPage;

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter, searchTerm, sortBy]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  async function handleToggleTeacher(teacher: DirectoryTeacher) {
    const nextStatus: TeacherApplicationStatus = teacher.status === "approved" ? "rejected" : "approved";

    setUpdatingTeacherId(teacher.id);

    try {
      const updatedTeacher = await updateTeacherApplicationStatus(teacher.id, nextStatus);

      setTeacherRegistrations((currentTeachers) =>
        currentTeachers.map((currentTeacher) =>
          currentTeacher.id === updatedTeacher.id ? updatedTeacher : currentTeacher,
        ),
      );
      await showSuccessAlert(
        nextStatus === "approved" ? "Teacher Activated" : "Teacher Deactivated",
        `${updatedTeacher.fullName} is now ${statusLabel(updatedTeacher.applicationStatus)}.`,
      );
    } catch (error) {
      await showErrorAlert(
        "Update Failed",
        error instanceof Error ? error.message : "Unable to update teacher status.",
      );
    } finally {
      setUpdatingTeacherId(null);
    }
  }

  async function handleCreateTeacher(payload: TeacherRegistrationPayload) {
    setIsCreatingTeacher(true);

    try {
      const createdTeacher = await createTeacherRegistration(payload);

      setTeacherRegistrations((currentTeachers) => [createdTeacher, ...currentTeachers]);
      setActiveFilter("all");
      setSortBy("recent");
      setCurrentPage(1);
      setIsAddTeacherOpen(false);
      await showSuccessAlert(
        "Teacher Added",
        `${createdTeacher.fullName} has been added and approved for login.`,
      );
    } catch (error) {
      await showErrorAlert(
        "Teacher Not Added",
        error instanceof Error ? error.message : "Unable to create teacher.",
      );
    } finally {
      setIsCreatingTeacher(false);
    }
  }

  return (
    <section className="relative z-10 mx-auto max-w-7xl">
      <div className="flex flex-col gap-6 border-b border-white/10 pb-6 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-4xl font-black leading-none text-[#f0b7ff] sm:text-5xl">Instructor Directory</h1>
          <p className="mt-2 text-sm font-black tracking-[0.05em] text-white/55">Manage registered faculty accounts</p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <label className="flex min-h-12 items-center gap-3 rounded-full border border-white/10 bg-[#1a0a20]/92 px-5 text-white/70 shadow-[0_18px_55px_rgba(0,0,0,0.22)] focus-within:border-orchid/45">
            <Search size={22} className="text-white/50" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full bg-transparent text-sm font-bold text-white outline-none placeholder:text-white/35 sm:w-64"
              placeholder="Search teachers..."
            />
          </label>

          <button
            type="button"
            onClick={() => setIsAddTeacherOpen(true)}
            className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-orchid/35 bg-orchid/35 px-6 text-sm font-black text-[#f3c5ff] shadow-[0_18px_55px_rgba(217,28,255,0.22)] transition hover:bg-orchid/45"
          >
            <UserPlus size={21} />
            Add New Teacher
          </button>
        </div>
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
              <option value="experience" className="bg-[#140616] text-white">Experience</option>
              <option value="availability" className="bg-[#140616] text-white">Availability</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-0 top-2.5 text-white/40" size={17} />
          </span>
        </label>
      </div>

      {isLoadingTeachers ? (
        <div className="mt-8 rounded-[1.35rem] border border-white/[0.12] bg-white/[0.055] p-8 text-sm font-black text-white/65">
          Loading teacher registrations...
        </div>
      ) : filteredTeachers.length === 0 ? (
        <div className="mt-8 rounded-[1.35rem] border border-white/[0.12] bg-white/[0.055] p-8 text-sm font-black text-white/65">
          No teachers match the current filters.
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {paginatedTeachers.map((teacher) => (
            <TeacherCard
              key={teacher.id}
              teacher={teacher}
              onToggle={() => void handleToggleTeacher(teacher)}
              onViewProfile={() => setSelectedTeacher(teacher)}
              isUpdating={updatingTeacherId === teacher.id}
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
            aria-label="Previous teachers page"
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
              aria-label={`Teachers page ${page}`}
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
            aria-label="Next teachers page"
          >
            <ChevronRight size={22} />
          </button>
        </div>
      )}

      {isAddTeacherOpen && (
        <AddTeacherModal
          isSubmitting={isCreatingTeacher}
          onClose={() => setIsAddTeacherOpen(false)}
          onSubmit={handleCreateTeacher}
        />
      )}

      {selectedTeacher && (
        <TeacherProfileModal
          teacher={selectedTeacher}
          onClose={() => setSelectedTeacher(null)}
        />
      )}
    </section>
  );
}

function toDirectoryTeacher(teacher: TeacherRegistration, index: number, displayId: string): DirectoryTeacher {
  const availabilityCount = teacher.availableDays.length;
  const specialty = teacher.danceStyles || "Dance Faculty";
  const applicationStatus = teacher.applicationStatus;

  return {
    id: teacher.id,
    displayId,
    name: teacher.fullName,
    email: teacher.email,
    phone: teacher.phone,
    username: teacher.username,
    specialty,
    status: applicationStatus,
    avatar: teacher.avatarImageDataUrl || danceImages.story[index % danceImages.story.length],
    badges: [
      statusLabel(applicationStatus),
      `${teacher.experienceYears} Years`,
      availabilityCount > 0 ? `${availabilityCount} Days/Wk` : "Availability TBD",
    ],
    availabilityCount,
    experienceYears: teacher.experienceYears,
    qualifications: teacher.qualifications,
    summary: teacher.biography || `${teacher.fullName} teaches ${specialty}.`,
    availableDays: [...teacher.availableDays],
    avatarFileName: teacher.avatarFileName,
    portfolioFileName: teacher.portfolioFileName,
    accountRole: teacher.accountRole,
    initials: getInitials(teacher.fullName),
    createdAt: teacher.createdAt,
  };
}

function TeacherCard({
  teacher,
  onToggle,
  onViewProfile,
  isUpdating,
}: {
  teacher: DirectoryTeacher;
  onToggle: () => void;
  onViewProfile: () => void;
  isUpdating: boolean;
}) {
  const isActive = teacher.status === "approved";
  const muted = teacher.status === "rejected";

  return (
    <article
      className={`min-h-[21rem] rounded-[1.35rem] border p-6 shadow-[0_24px_90px_rgba(0,0,0,0.26)] ${
        muted
          ? "border-white/[0.08] bg-[#0b0d0f]/86 text-white/52"
          : "border-white/[0.12] bg-[#17091d]/88 text-white"
      }`}
    >
      <div className="flex items-start justify-between gap-5">
        <div className="flex min-w-0 gap-4">
          <img
            src={teacher.avatar}
            alt=""
            className={`h-16 w-16 shrink-0 rounded-2xl border border-white/10 object-cover ${muted ? "grayscale" : ""}`}
          />
          <div className="min-w-0">
            <h2 className="text-2xl font-black leading-tight text-[#f4e7fb]">{teacher.name}</h2>
            <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-cyanGlow">{teacher.specialty}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggle}
          disabled={isUpdating}
          className={`relative h-6 w-12 shrink-0 rounded-full transition disabled:cursor-not-allowed disabled:opacity-60 ${
            isActive ? "bg-orchid" : "bg-white/12"
          }`}
          aria-label={`${isActive ? "Deactivate" : "Activate"} ${teacher.name}`}
        >
          <span
            className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${
              isActive ? "left-7" : "left-1"
            }`}
          />
        </button>
      </div>

      <div className="mt-7 flex flex-wrap gap-2">
        {teacher.badges.map((badge) => (
          <span key={badge} className="rounded-md border border-white/10 bg-white/[0.055] px-3 py-2 text-xs font-black text-white/56">
            {badge}
          </span>
        ))}
      </div>

      <p className="mt-7 min-h-20 text-base font-semibold leading-7 text-white/66">{teacher.summary}</p>

      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
        <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-full bg-white/10 px-3 text-xs font-black text-white/70">
          {teacher.initials}
        </span>
        <button
          type="button"
          onClick={onViewProfile}
          className="inline-flex items-center gap-2 text-sm font-black text-[#f0b7ff] transition hover:text-white"
        >
          View Profile
          <ChevronRight size={18} />
        </button>
      </div>
    </article>
  );
}

function TeacherProfileModal({
  teacher,
  onClose,
}: {
  teacher: DirectoryTeacher;
  onClose: () => void;
}) {
  const [isPasswordEditing, setIsPasswordEditing] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const isActive = teacher.status === "approved";
  const profileGroups = [
    {
      title: "Account Details",
      icon: UserRound,
      details: [
        { label: "Teacher ID", value: teacher.displayId },
        { label: "Full Name", value: teacher.name },
        { label: "Username", value: teacher.username },
        { label: "Role", value: teacher.accountRole },
        { label: "Status", value: statusLabel(teacher.status) },
        { label: "Joined", value: formatDateTime(teacher.createdAt) },
      ],
    },
    {
      title: "Contact Details",
      icon: Mail,
      details: [
        { label: "Email Address", value: teacher.email, icon: Mail },
        { label: "Phone Number", value: teacher.phone, icon: Phone },
      ],
    },
    {
      title: "Teaching Details",
      icon: BriefcaseBusiness,
      details: [
        { label: "Dance Style", value: teacher.specialty },
        { label: "Experience", value: `${teacher.experienceYears} years` },
        { label: "Qualifications", value: teacher.qualifications },
        { label: "Available Days", value: teacher.availableDays.join(", ") || "Not set" },
      ],
    },
    {
      title: "Uploaded Files",
      icon: FileText,
      details: [
        { label: "Avatar File", value: teacher.avatarFileName || "Not uploaded" },
        { label: "Portfolio File", value: teacher.portfolioFileName || "Not uploaded" },
      ],
    },
  ];

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setIsUpdatingPassword(true);

    try {
      await updateTeacherPassword(teacher.id, {
        password: String(formData.get("password") ?? ""),
        confirmPassword: String(formData.get("confirmPassword") ?? ""),
      });
      form.reset();
      setIsPasswordEditing(false);
      await showSuccessAlert("Password Updated", `${teacher.name}'s login password has been changed.`);
    } catch (error) {
      await showErrorAlert(
        "Password Not Updated",
        error instanceof Error ? error.message : "Unable to update teacher password.",
      );
    } finally {
      setIsUpdatingPassword(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black px-4 py-6 sm:px-6">
      <div
        className="mx-auto max-w-6xl rounded-[1.35rem] border border-white/12 p-5 shadow-[0_32px_110px_rgba(0,0,0,0.55)] sm:p-7"
        style={{ backgroundColor: modalBackgroundColor }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyanGlow">Teacher Profile</p>
            <h2 className="mt-2 text-3xl font-black text-[#f0b7ff]">View Teacher Details</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/65 transition hover:border-[#f0b7ff]/45 hover:text-[#f0b7ff]"
            aria-label="Close teacher profile"
          >
            <X size={21} />
          </button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[20rem_1fr]">
          <aside className="rounded-2xl border border-white/10 p-6 text-center" style={{ backgroundColor: modalPanelColor }}>
            <img
              src={teacher.avatar}
              alt=""
              className="mx-auto h-36 w-36 rounded-3xl border border-white/10 object-cover shadow-[0_22px_70px_rgba(0,0,0,0.35)]"
            />
            <h3 className="mt-6 text-3xl font-black leading-tight text-[#f4e7fb]">{teacher.name}</h3>
            <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-cyanGlow">{teacher.specialty}</p>

            <span
              className={cn(
                "mt-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.1em]",
                isActive
                  ? "border-cyanGlow/45 bg-cyanGlow/12 text-cyanGlow"
                  : teacher.status === "pending"
                    ? "border-[#f0b7ff]/45 bg-[#f0b7ff]/12 text-[#f0b7ff]"
                    : "border-[#ff7aa8]/45 bg-[#ff7aa8]/12 text-[#ffb0c8]",
              )}
            >
              <BadgeCheck size={15} />
              {statusLabel(teacher.status)}
            </span>

            <div className="mt-7 grid grid-cols-2 gap-3 text-left">
              <ProfileStat label="Experience" value={`${teacher.experienceYears} yrs`} />
              <ProfileStat label="Available" value={`${teacher.availabilityCount} days`} />
            </div>
          </aside>

          <div className="grid gap-5">
            {profileGroups.map((group) => {
              const GroupIcon = group.icon;

              return (
                <section key={group.title} className="rounded-2xl border border-white/10 p-5" style={{ backgroundColor: modalPanelColor }}>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-[#f0b7ff]">
                      <GroupIcon size={22} />
                    </span>
                    <h3 className="text-xl font-black text-[#f4e7fb]">{group.title}</h3>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {group.details.map((detail) => (
                      <TeacherProfileDetail key={`${group.title}-${detail.label}`} detail={detail} />
                    ))}
                  </div>
                </section>
              );
            })}

            <section className="rounded-2xl border border-white/10 p-5" style={{ backgroundColor: modalPanelColor }}>
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-cyanGlow/14 text-cyanGlow">
                  <ShieldCheck size={22} />
                </span>
                <h3 className="text-xl font-black text-[#f4e7fb]">Account Security</h3>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <TeacherProfileDetail
                  detail={{
                    label: "Password",
                    value: "Protected - not viewable",
                    icon: LockKeyhole,
                  }}
                />
                <TeacherProfileDetail
                  detail={{
                    label: "Password Storage",
                    value: "Stored as a secure hash",
                    icon: ShieldCheck,
                  }}
                />
              </div>
              <p className="mt-4 rounded-xl border border-cyanGlow/20 bg-cyanGlow/8 px-4 py-3 text-sm font-semibold leading-6 text-white/66">
                Admins can manage teacher access, but saved passwords are not exposed. Use a password reset/change flow when a teacher needs new login credentials.
              </p>

              {isPasswordEditing ? (
                <form className="mt-5 grid gap-4" onSubmit={handlePasswordSubmit}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <label className="grid gap-2">
                      <span className={modalLabelClass}>New Password</span>
                      <input
                        className={modalInputClass}
                        name="password"
                        type="password"
                        minLength={6}
                        placeholder="New password"
                        required
                      />
                    </label>
                    <label className="grid gap-2">
                      <span className={modalLabelClass}>Confirm Password</span>
                      <input
                        className={modalInputClass}
                        name="confirmPassword"
                        type="password"
                        minLength={6}
                        placeholder="Confirm password"
                        required
                      />
                    </label>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={() => setIsPasswordEditing(false)}
                      disabled={isUpdatingPassword}
                      className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/12 px-5 text-sm font-black text-white/70 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdatingPassword}
                      className="inline-flex min-h-11 items-center justify-center rounded-xl bg-cyanGlow px-5 text-sm font-black text-[#061014] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {isUpdatingPassword ? "Updating..." : "Save Password"}
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsPasswordEditing(true)}
                  className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl border border-cyanGlow/35 px-5 text-sm font-black text-cyanGlow transition hover:bg-cyanGlow/10"
                >
                  Set New Password
                </button>
              )}
            </section>

            <section className="rounded-2xl border border-white/10 p-5" style={{ backgroundColor: modalPanelColor }}>
              <div className="flex items-center gap-3">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-orchid/18 text-[#f0b7ff]">
                  <CalendarDays size={22} />
                </span>
                <h3 className="text-xl font-black text-[#f4e7fb]">Biography</h3>
              </div>
              <p className="mt-5 text-base font-semibold leading-8 text-white/70">{teacher.summary}</p>
            </section>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function TeacherProfileDetail({
  detail,
}: {
  detail: {
    label: string;
    value: string;
    icon?: LucideIcon;
  };
}) {
  const Icon = detail.icon;

  return (
    <div className="rounded-xl border border-white/10 bg-[#0b0310] p-4">
      <div className="flex items-center gap-2 text-white/45">
        {Icon && <Icon size={17} />}
        <p className="text-xs font-black uppercase tracking-[0.12em]">{detail.label}</p>
      </div>
      <p className="mt-3 break-words text-base font-black text-[#f4e7fb]">{detail.value}</p>
    </div>
  );
}

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.06] p-4">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-white/45">{label}</p>
      <p className="mt-2 text-lg font-black text-[#f4e7fb]">{value}</p>
    </div>
  );
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value || "Not available";
  }

  return date.toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function AddTeacherModal({
  isSubmitting,
  onClose,
  onSubmit,
}: {
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: TeacherRegistrationPayload) => Promise<void>;
}) {
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [availableDays, setAvailableDays] = useState<TeachingDay[]>([]);
  const [avatarFileName, setAvatarFileName] = useState("");
  const [avatarPreviewDataUrl, setAvatarPreviewDataUrl] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");

  function toggleTeachingDay(day: TeachingDay) {
    setAvailableDays((currentDays) =>
      currentDays.includes(day)
        ? currentDays.filter((currentDay) => currentDay !== day)
        : [...currentDays, day],
    );
  }

  function handleAvatarAttachment(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];

    if (!file) {
      setAvatarFileName("");
      setAvatarPreviewDataUrl("");
      return;
    }

    if (!avatarFileTypes.includes(file.type)) {
      setAvatarFileName("");
      setAvatarPreviewDataUrl("");
      input.value = "";
      void showErrorAlert("Invalid Image", "Please attach a PNG, JPG, or WebP image.");
      return;
    }

    if (file.size > maxAvatarFileSize) {
      setAvatarFileName("");
      setAvatarPreviewDataUrl("");
      input.value = "";
      void showErrorAlert("Image Too Large", "Avatar image must be smaller than 1 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAvatarFileName(file.name);
        setAvatarPreviewDataUrl(reader.result);
      }
    };

    reader.onerror = () => {
      setAvatarFileName("");
      setAvatarPreviewDataUrl("");
      input.value = "";
      void showErrorAlert("Upload Failed", "Unable to read avatar image.");
    };

    reader.readAsDataURL(file);
  }

  function clearAvatarAttachment() {
    setAvatarFileName("");
    setAvatarPreviewDataUrl("");

    if (avatarInputRef.current) {
      avatarInputRef.current.value = "";
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (availableDays.length === 0) {
      await showErrorAlert("Missing Availability", "Select at least one available teaching day.");
      return;
    }

    const formData = new FormData(event.currentTarget);

    await onSubmit({
      fullName: String(formData.get("fullName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      username: String(formData.get("username") ?? ""),
      danceStyles: String(formData.get("danceStyles") ?? ""),
      experienceYears: Number(formData.get("experienceYears") ?? 0),
      qualifications: String(formData.get("qualifications") ?? ""),
      biography: String(formData.get("biography") ?? ""),
      availableDays,
      avatarFileName: avatarFileName || undefined,
      avatarImageDataUrl: avatarPreviewDataUrl || undefined,
      portfolioFileName: selectedFileName || undefined,
      password: String(formData.get("password") ?? ""),
      confirmPassword: String(formData.get("confirmPassword") ?? ""),
    });
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto px-4 py-6 sm:px-6" style={{ backgroundColor: "#000000" }}>
      <div
        className="mx-auto max-w-5xl rounded-[1.35rem] border border-white/12 p-5 shadow-[0_32px_110px_rgba(0,0,0,0.55)] sm:p-7"
        style={{ backgroundColor: modalBackgroundColor }}
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-cyanGlow">Admin Teacher Setup</p>
            <h2 className="mt-2 text-3xl font-black text-[#f0b7ff]">Add New Teacher</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 text-white/65 transition hover:border-[#f0b7ff]/45 hover:text-[#f0b7ff] disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Close add teacher form"
          >
            <X size={21} />
          </button>
        </div>

        <form className="mt-6 grid gap-6" onSubmit={handleSubmit}>
          <section className="rounded-2xl border border-white/10 p-5" style={{ backgroundColor: modalPanelColor }}>
            <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[15rem_1fr]">
              <div className="grid content-start gap-3">
                <span className={modalLabelClass}>Profile Avatar</span>
                <label
                  className="group grid min-h-[13rem] cursor-pointer place-items-center rounded-2xl border border-dashed border-white/20 p-5 text-center transition hover:border-[#f0b7ff]/60"
                  style={{ backgroundColor: modalFieldColor }}
                >
                  <span
                    className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-white/15"
                    style={{ backgroundColor: modalFieldColor }}
                  >
                    {avatarPreviewDataUrl ? (
                      <img src={avatarPreviewDataUrl} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <ImagePlus className="text-[#f0b7ff]" size={32} />
                    )}
                  </span>
                  <span className="mt-4 block max-w-full truncate text-sm font-semibold text-white/80">
                    {avatarFileName || "Attach profile image"}
                  </span>
                  <span className="mt-2 block text-xs font-bold uppercase tracking-[0.08em] text-white/45">
                    PNG, JPG, or WebP
                  </span>
                  <input
                    ref={avatarInputRef}
                    className="sr-only"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleAvatarAttachment}
                  />
                </label>
                {avatarFileName && (
                  <button
                    type="button"
                    onClick={clearAvatarAttachment}
                    className="inline-flex w-fit items-center gap-2 text-sm font-black text-white/60 transition hover:text-[#f0b7ff]"
                  >
                    <X size={16} />
                    Remove image
                  </button>
                )}
              </div>

              <div className="grid content-start gap-5 sm:grid-cols-2">
                <label className="grid gap-3 sm:col-span-2">
                  <span className={modalLabelClass}>Full Name</span>
                  <input className={modalInputClass} name="fullName" placeholder="Alex Rivers" required />
                </label>

                <label className="grid gap-3">
                  <span className={modalLabelClass}>Email Address</span>
                  <input className={modalInputClass} name="email" type="email" placeholder="alex.rivers@sankalana.com" required />
                </label>

                <label className="grid gap-3">
                  <span className={modalLabelClass}>Phone Number</span>
                  <input className={modalInputClass} name="phone" placeholder="+358 40 000 0000" required />
                </label>

                <label className="grid gap-3">
                  <span className={modalLabelClass}>Username</span>
                  <input className={modalInputClass} name="username" placeholder="alex_teacher" required />
                </label>

                <label className="grid gap-3">
                  <span className={modalLabelClass}>Experience Years</span>
                  <input className={modalInputClass} name="experienceYears" type="number" min={0} placeholder="8" required />
                </label>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 p-5" style={{ backgroundColor: modalPanelColor }}>
            <div className="grid gap-5 lg:grid-cols-3">
              <label className="grid gap-3">
                <span className={modalLabelClass}>Dancing Style</span>
                <select className={`${modalInputClass} cursor-pointer`} name="danceStyles" defaultValue="" required>
                  <option value="" disabled className="bg-[#140618] text-white/50">
                    Select dancing style
                  </option>
                  {danceStyleOptions.map((style) => (
                    <option key={style} value={style} className="bg-[#140618] text-white">
                      {style}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-3 lg:col-span-2">
                <span className={modalLabelClass}>Qualifications</span>
                <input
                  className={modalInputClass}
                  name="qualifications"
                  placeholder="Dance diploma, certified instructor"
                  required
                />
              </label>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_21rem]">
              <label className="grid gap-3">
                <span className={modalLabelClass}>Short Biography</span>
                <textarea
                  className={`${modalInputClass} min-h-[14rem] resize-none leading-7`}
                  name="biography"
                  placeholder="Tell us about their journey, teaching style, and class experience..."
                  required
                />
              </label>

              <div className="grid content-start gap-5">
                <div className="grid gap-3">
                  <span className={modalLabelClass}>Available Teaching Days</span>
                  <div className="flex flex-wrap gap-2">
                    {teachingDays.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleTeachingDay(day)}
                        className={cn(
                          "min-h-10 min-w-12 rounded-full border px-3 text-sm font-black transition",
                          availableDays.includes(day)
                            ? "border-[#f0b7ff] bg-[#f0b7ff] text-[#17061d]"
                            : "border-white/15 bg-[#2a1631] text-white/75 hover:border-[#f0b7ff]/50 hover:text-white",
                        )}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="grid gap-3">
                  <span className={modalLabelClass}>Upload CV / Portfolio</span>
                  <span
                    className="grid min-h-[8rem] cursor-pointer place-items-center rounded-2xl border border-dashed border-white/20 px-5 text-center transition hover:border-[#f0b7ff]/60"
                    style={{ backgroundColor: modalFieldColor }}
                  >
                    <span>
                      <CloudUpload className="mx-auto text-[#f0b7ff]" size={30} />
                      <span className="mt-3 block max-w-full truncate text-sm font-semibold text-white/80">
                        {selectedFileName || "Drop files or browse"}
                      </span>
                      <span className="mt-2 block text-xs font-bold uppercase tracking-[0.08em] text-white/45">
                        PDF, DOCX, or portfolio file
                      </span>
                    </span>
                    <input
                      className="sr-only"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(event) => setSelectedFileName(event.target.files?.[0]?.name ?? "")}
                    />
                  </span>
                </label>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 p-5" style={{ backgroundColor: modalPanelColor }}>
            <div className="grid gap-5 lg:grid-cols-2">
              <label className="grid gap-3">
                <span className={modalLabelClass}>Password</span>
                <input className={modalInputClass} name="password" type="password" minLength={6} placeholder="Password" required />
              </label>

              <label className="grid gap-3">
                <span className={modalLabelClass}>Confirm Password</span>
                <input
                  className={modalInputClass}
                  name="confirmPassword"
                  type="password"
                  minLength={6}
                  placeholder="Confirm password"
                  required
                />
              </label>
            </div>
          </section>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/12 px-6 text-sm font-black text-white/70 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-12 items-center justify-center gap-3 rounded-lg bg-[#f0b7ff] px-7 text-sm font-black text-[#17061d] transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Creating..." : "Create Approved Teacher"}
              <ArrowRight size={21} />
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
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

function statusLabel(status: TeacherApplicationStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}
