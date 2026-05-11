import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  CircleCheck,
  Clock3,
  Edit3,
  Heart,
  Landmark,
  Mail,
  MapPin,
  Music2,
  Phone,
  Plus,
  Save,
  Sparkles,
  UserRound,
  UsersRound,
  WandSparkles,
  Waves,
  type LucideIcon,
} from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { brandAssets } from "../assets/brand";
import { danceImages } from "../assets/danceImages";
import type { StudentAuthentication } from "../types/auth";
import { cn } from "../utils/cn";

type EnrolmentStep = 1 | 2 | 3 | 4 | 5 | 6;

type EnrolmentData = {
  danceStyleId: string;
  slotId: string;
  teacherId: string;
  personal: {
    fullName: string;
    dateOfBirth: string;
    gender: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    emergencyContact: string;
  };
  guardian: {
    fullName: string;
    phone: string;
    email: string;
    relationship: string;
    address: string;
    under18: "Yes" | "No";
  };
  confirmed: boolean;
};

type SubmittedEnrolment = {
  applicationId: string;
  status: "Pending Review" | "Approved" | "Rejected";
  submittedAt: string;
  adminComment?: string;
  data: EnrolmentData;
};

type ValidationErrors = Record<string, string>;

const draftStorageKey = "sankalanaStudentEnrolmentDraft";
const submittedStorageKey = "sankalanaStudentEnrolmentSubmitted";
const studentSessionStorageKey = "sankalanaStudentSession";

const emptyEnrolment: EnrolmentData = {
  danceStyleId: "",
  slotId: "",
  teacherId: "",
  personal: {
    fullName: "",
    dateOfBirth: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    emergencyContact: "",
  },
  guardian: {
    fullName: "",
    phone: "",
    email: "",
    relationship: "",
    address: "",
    under18: "Yes",
  },
  confirmed: false,
};

const steps = [
  "Style",
  "Date & Time",
  "Teacher",
  "Personal",
  "Guardian",
  "Finish",
];

const danceStyles = [
  {
    id: "kandyan",
    name: "Kandyan Dance",
    icon: Landmark,
    tone: "orchid",
    description: "A rhythmic Sri Lankan classical style with graceful footwork and powerful drum-led movement.",
  },
  {
    id: "bharatanatyam",
    name: "Bharatanatyam",
    icon: WandSparkles,
    tone: "cyan",
    description: "A classical Indian dance form focused on expression, storytelling, posture, and precision.",
  },
  {
    id: "hip-hop",
    name: "Hip Hop",
    icon: Music2,
    tone: "pink",
    description: "High-energy urban choreography with rhythm, groove, popping, locking, and freestyle movement.",
  },
  {
    id: "ballet",
    name: "Ballet",
    icon: Sparkles,
    tone: "orchid",
    description: "A foundation of balance, discipline, elegance, posture, and refined stage technique.",
  },
  {
    id: "contemporary",
    name: "Contemporary",
    icon: Waves,
    tone: "cyan",
    description: "A fluid modern style exploring emotion, release, floor work, and expressive movement.",
  },
  {
    id: "other",
    name: "Other",
    icon: Plus,
    tone: "pink",
    description: "Ask about workshops, fusion classes, private coaching, or seasonal academy programs.",
  },
];

const classSlots = [
  {
    id: "mon-1600",
    day: "Monday",
    time: "4:00 PM - 5:30 PM",
    seats: 3,
    level: "Beginner",
    studio: "Studio A",
  },
  {
    id: "wed-1700",
    day: "Wednesday",
    time: "5:00 PM - 6:30 PM",
    seats: 12,
    level: "Intermediate",
    studio: "Grand Hall",
  },
  {
    id: "sat-0900",
    day: "Saturday",
    time: "9:00 AM - 10:30 AM",
    seats: 8,
    level: "Advanced",
    studio: "Studio C",
  },
  {
    id: "sun-1000",
    day: "Sunday",
    time: "10:00 AM - 11:30 AM",
    seats: 10,
    level: "Beginner",
    studio: "Studio B",
  },
];

const teachers = [
  {
    id: "anjali",
    name: "Ms. Anjali Perera",
    specialization: "Kandyan Dance",
    experience: "8 years experience",
    students: "320+",
    time: "Monday 4:00 PM",
    image: danceImages.story[0],
    bio: "A graceful classical instructor focused on posture, rhythm, and confident stage presence.",
  },
  {
    id: "kavindu",
    name: "Mr. Kavindu Silva",
    specialization: "Hip Hop",
    experience: "5 years experience",
    students: "180+",
    time: "Wednesday 5:00 PM",
    image: danceImages.story[1],
    bio: "Brings high-energy urban choreography with a friendly beginner-focused teaching style.",
  },
  {
    id: "nethmi",
    name: "Ms. Nethmi Fernando",
    specialization: "Ballet",
    experience: "6 years experience",
    students: "240+",
    time: "Saturday 9:00 AM",
    image: danceImages.story[2],
    bio: "Builds disciplined technique, balance, and expressive performance habits for young dancers.",
  },
];

function getDanceStyle(data: EnrolmentData) {
  return danceStyles.find((style) => style.id === data.danceStyleId);
}

function getClassSlot(data: EnrolmentData) {
  return classSlots.find((slot) => slot.id === data.slotId);
}

function getTeacher(data: EnrolmentData) {
  return teachers.find((teacher) => teacher.id === data.teacherId);
}

