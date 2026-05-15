import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Edit3,
  Flag,
  Hourglass,
  Sparkles,
  UserRound,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { danceImages } from "../assets/danceImages";
import { getStudentEnrolments } from "../services/enrolmentService";
import { cn } from "../utils/cn";
import {
  getClassSlot,
  getDanceStyle,
  getTeacher,
  readSubmittedEnrolment,
  saveDraft,
  type SubmittedEnrolment,
} from "./StudentEnrolmentPage";

const timelineItems = [
  { title: "Enrolment Submitted", detail: "Application received", icon: CheckCircle2 },
  { title: "Teacher Reviewing", detail: "Currently active", icon: Hourglass },
  { title: "Class Confirmation", detail: "Class placement", icon: UserRound },
  { title: "Final Decision", detail: "Academy decision", icon: Flag },
];

export function StudentEnrolmentStatusPage() {
  const navigate = useNavigate();
  const [application, setApplication] = useState<SubmittedEnrolment | null>(() => readSubmittedEnrolment());

  useEffect(() => {
    let isMounted = true;

    async function loadApplication() {
      try {
        const applications = await getStudentEnrolments();

        if (isMounted) {
          setApplication(applications[0] ?? null);
        }
      } catch {
        if (isMounted) {
          setApplication(readSubmittedEnrolment());
        }
      }
    }

    void loadApplication();

    return () => {
      isMounted = false;
    };
  }, []);

  function handleEditApplication() {
    if (!application) {
      return;
    }

    saveDraft(application.data, 1);
    navigate("/student/enrolment", { state: { resumeDraft: true } });
  }

  if (!application) {
    return (
      <StatusPageShell>
        <section className="mx-auto grid min-h-[calc(100svh-5rem)] max-w-3xl place-items-center">
          <div className="rounded-[2rem] border border-white/12 bg-white/[0.065] p-8 text-center shadow-[0_32px_110px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
            <Sparkles className="mx-auto text-[#f0b7ff]" size={50} />
            <h1 className="mt-6 text-4xl font-black text-[#f0b7ff]">No Enrolment Found</h1>
            <p className="mx-auto mt-4 max-w-xl text-base font-semibold leading-7 text-white/66">
              Start a new enrolment to track your application progress here.
            </p>
            <Link
              to="/student/enrolment"
              className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-gradient-to-r from-[#e8a3ff] to-[#e026b4] px-7 text-sm font-black text-white"
            >
              Start Enrolment
            </Link>
          </div>
        </section>
      </StatusPageShell>
    );
  }

  const selectedStyle = getDanceStyle(application.data);
  const selectedSlot = getClassSlot(application.data);
  const selectedTeacher = getTeacher(application.data);
  const isPending = application.status === "Pending Review";
  const isApproved = application.status === "Approved";
  const isRejected = application.status === "Rejected";

  return (
    <StatusPageShell>
      <section className="mx-auto max-w-7xl pb-12">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-black leading-tight text-[#f0b7ff] sm:text-5xl">My Enrolment Progress</h1>
          <p className="mt-3 max-w-2xl text-base font-semibold leading-7 text-white/70">
            We are currently processing your application. Track your status below as our team verifies your details.
          </p>
        </div>

        <div className="mt-9 grid gap-6 lg:grid-cols-[1fr_24rem]">
          <article className="rounded-[1.35rem] border border-white/10 bg-[#211028]/88 p-7 shadow-[0_24px_90px_rgba(0,0,0,0.32)]">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-cyanGlow">Application Summary</p>
                <h2 className="mt-2 text-3xl font-black text-white">ID: {application.applicationId}</h2>
              </div>
              <StatusBadge status={application.status} />
            </div>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <SummaryStat label="Dance Style" value={selectedStyle?.name ?? "Not selected"} />
              <SummaryStat label="Instructor" value={selectedTeacher?.name ?? "Not selected"} />
              <SummaryStat label="Preferred Time" value={selectedSlot ? `${selectedSlot.className} • ${selectedSlot.day} • ${selectedSlot.time}` : "Not selected"} />
              <SummaryStat label="Submitted On" value={formatDate(application.submittedAt)} />
            </div>

            <div className="mt-8 rounded-2xl border border-white/10 bg-[#0b0310] p-5">
              <h3 className="text-xl font-black text-[#f4e7fb]">Current Status</h3>
              <p className="mt-3 text-sm font-semibold leading-7 text-white/68">
                {isPending && "Your enrolment is currently being reviewed by the selected teacher."}
                {isApproved && "Congratulations! Your enrolment has been accepted by the teacher."}
                {isRejected && "Your enrolment could not be accepted for this class."}
              </p>
            </div>
          </article>

          <aside className="overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#211028] shadow-[0_24px_90px_rgba(0,0,0,0.32)]">
            <img src={danceImages.heroCarousel[0].src} alt="" className="h-56 w-full object-cover opacity-72" />
            <div className="p-6">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-cyanGlow">Did you know?</p>
              <p className="mt-3 text-sm font-semibold leading-7 text-white/68">
                Students who enrol in structured classes build rhythm, confidence, and performance discipline faster.
              </p>
            </div>
          </aside>
        </div>

        <ProgressTimeline status={application.status} />

        {isApproved && (
          <article className="mt-7 rounded-[1.35rem] border border-cyanGlow/35 bg-cyanGlow/10 p-6">
            <h2 className="text-2xl font-black text-cyanGlow">Final Class Details</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryStat label="Dance Style" value={selectedStyle?.name ?? "Not selected"} />
              <SummaryStat label="Teacher" value={selectedTeacher?.name ?? "Not selected"} />
              <SummaryStat label="Date" value={selectedSlot ? `${selectedSlot.day} • ${selectedSlot.time}` : "Not selected"} />
              <SummaryStat label="Class Level" value={selectedSlot?.level ?? "Not selected"} />
            </div>
          </article>
        )}

        {isRejected && (
          <article className="mt-7 rounded-[1.35rem] border border-[#ff7aa8]/35 bg-[#ff7aa8]/10 p-6">
            <h2 className="text-2xl font-black text-[#ffb0c8]">Admin Comment</h2>
            <p className="mt-3 text-sm font-semibold leading-7 text-white/70">
              {application.adminComment ?? "Please review your details and resubmit the application."}
            </p>
          </article>
        )}

        <div className="mt-9 grid gap-4 sm:grid-cols-3">
          <Link
            to="/student/enrolment"
            className="inline-flex min-h-13 items-center justify-center gap-3 rounded-2xl border border-white/12 px-6 text-sm font-black text-white/72 transition hover:border-[#f0b7ff]/45 hover:text-white"
          >
            <ArrowLeft size={19} />
            Back to Enrol
          </Link>
          {(isPending || isRejected) && (
            <button
              type="button"
              onClick={handleEditApplication}
              className="inline-flex min-h-13 items-center justify-center gap-3 rounded-2xl border border-cyanGlow/50 px-6 text-sm font-black text-cyanGlow transition hover:bg-cyanGlow/10"
            >
              <Edit3 size={18} />
              Edit Application
            </button>
          )}
          <Link
            to="/student-dashboard"
            className="inline-flex min-h-13 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#e8a3ff] to-[#e026b4] px-6 text-sm font-black text-white"
          >
            Go to Dashboard
            <ArrowRight size={19} />
          </Link>
        </div>
      </section>
    </StatusPageShell>
  );
}

function StatusPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen overflow-hidden bg-[#0b020f] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(199,45,255,0.23),transparent_28rem),radial-gradient(circle_at_84%_84%,rgba(34,211,238,0.18),transparent_26rem)]" />
      <div className="fixed inset-0 bg-gradient-to-br from-[#1b071f]/90 via-[#0b020f] to-[#001312]" />
      <main className="relative z-10 px-4 py-10 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}

function StatusBadge({ status }: { status: SubmittedEnrolment["status"] }) {
  const isApproved = status === "Approved";
  const isRejected = status === "Rejected";

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.1em]",
        isApproved
          ? "border-cyanGlow/45 bg-cyanGlow/14 text-cyanGlow"
          : isRejected
            ? "border-[#ff7aa8]/45 bg-[#ff7aa8]/12 text-[#ffb0c8]"
            : "border-[#f0b7ff]/35 bg-[#f0b7ff]/12 text-[#f0b7ff]",
      )}
    >
      {isRejected ? <XCircle size={15} /> : <BadgeCheck size={15} />}
      {status}
    </span>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.14em] text-white/42">{label}</p>
      <p className="mt-2 text-xl font-black text-[#f4e7fb]">{value}</p>
    </div>
  );
}