function readStudentSession(): StudentAuthentication | null {
  const storedSession = localStorage.getItem(studentSessionStorageKey);

  if (!storedSession) {
    return null;
  }

  try {
    return JSON.parse(storedSession) as StudentAuthentication;
  } catch {
    localStorage.removeItem(studentSessionStorageKey);
    return null;
  }
}

function normalizeProfileGender(gender: string): EnrolmentData["personal"]["gender"] {
  return gender === "Male" || gender === "Female" || gender === "Other" ? gender : "";
}

function getProfilePersonalInfo(): Partial<EnrolmentData["personal"]> {
  const session = readStudentSession();

  if (!session) {
    return {};
  }

  return {
    fullName: session.student.fullName,
    dateOfBirth: session.student.dateOfBirth,
    gender: normalizeProfileGender(session.student.gender),
    phone: session.student.phone,
    email: session.student.email,
  };
}

function createInitialEnrolmentData(): EnrolmentData {
  return {
    ...emptyEnrolment,
    personal: {
      ...emptyEnrolment.personal,
      ...getProfilePersonalInfo(),
    },
  };
}

function fillMissingProfilePersonalInfo(data: EnrolmentData): EnrolmentData {
  const profile = getProfilePersonalInfo();

  return {
    ...data,
    personal: {
      ...data.personal,
      fullName: data.personal.fullName || profile.fullName || "",
      dateOfBirth: data.personal.dateOfBirth || profile.dateOfBirth || "",
      gender: data.personal.gender || profile.gender || "",
      phone: data.personal.phone || profile.phone || "",
      email: data.personal.email || profile.email || "",
    },
  };
}

function readDraft(): { data: EnrolmentData; step: EnrolmentStep } | null {
  const storedDraft = localStorage.getItem(draftStorageKey);

  if (!storedDraft) {
    return null;
  }

  try {
    return JSON.parse(storedDraft) as { data: EnrolmentData; step: EnrolmentStep };
  } catch {
    localStorage.removeItem(draftStorageKey);
    return null;
  }
}

function saveDraft(data: EnrolmentData, step: EnrolmentStep) {
  localStorage.setItem(draftStorageKey, JSON.stringify({ data, step }));
}

function readSubmittedEnrolment(): SubmittedEnrolment | null {
  const storedApplication = localStorage.getItem(submittedStorageKey);

  if (!storedApplication) {
    return null;
  }

  try {
    return JSON.parse(storedApplication) as SubmittedEnrolment;
  } catch {
    localStorage.removeItem(submittedStorageKey);
    return null;
  }
}

function getApplicationId() {
  const year = new Date().getFullYear();
  const existing = readSubmittedEnrolment();

  return existing?.applicationId ?? `ENR-${year}-001`;
}

function validateStep(step: EnrolmentStep, data: EnrolmentData): ValidationErrors {
  const errors: ValidationErrors = {};

  if (step === 1 && !data.danceStyleId) {
    errors.danceStyleId = "Please select a dance style to continue.";
  }

  if (step === 2 && !data.slotId) {
    errors.slotId = "Please select a class date and time.";
  }

  if (step === 3 && !data.teacherId) {
    errors.teacherId = "Please select a teacher to continue.";
  }

  if (step === 4) {
    if (!data.personal.fullName.trim()) errors.fullName = "Enter your full name.";
    if (!data.personal.dateOfBirth) errors.dateOfBirth = "Date of birth is required.";
    if (!data.personal.gender) errors.gender = "Gender is required.";
    if (!/^\+?\d[\d\s-]{6,}$/.test(data.personal.phone.trim())) errors.phone = "Enter a valid phone number.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.personal.email.trim())) errors.email = "Enter a valid email address.";
    if (!data.personal.address.trim()) errors.address = "Enter your address.";
  }

  if (step === 5) {
    if (!data.guardian.fullName.trim()) errors.guardianFullName = "Enter guardian full name.";
    if (!/^\+?\d[\d\s-]{6,}$/.test(data.guardian.phone.trim())) errors.guardianPhone = "Enter guardian phone number.";
    if (!data.guardian.relationship) errors.relationship = "Select relationship.";
  }

  if (step === 6 && !data.confirmed) {
    errors.confirmed = "Confirm the information before submitting.";
  }

  return errors;
}

function createSubmittedEnrolment(data: EnrolmentData): SubmittedEnrolment {
  return {
    applicationId: getApplicationId(),
    status: "Pending Review",
    submittedAt: new Date().toISOString(),
    data,
  };
}

export function StudentEnrolmentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [phase, setPhase] = useState<"start" | "steps" | "success">("start");
  const [step, setStep] = useState<EnrolmentStep>(1);
  const [data, setData] = useState<EnrolmentData>(() => createInitialEnrolmentData());
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [notice, setNotice] = useState("");
  const [submitted, setSubmitted] = useState<SubmittedEnrolment | null>(null);

  useEffect(() => {
    const shouldResume = (location.state as { resumeDraft?: boolean } | null)?.resumeDraft;

    if (shouldResume) {
      continueDraft();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectedStyle = getDanceStyle(data);
  const selectedSlot = getClassSlot(data);
  const selectedTeacher = getTeacher(data);

  function updateData(updater: (current: EnrolmentData) => EnrolmentData) {
    setData((current) => updater(current));
    setErrors({});
    setNotice("");
  }

  function startNew() {
    setData(createInitialEnrolmentData());
    setStep(1);
    setPhase("steps");
    setErrors({});
    setNotice("");
  }

  function continueDraft() {
    const draft = readDraft();

    if (!draft) {
      setNotice("No saved enrolment draft was found.");
      return;
    }

    setData(fillMissingProfilePersonalInfo(draft.data));
    setStep(draft.step);
    setPhase("steps");
    setErrors({});
    setNotice("Saved draft restored.");
  }

  function handleSaveDraft() {
    saveDraft(data, step);
    setNotice("Draft saved on this device.");
  }

  function goBack() {
    if (step === 1) {
      setPhase("start");
      return;
    }

    setStep((current) => Math.max(1, current - 1) as EnrolmentStep);
    setErrors({});
  }

  function goNext() {
    const nextErrors = validateStep(step, data);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (step === 6) {
      const application = createSubmittedEnrolment(data);

      localStorage.setItem(submittedStorageKey, JSON.stringify(application));
      localStorage.removeItem(draftStorageKey);
      setSubmitted(application);
      setPhase("success");
      return;
    }

    setStep((current) => Math.min(6, current + 1) as EnrolmentStep);
    setErrors({});
  }

  function goToStep(targetStep: EnrolmentStep) {
    setStep(targetStep);
    setPhase("steps");
    setErrors({});
  }

  if (phase === "success" && submitted) {
    return <EnrolmentSuccess application={submitted} />;
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#0b020f] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(199,45,255,0.24),transparent_30rem),radial-gradient(circle_at_84%_82%,rgba(34,211,238,0.16),transparent_26rem)]" />
      <div className="fixed inset-0 bg-gradient-to-br from-[#1b071f]/90 via-[#0b020f] to-[#001312]" />

      <main className="relative z-10 mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {phase === "start" ? (
          <EnrolmentStart notice={notice} onStart={startNew} onContinue={continueDraft} />
        ) : (
          <>
            <EnrolmentStepper currentStep={step} />
            <div className="pb-28">
              {step === 1 && (
                <DanceStyleStep
                  value={data.danceStyleId}
                  error={errors.danceStyleId}
                  onSelect={(danceStyleId) => updateData((current) => ({ ...current, danceStyleId }))}
                />
              )}
              {step === 2 && (
                <DateTimeStep
                  selectedStyle={selectedStyle}
                  value={data.slotId}
                  error={errors.slotId}
                  onChangeStyle={() => goToStep(1)}
                  onSelect={(slotId) => updateData((current) => ({ ...current, slotId }))}
                />
              )}
              {step === 3 && (
                <TeacherStep
                  selectedStyle={selectedStyle}
                  selectedSlot={selectedSlot}
                  value={data.teacherId}
                  error={errors.teacherId}
                  onSelect={(teacherId) => updateData((current) => ({ ...current, teacherId }))}
                />
              )}
              {step === 4 && (
                <PersonalInfoStep
                  value={data.personal}
                  errors={errors}
                  onChange={(personal) => updateData((current) => ({ ...current, personal }))}
                />
              )}
              {step === 5 && (
                <GuardianDetailsStep
                  value={data.guardian}
                  errors={errors}
                  onChange={(guardian) => updateData((current) => ({ ...current, guardian }))}
                />
              )}
              {step === 6 && (
                <ReviewFinishStep
                  data={data}
                  selectedStyle={selectedStyle}
                  selectedSlot={selectedSlot}
                  selectedTeacher={selectedTeacher}
                  error={errors.confirmed}
                  onEdit={goToStep}
                  onConfirm={(confirmed) => updateData((current) => ({ ...current, confirmed }))}
                />
              )}
            </div>

            {notice && (
              <p className="fixed bottom-24 left-1/2 z-30 -translate-x-1/2 rounded-full border border-cyanGlow/35 bg-[#0b1518] px-5 py-3 text-sm font-black text-cyanGlow shadow-[0_0_35px_rgba(34,211,238,0.16)]">
                {notice}
              </p>
            )}

            <StepActions
              step={step}
              canSubmit={step !== 6 || data.confirmed}
              onBack={goBack}
              onSaveDraft={handleSaveDraft}
              onNext={goNext}
            />
          </>
        )}
      </main>
    </div>
  );
}