function ProgressTimeline({ status }: { status: SubmittedEnrolment["status"] }) {
  const activeIndex = status === "Approved" ? 3 : status === "Rejected" ? 3 : 1;

  return (
    <article className="mt-7 rounded-[1.35rem] border border-white/10 bg-[#211028]/88 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.32)]">
      <h2 className="flex items-center gap-3 text-2xl font-black text-[#f4e7fb]">
        <Sparkles className="text-[#f0b7ff]" size={24} />
        Application Journey
      </h2>
      <div className="mt-8 grid gap-5 md:grid-cols-4">
        {timelineItems.map((item, index) => {
          const Icon = item.icon as LucideIcon;
          const complete = index < activeIndex || status === "Approved";
          const active = index === activeIndex && status === "Pending Review";
          const rejected = status === "Rejected" && index === 3;

          return (
            <div key={item.title} className="relative rounded-2xl border border-white/10 bg-[#0b0310] p-5 text-center">
              <span
                className={cn(
                  "mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full border",
                  complete || active
                    ? "border-[#f0b7ff] bg-[#f0b7ff] text-[#17061d]"
                    : rejected
                      ? "border-[#ff7aa8] bg-[#ff7aa8]/15 text-[#ffb0c8]"
                      : "border-white/15 text-white/42",
                )}
              >
                <Icon size={21} />
              </span>
              <h3 className="mt-4 text-sm font-black text-white">{item.title}</h3>
              <p className="mt-2 text-xs font-semibold text-white/46">{item.detail}</p>
            </div>
          );
        })}
      </div>
    </article>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