function EnrolmentStart({
  notice,
  onStart,
  onContinue,
}: {
  notice: string;
  onStart: () => void;
  onContinue: () => void;
}) {
  return (
    <section className="grid min-h-[calc(100svh-4rem)] place-items-center">
      <div className="w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/12 bg-white/[0.065] shadow-[0_32px_110px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
        <div className="grid gap-0 lg:grid-cols-[1fr_24rem]">
          <div className="p-6 sm:p-9 lg:p-12">
            <span className="inline-flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl border border-[#f0b7ff]/35 bg-black shadow-[0_0_35px_rgba(217,28,255,0.2)]">
              <img src={brandAssets.logo} alt="Sankalana logo" className="h-full w-full object-cover" />
            </span>

            <p className="mt-9 text-xs font-black uppercase tracking-[0.28em] text-cyanGlow">Registration Process</p>
            <h1 className="mt-4 text-5xl font-black leading-none text-[#f0b7ff] sm:text-6xl">
              Student Enrolment
            </h1>
            <p className="mt-5 max-w-2xl text-lg font-semibold leading-8 text-white/70">
              Start your dance journey by choosing your preferred dance style, class time, and teacher.
            </p>

            <div className="mt-8 rounded-2xl border border-white/10 bg-[#211028] p-5">
              <p className="text-base font-semibold leading-7 text-white/70">
                Complete six simple steps, save your progress any time, and submit your enrolment for academy review.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {steps.map((label, index) => (
                  <div key={label} className="flex items-center gap-3 rounded-xl bg-[#0b0310] px-4 py-3">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#f0b7ff] text-xs font-black text-[#17061d]">
                      {index + 1}
                    </span>
                    <span className="text-sm font-black text-white/74">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {notice && <p className="mt-5 text-sm font-black text-cyanGlow">{notice}</p>}

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                onClick={onStart}
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#e8a3ff] via-[#c026ff] to-[#e026b4] px-8 text-base font-black text-white shadow-[0_22px_55px_rgba(217,28,255,0.34)] transition hover:-translate-y-0.5"
              >
                Start Enrolment
                <ArrowRight size={22} />
              </button>
              <button
                type="button"
                onClick={onContinue}
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl border border-cyanGlow/45 px-8 text-base font-black text-cyanGlow transition hover:bg-cyanGlow/10"
              >
                Continue Saved Enrolment
              </button>
            </div>
          </div>

          <aside className="relative min-h-96 overflow-hidden border-t border-white/10 lg:border-l lg:border-t-0">
            <img src={danceImages.heroCarousel[2].src} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#16051d] via-[#16051d]/72 to-transparent" />
            <div className="absolute bottom-0 p-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyanGlow">Sankalana Academy</p>
              <h2 className="mt-3 text-3xl font-black text-white">Choose your path with confidence.</h2>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function EnrolmentStepper({ currentStep }: { currentStep: EnrolmentStep }) {
  return (
    <div className="mb-8 border-b border-white/10 pb-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-[#f0b7ff]/35 bg-[#f0b7ff]/16 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#f0b7ff]">
            Step {currentStep} of 6
          </span>
          <span className="hidden text-sm font-black uppercase tracking-[0.18em] text-white/40 sm:inline">
            Student Enrolment
          </span>
        </div>
        <div className="grid grid-cols-6 gap-2 lg:w-[34rem]">
          {steps.map((label, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber <= currentStep;

            return (
              <div key={label} className="grid gap-2">
                <div className={`h-1.5 rounded-full ${isActive ? "bg-[#f0b7ff]" : "bg-white/14"}`} />
                <span className="hidden text-center text-[0.65rem] font-black uppercase tracking-[0.08em] text-white/42 sm:block">
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DanceStyleStep({
  value,
  error,
  onSelect,
}: {
  value: string;
  error?: string;
  onSelect: (danceStyleId: string) => void;
}) {
  return (
    <StepShell
      eyebrow="Step 1 of 6"
      title="Choose Your Dance Style"
      subtitle="Select the discipline that resonates with your soul. Each path at Sankalana is designed to nurture technique, expression, and mastery."
      error={error}
    >
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {danceStyles.map((style) => (
          <SelectableCard
            key={style.id}
            selected={value === style.id}
            icon={style.icon}
            title={style.name}
            description={style.description}
            buttonLabel={value === style.id ? "Selected" : "Select"}
            tone={style.tone}
            onClick={() => onSelect(style.id)}
          />
        ))}
      </div>
    </StepShell>
  );
}

function DateTimeStep({
  selectedStyle,
  value,
  error,
  onChangeStyle,
  onSelect,
}: {
  selectedStyle?: (typeof danceStyles)[number];
  value: string;
  error?: string;
  onChangeStyle: () => void;
  onSelect: (slotId: string) => void;
}) {
  return (
    <StepShell eyebrow="Step 2 of 6" title="Select Date & Time" error={error}>
      <SummaryBanner
        label="Current Selection"
        title={selectedStyle?.name ?? "No dance style selected"}
        meta="90 Minutes • Academy class placement"
        image={danceImages.heroCarousel[0].src}
        actionLabel="Change Style"
        onAction={onChangeStyle}
      />

      <div className="mt-10 grid gap-7 lg:grid-cols-[24rem_1fr]">
        <div className="rounded-[1.35rem] border border-white/10 bg-[#211028] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-white">Class Week</h3>
            <CalendarDays className="text-[#f0b7ff]" size={27} />
          </div>
          <div className="mt-7 grid grid-cols-4 gap-3 text-center">
            {["Mon", "Wed", "Sat", "Sun"].map((day) => (
              <span key={day} className="rounded-2xl border border-white/10 bg-[#0b0310] px-4 py-5 text-sm font-black text-white/72">
                {day}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-3xl font-black text-[#f4e7fb]">Available Class Slots</h3>
          <div className="mt-6 grid gap-5">
            {classSlots.map((slot) => {
              const selected = value === slot.id;

              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => onSelect(slot.id)}
                  className={cn(
                    "grid gap-5 rounded-[1.35rem] border p-6 text-left transition sm:grid-cols-[1fr_auto] sm:items-center",
                    selected
                      ? "border-cyanGlow bg-cyanGlow/12 shadow-[0_0_35px_rgba(34,211,238,0.25)]"
                      : "border-white/10 bg-[#17091d]/88 hover:border-cyanGlow/45",
                  )}
                >
                  <div>
                    <p className={cn("text-2xl font-black", selected ? "text-cyanGlow" : "text-[#f4e7fb]")}>{slot.time}</p>
                    <p className="mt-3 text-base font-black text-white/60">
                      {slot.day} • {slot.studio}
                    </p>
                  </div>
                  <div className="grid gap-3 sm:justify-items-end">
                    <span className="rounded-full bg-[#1f6770] px-4 py-2 text-xs font-black text-cyanGlow">
                      Level: {slot.level}
                    </span>
                    <span className="text-sm font-black text-white/70">{slot.seats} seats available</span>
                    {selected && <CircleCheck className="text-cyanGlow" size={34} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </StepShell>
  );
}

function TeacherStep({
  selectedStyle,
  selectedSlot,
  value,
  error,
  onSelect,
}: {
  selectedStyle?: (typeof danceStyles)[number];
  selectedSlot?: (typeof classSlots)[number];
  value: string;
  error?: string;
  onSelect: (teacherId: string) => void;
}) {
  return (
    <StepShell eyebrow="Step 3 of 6" title="Select Your Teacher" error={error}>
      <div className="rounded-[1.35rem] border-l-4 border-cyanGlow bg-[#211028] p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <SummaryItem icon={Sparkles} label="Course Style" value={selectedStyle?.name ?? "Not selected"} />
          <SummaryItem icon={CalendarDays} label="Schedule" value={selectedSlot ? `${selectedSlot.day} • ${selectedSlot.time}` : "Not selected"} />
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {teachers.map((teacher) => {
          const selected = value === teacher.id;

          return (
            <article
              key={teacher.id}
              className={cn(
                "overflow-hidden rounded-[1.35rem] border bg-[#17091d] shadow-[0_24px_90px_rgba(0,0,0,0.28)] transition",
                selected ? "border-[#f0b7ff] shadow-[0_0_40px_rgba(217,28,255,0.24)]" : "border-white/10",
              )}
            >
              <div className="relative h-60">
                <img src={teacher.image} alt="" className="h-full w-full object-cover grayscale" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#17091d] via-transparent to-transparent" />
                {selected && <CircleCheck className="absolute right-5 top-5 rounded-full bg-orchid text-[#f0b7ff]" size={36} />}
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h3 className="text-2xl font-black text-white">{teacher.name}</h3>
                  <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-cyanGlow">{teacher.specialization}</p>
                </div>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-3 text-sm font-black text-white/62">
                  <p>Experience<br /><span className="text-lg text-white">{teacher.experience.split(" ")[0]} Years</span></p>
                  <p>Students<br /><span className="text-lg text-white">{teacher.students}</span></p>
                </div>
                <p className="mt-5 min-h-20 text-base font-semibold leading-7 text-white/66">{teacher.bio}</p>
                <p className="mt-3 text-sm font-black text-white/52">{teacher.time}</p>
                <button
                  type="button"
                  onClick={() => onSelect(teacher.id)}
                  className={cn(
                    "mt-6 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl text-sm font-black transition",
                    selected
                      ? "bg-gradient-to-r from-[#e8a3ff] to-[#c026ff] text-white"
                      : "border border-cyanGlow text-cyanGlow hover:bg-cyanGlow/10",
                  )}
                >
                  {selected ? "Selected" : "Select Teacher"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </StepShell>
  );
}

function PersonalInfoStep({
  value,
  errors,
  onChange,
}: {
  value: EnrolmentData["personal"];
  errors: ValidationErrors;
  onChange: (value: EnrolmentData["personal"]) => void;
}) {
  function setField(field: keyof EnrolmentData["personal"], fieldValue: string) {
    onChange({ ...value, [field]: fieldValue });
  }

  return (
    <StepShell
      eyebrow="Registration Process"
      title="Personal Information"
      subtitle="Provide the details needed to identify and contact the enrolling student."
    >
      <div className="rounded-[1.35rem] border border-white/10 bg-[#211028]/86 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.28)] sm:p-8">
        <div className="grid gap-6 md:grid-cols-2">
          <FormInput label="Full Name *" value={value.fullName} error={errors.fullName} placeholder="Enter your legal name" onChange={(next) => setField("fullName", next)} />
          <FormInput label="Date of Birth *" type="date" value={value.dateOfBirth} error={errors.dateOfBirth} onChange={(next) => setField("dateOfBirth", next)} />
          <FormSelect label="Gender *" value={value.gender} error={errors.gender} options={["Male", "Female", "Other"]} placeholder="Select gender" onChange={(next) => setField("gender", next)} />
          <FormInput label="Phone Number *" value={value.phone} error={errors.phone} placeholder="0771234567" helper="Example: 0771234567" onChange={(next) => setField("phone", next)} />
          <FormInput label="Email Address *" type="email" value={value.email} error={errors.email} placeholder="student@email.com" helper="Example: student@email.com" onChange={(next) => setField("email", next)} />
          <FormInput label="Address *" value={value.address} error={errors.address} placeholder="Street name, building number" className="md:col-span-2" onChange={(next) => setField("address", next)} />
          <FormInput label="City" value={value.city} placeholder="Your city" onChange={(next) => setField("city", next)} />
          <FormInput label="Emergency Contact Number" value={value.emergencyContact} placeholder="0779876543" onChange={(next) => setField("emergencyContact", next)} />
        </div>
      </div>
    </StepShell>
  );
}

function GuardianDetailsStep({
  value,
  errors,
  onChange,
}: {
  value: EnrolmentData["guardian"];
  errors: ValidationErrors;
  onChange: (value: EnrolmentData["guardian"]) => void;
}) {
  function setField(field: keyof EnrolmentData["guardian"], fieldValue: string) {
    onChange({ ...value, [field]: fieldValue });
  }

  return (
    <StepShell
      eyebrow="Step 5 of 6"
      title="Guardian Details"
      subtitle="Guardian details are required for students under 18 and useful for emergency contact."
    >
      <div className="grid gap-7 lg:grid-cols-[1fr_22rem]">
        <div className="rounded-[1.35rem] border border-white/10 bg-[#211028]/86 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.28)] sm:p-8">
          <div className="rounded-2xl border border-white/10 bg-[#312137] p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-cyanGlow/18 text-cyanGlow">
                  <UsersRound size={27} />
                </span>
                <div>
                  <h3 className="text-xl font-black text-cyanGlow">Student Status</h3>
                  <p className="text-sm font-semibold text-white/64">Is the student under 18 years of age?</p>
                </div>
              </div>
              <div className="flex gap-2">
                {(["Yes", "No"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setField("under18", option)}
                    className={cn(
                      "rounded-full px-4 py-2 text-xs font-black transition",
                      value.under18 === option ? "bg-[#f0b7ff] text-[#17061d]" : "bg-[#0b0310] text-white/62",
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-7 grid gap-6 md:grid-cols-2">
            <FormInput label="Guardian Full Name *" value={value.fullName} error={errors.guardianFullName} placeholder="e.g. Elena Rodriguez" onChange={(next) => setField("fullName", next)} />
            <FormSelect label="Relationship *" value={value.relationship} error={errors.relationship} options={["Mother", "Father", "Guardian", "Other"]} placeholder="Select relationship" onChange={(next) => setField("relationship", next)} />
            <FormInput label="Guardian Phone Number *" value={value.phone} error={errors.guardianPhone} placeholder="+94 77 000 0000" onChange={(next) => setField("phone", next)} />
            <FormInput label="Guardian Email" type="email" value={value.email} placeholder="guardian@example.com" onChange={(next) => setField("email", next)} />
            <FormInput label="Guardian Address" value={value.address} placeholder="Street address, city" className="md:col-span-2" onChange={(next) => setField("address", next)} />
          </div>
        </div>

        <aside className="grid content-start gap-6">
          <div className="rounded-[1.35rem] border border-cyanGlow/40 bg-[#211028]/86 p-6">
            <h3 className="flex items-center gap-3 text-xl font-black text-cyanGlow">
              <Heart size={22} />
              Legal Requirements
            </h3>
            <p className="mt-5 text-sm font-semibold leading-7 text-white/68">
              Guardian details help the academy contact a responsible adult for safety, consent, and urgent updates.
            </p>
          </div>
          <img src={danceImages.heroCarousel[3]?.src ?? danceImages.heroCarousel[0].src} alt="" className="h-56 rounded-[1.35rem] object-cover opacity-75" />
        </aside>
      </div>
    </StepShell>
  );
}

function ReviewFinishStep({
  data,
  selectedStyle,
  selectedSlot,
  selectedTeacher,
  error,
  onEdit,
  onConfirm,
}: {
  data: EnrolmentData;
  selectedStyle?: (typeof danceStyles)[number];
  selectedSlot?: (typeof classSlots)[number];
  selectedTeacher?: (typeof teachers)[number];
  error?: string;
  onEdit: (step: EnrolmentStep) => void;
  onConfirm: (confirmed: boolean) => void;
}) {
  return (
    <StepShell title="Review & Finish" subtitle="Please check your enrolment details before submitting." error={error}>
      <div className="grid gap-5 md:grid-cols-2">
        <ReviewCard icon={Sparkles} title="Selected Dance Style" onEdit={() => onEdit(1)}>
          <p className="font-black text-white">{selectedStyle?.name ?? "Not selected"}</p>
        </ReviewCard>
        <ReviewCard icon={CalendarDays} title="Selected Date & Time" onEdit={() => onEdit(2)}>
          <p className="font-black text-white">{selectedSlot ? `${selectedSlot.day} • ${selectedSlot.time}` : "Not selected"}</p>
          <p className="mt-1 text-sm text-white/52">{selectedSlot ? `${selectedSlot.seats} seats • ${selectedSlot.level}` : ""}</p>
        </ReviewCard>
        <ReviewCard icon={UserRound} title="Selected Teacher" onEdit={() => onEdit(3)}>
          <p className="font-black text-white">{selectedTeacher?.name ?? "Not selected"}</p>
          <p className="mt-1 text-sm text-white/52">{selectedTeacher ? `${selectedTeacher.specialization} • ${selectedTeacher.experience}` : ""}</p>
        </ReviewCard>
        <ReviewCard icon={BadgeCheck} title="Personal Information" onEdit={() => onEdit(4)}>
          <p className="font-black text-white">{data.personal.fullName}</p>
          <p className="mt-1 text-sm text-white/52">{data.personal.email}</p>
          <p className="mt-1 text-sm text-white/52">{data.personal.phone}</p>
          <p className="mt-1 text-sm text-white/52">{data.personal.address}</p>
        </ReviewCard>
        <ReviewCard icon={UsersRound} title="Guardian Details" onEdit={() => onEdit(5)} className="md:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <p><span className="block text-xs font-black uppercase tracking-[0.12em] text-white/42">Name</span><span className="font-black text-white">{data.guardian.fullName}</span></p>
            <p><span className="block text-xs font-black uppercase tracking-[0.12em] text-white/42">Contact</span><span className="font-black text-white">{data.guardian.phone}</span></p>
            <p><span className="block text-xs font-black uppercase tracking-[0.12em] text-white/42">Email</span><span className="font-black text-white">{data.guardian.email || "Not provided"}</span></p>
            <p><span className="block text-xs font-black uppercase tracking-[0.12em] text-white/42">Relationship</span><span className="font-black text-white">{data.guardian.relationship}</span></p>
          </div>
        </ReviewCard>
      </div>

      <label className="mt-8 flex cursor-pointer items-center gap-4 rounded-[1.35rem] border border-white/10 bg-[#211028] p-6">
        <input
          type="checkbox"
          checked={data.confirmed}
          onChange={(event) => onConfirm(event.target.checked)}
          className="h-5 w-5 accent-[#e026b4]"
        />
        <span className="text-sm font-black text-white/78">I confirm that the information provided is accurate.</span>
      </label>
    </StepShell>
  );
}

function EnrolmentSuccess({ application }: { application: SubmittedEnrolment }) {
  const selectedStyle = getDanceStyle(application.data);
  const selectedSlot = getClassSlot(application.data);
  const selectedTeacher = getTeacher(application.data);

  return (
    <div className="min-h-screen overflow-hidden bg-[#0b020f] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(199,45,255,0.24),transparent_30rem),radial-gradient(circle_at_76%_78%,rgba(34,211,238,0.18),transparent_26rem)]" />
      <main className="relative z-10 grid min-h-screen place-items-center px-4 py-10">
        <section className="w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/12 bg-white/[0.065] p-7 text-center shadow-[0_32px_110px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:p-10">
          <span className="mx-auto inline-flex h-24 w-24 items-center justify-center rounded-full border border-cyanGlow bg-cyanGlow/12 text-cyanGlow shadow-[0_0_45px_rgba(34,211,238,0.28)]">
            <CheckCircle2 size={48} />
          </span>
          <h1 className="mx-auto mt-8 max-w-xl text-4xl font-black leading-tight text-[#f4e7fb] sm:text-5xl">
            Enrolment Submitted Successfully
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base font-semibold leading-7 text-white/68">
            Your enrolment request has been submitted and is waiting for admin review.
          </p>

          <div className="mx-auto mt-8 grid max-w-xl gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-[#211028] p-4 text-left">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-white/48">Status</p>
              <p className="mt-2 font-black text-cyanGlow">Pending Review</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-[#211028] p-4 text-left">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-white/48">Application ID</p>
              <p className="mt-2 font-black text-white">{application.applicationId}</p>
            </div>
          </div>

          <div className="mx-auto mt-8 max-w-xl rounded-[1.35rem] border border-white/10 bg-[#211028] p-5 text-left">
            <h2 className="text-sm font-black text-[#f0b7ff]">Enrolment Summary</h2>
            <SummaryRow icon={Sparkles} label="Dance Style" value={selectedStyle?.name ?? "Not selected"} />
            <SummaryRow icon={CalendarDays} label="Class Schedule" value={selectedSlot ? `${selectedSlot.day}, ${selectedSlot.time}` : "Not selected"} />
            <SummaryRow icon={UserRound} label="Instructor" value={selectedTeacher?.name ?? "Not selected"} />
          </div>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              to="/student/enrolment/status"
              className="inline-flex min-h-13 items-center justify-center rounded-2xl bg-gradient-to-r from-[#e8a3ff] to-[#e026b4] px-7 text-sm font-black text-white"
            >
              View Enrolment Progress
            </Link>
            <Link
              to="/student-dashboard"
              className="inline-flex min-h-13 items-center justify-center rounded-2xl border border-cyanGlow px-7 text-sm font-black text-cyanGlow"
            >
              Go to Student Dashboard
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

function StepShell({
  eyebrow,
  title,
  subtitle,
  error,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <section>
      {eyebrow && <p className="text-xs font-black uppercase tracking-[0.22em] text-cyanGlow">{eyebrow}</p>}
      <h1 className="mt-2 text-4xl font-black leading-tight text-[#f0b7ff] sm:text-6xl">{title}</h1>
      {subtitle && <p className="mt-4 max-w-4xl text-lg font-semibold leading-8 text-white/70">{subtitle}</p>}
      {error && <p className="mt-5 rounded-2xl border border-[#ff7aa8]/35 bg-[#ff7aa8]/10 px-5 py-4 text-sm font-black text-[#ffb0c8]">{error}</p>}
      <div className="mt-8">{children}</div>
    </section>
  );
}

function SelectableCard({
  selected,
  icon: Icon,
  title,
  description,
  buttonLabel,
  tone,
  onClick,
}: {
  selected: boolean;
  icon: LucideIcon;
  title: string;
  description: string;
  buttonLabel: string;
  tone: string;
  onClick: () => void;
}) {
  const color = tone === "cyan" ? "text-cyanGlow border-cyanGlow" : tone === "pink" ? "text-[#ff9edc] border-[#ff9edc]" : "text-[#f0b7ff] border-[#f0b7ff]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative min-h-[24rem] rounded-[1.35rem] border p-7 text-left transition",
        selected
          ? "border-[#f0b7ff] bg-orchid/24 shadow-[0_0_40px_rgba(217,28,255,0.28)]"
          : "border-white/10 bg-[#17091d]/88 hover:border-[#f0b7ff]/45",
      )}
    >
      {selected && <CircleCheck className="absolute right-6 top-6 text-[#f0b7ff]" size={34} />}
      <span className={cn("inline-flex h-16 w-16 items-center justify-center rounded-full border bg-white/8", color)}>
        <Icon size={30} />
      </span>
      <h2 className="mt-8 text-3xl font-black text-white">{title}</h2>
      <p className="mt-5 min-h-28 text-base font-semibold leading-7 text-white/68">{description}</p>
      <span
        className={cn(
          "mt-7 inline-flex min-h-14 w-full items-center justify-center rounded-xl text-lg font-black",
          selected ? "bg-gradient-to-r from-[#e8a3ff] to-[#c026ff] text-white" : "border border-current",
          color,
        )}
      >
        {buttonLabel}
      </span>
    </button>
  );
}

function SummaryBanner({
  label,
  title,
  meta,
  image,
  actionLabel,
  onAction,
}: {
  label: string;
  title: string;
  meta: string;
  image: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="rounded-[1.35rem] border border-white/10 bg-[#211028] p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 gap-5">
          <img src={image} alt="" className="h-24 w-28 rounded-xl object-cover" />
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-cyanGlow">{label}</p>
            <h2 className="mt-2 text-3xl font-black text-[#f0b7ff]">{title}</h2>
            <p className="mt-3 text-sm font-black text-white/60">{meta}</p>
          </div>
        </div>
        <button type="button" onClick={onAction} className="rounded-full border border-cyanGlow px-6 py-3 text-sm font-black text-cyanGlow transition hover:bg-cyanGlow/10">
          {actionLabel}
        </button>
      </div>
    </div>
  );
}

function SummaryItem({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center gap-4">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-cyanGlow/12 text-cyanGlow">
        <Icon size={26} />
      </span>
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-white/48">{label}</p>
        <p className="mt-1 text-2xl font-black text-white">{value}</p>
      </div>
    </div>
  );
}

function FormInput({
  label,
  value,
  onChange,
  error,
  helper,
  className,
  type = "text",
  placeholder,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helper?: string;
  className?: string;
  type?: string;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <label className={cn("grid gap-3", className)}>
      <span className="text-xs font-black uppercase tracking-[0.12em] text-white/64">{label}</span>
      <input
        type={type}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "min-h-14 rounded-xl border bg-[#0b0310] px-5 text-sm font-semibold text-white outline-none transition placeholder:text-white/30 focus:border-cyanGlow/65 focus:ring-2 focus:ring-cyanGlow/15",
          error ? "border-[#ff7aa8]/60" : "border-white/10",
        )}
      />
      {helper && !error && <span className="text-xs font-semibold text-white/42">{helper}</span>}
      {error && <span className="text-xs font-black text-[#ffb0c8]">{error}</span>}
    </label>
  );
}

function FormSelect({
  label,
  value,
  options,
  onChange,
  error,
  placeholder,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  error?: string;
  placeholder: string;
}) {
  return (
    <label className="grid gap-3">
      <span className="text-xs font-black uppercase tracking-[0.12em] text-white/64">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "min-h-14 rounded-xl border bg-[#0b0310] px-5 text-sm font-semibold text-white outline-none transition focus:border-cyanGlow/65 focus:ring-2 focus:ring-cyanGlow/15",
          error ? "border-[#ff7aa8]/60" : "border-white/10",
        )}
      >
        <option value="" className="bg-[#0b0310] text-white/50">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option} className="bg-[#0b0310] text-white">{option}</option>
        ))}
      </select>
      {error && <span className="text-xs font-black text-[#ffb0c8]">{error}</span>}
    </label>
  );
}

function ReviewCard({
  icon: Icon,
  title,
  onEdit,
  className,
  children,
}: {
  icon: LucideIcon;
  title: string;
  onEdit: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <article className={cn("rounded-[1.35rem] border border-white/10 bg-[#211028] p-5", className)}>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="flex items-center gap-3 text-sm font-black text-white/72">
          <Icon className="text-cyanGlow" size={20} />
          {title}
        </h3>
        <button type="button" onClick={onEdit} className="text-xs font-black text-[#f0b7ff] transition hover:text-white">
          Edit
        </button>
      </div>
      {children}
    </article>
  );
}

function SummaryRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="mt-4 flex items-center justify-between gap-4 border-t border-white/10 pt-4">
      <span className="flex items-center gap-3 text-sm font-black text-white/66">
        <Icon className="text-cyanGlow" size={18} />
        {label}
      </span>
      <span className="text-right text-sm font-black text-white">{value}</span>
    </div>
  );
}

function StepActions({
  step,
  canSubmit,
  onBack,
  onSaveDraft,
  onNext,
}: {
  step: EnrolmentStep;
  canSubmit: boolean;
  onBack: () => void;
  onSaveDraft: () => void;
  onNext: () => void;
}) {
  const nextLabel = step === 1
    ? "Next: Select Date & Time"
    : step === 2
      ? "Next: Select Teacher"
      : step === 3
        ? "Next: Personal Information"
        : step === 4
          ? "Next: Guardian Details"
          : step === 5
            ? "Next: Review & Finish"
            : "Finish & Submit";

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[#16051d]/96 px-4 py-4 shadow-[0_-22px_70px_rgba(0,0,0,0.44)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={onBack} className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl px-5 text-sm font-black text-white/68 transition hover:text-white">
          <ArrowLeft size={20} />
          Back
        </button>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={onSaveDraft} className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl border border-white/10 px-7 text-sm font-black text-white/72 transition hover:border-white/30 hover:text-white">
            <Save size={18} />
            Save Draft
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!canSubmit}
            className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#e8a3ff] via-[#c026ff] to-[#e026b4] px-8 text-sm font-black text-white shadow-[0_16px_45px_rgba(217,28,255,0.34)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          >
            {nextLabel}
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export {
  draftStorageKey,
  submittedStorageKey,
  readSubmittedEnrolment,
  saveDraft,
  getDanceStyle,
  getClassSlot,
  getTeacher,
  type EnrolmentData,
  type SubmittedEnrolment,
};
