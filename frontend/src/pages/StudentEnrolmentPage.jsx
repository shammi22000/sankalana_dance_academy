import { ArrowLeft, ArrowRight, BadgeCheck, CalendarDays, CheckCircle2, CircleCheck, Clock3, Heart, Sparkles, UserRound, UsersRound, X, } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { brandAssets } from "../assets/brand";
import { danceImages } from "../assets/danceImages";
import { createStudentEnrolment, getStudentEnrolments, submittedEnrolmentApplicationsCacheKey, submittedEnrolmentCacheKey, } from "../services/enrolmentService";
import { getAllTeacherClasses, teacherClassCacheKey } from "../services/teacherClassService";
import { showErrorAlert } from "../utils/alerts";
import { cn } from "../utils/cn";
const draftStorageKey = "sankalanaStudentEnrolmentDraft";
const submittedStorageKey = submittedEnrolmentCacheKey;
const submittedApplicationsStorageKey = submittedEnrolmentApplicationsCacheKey;
const studentSessionStorageKey = "sankalanaStudentSession";
const teacherCreatedClassesStorageKey = teacherClassCacheKey;
const emptyEnrolment = {
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
        name: "Kandyan Dancing",
        image: danceImages.disciplines[0],
        badge: "Classical Heritage",
        focus: "Posture • Rhythm • Drum patterns",
        tone: "orchid",
        description: "A rhythmic Sri Lankan classical style with graceful footwork and powerful drum-led movement.",
    },
    {
        id: "low-country",
        name: "Low Country Dancing",
        image: danceImages.disciplines[1],
        badge: "Southern Tradition",
        focus: "Expression • Masks • Grounded movement",
        tone: "cyan",
        description: "A vibrant southern Sri Lankan dance tradition with expressive masks, grounded rhythm, and ritual movement.",
    },
    {
        id: "sabaragamu",
        name: "Sabaragamu",
        image: danceImages.disciplines[2],
        badge: "Cultural Technique",
        focus: "Handwork • Grace • Storytelling",
        tone: "pink",
        description: "A graceful Sri Lankan classical form known for elegant hand gestures, rhythm, and cultural storytelling.",
    },
    {
        id: "contemporary",
        name: "Contemporary",
        image: danceImages.disciplines[3],
        badge: "Modern Movement",
        focus: "Flow • Release • Creative expression",
        tone: "cyan",
        description: "A fluid modern style exploring emotion, release, floor work, and expressive movement.",
    },
];
const dayNameMap = {
    Mon: "Monday",
    Tue: "Tuesday",
    Wed: "Wednesday",
    Thu: "Thursday",
    Fri: "Friday",
    Sat: "Saturday",
    Sun: "Sunday",
};
function normalizeLookupText(value) {
    return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}
function resolveDanceStyleId(value) {
    const normalizedValue = normalizeLookupText(value);
    return danceStyles.find((style) => {
        const normalizedStyleName = normalizeLookupText(style.name);
        return normalizedValue === normalizedStyleName || normalizedValue.includes(normalizedStyleName);
    })?.id;
}
function formatClassTime(value = "") {
    const [hourValue, minuteValue] = value.split(":").map(Number);
    if (Number.isNaN(hourValue) || Number.isNaN(minuteValue)) {
        return value;
    }
    const period = hourValue >= 12 ? "PM" : "AM";
    const hour = hourValue % 12 || 12;
    return `${hour}:${String(minuteValue).padStart(2, "0")} ${period}`;
}
function formatClassDays(days) {
    const cleanDays = days.filter(Boolean);
    if (cleanDays.length === 0) {
        return "Flexible";
    }
    return cleanDays.map((day) => dayNameMap[day] ?? day).join(", ");
}
function getClassCapacity(classItem) {
    return Number(classItem.capacity) || 0;
}
function getClassRemainingSeats(classItem) {
    const capacity = getClassCapacity(classItem);
    const remainingSeats = Number(classItem.remainingSeats ?? classItem.availableSeats);
    return Number.isFinite(remainingSeats) ? Math.max(remainingSeats, 0) : capacity;
}
function getClassEnrolledStudentCount(classItem) {
    const enrolledStudentCount = Number(classItem.enrolledStudentCount);
    if (Number.isFinite(enrolledStudentCount)) {
        return Math.max(enrolledStudentCount, 0);
    }
    return Math.max(getClassCapacity(classItem) - getClassRemainingSeats(classItem), 0);
}
function readCreatedTeacherClasses() {
    if (typeof window === "undefined") {
        return [];
    }
    const storedClasses = window.localStorage.getItem(teacherCreatedClassesStorageKey);
    if (!storedClasses) {
        return [];
    }
    try {
        const parsedClasses = JSON.parse(storedClasses);
        return Array.isArray(parsedClasses)
            ? parsedClasses.filter((classItem) => classItem.id && classItem.className && classItem.danceStyle)
            : [];
    }
    catch {
        window.localStorage.removeItem(teacherCreatedClassesStorageKey);
        return [];
    }
}
function getTeacherIdForClass(classItem, danceStyleId) {
    if (classItem.teacherId) {
        return classItem.teacherId;
    }
    const fallbackName = classItem.teacherName ?? classItem.teacherUsername ?? classItem.teacherSpecialization ?? classItem.danceStyle;
    return `${danceStyleId}-${normalizeLookupText(fallbackName) || classItem.id}`;
}
function getAvailableClassSlots() {
    return readCreatedTeacherClasses().flatMap((classItem) => {
        const danceStyleId = resolveDanceStyleId(classItem.danceStyle);
        if (!danceStyleId) {
            return [];
        }
        const classDays = Array.isArray(classItem.days) ? classItem.days : [];
        const startTime = formatClassTime(classItem.startTime);
        const endTime = formatClassTime(classItem.endTime);
        const capacity = getClassCapacity(classItem);
        const remainingSeats = getClassRemainingSeats(classItem);
        return [{
                id: classItem.id,
                danceStyleId,
                teacherId: getTeacherIdForClass(classItem, danceStyleId),
                className: classItem.className,
                day: formatClassDays(classDays),
                days: classDays.length > 0 ? classDays : ["Flexible"],
                time: `${startTime} - ${endTime}`,
                seats: remainingSeats,
                capacity,
                enrolledStudentCount: getClassEnrolledStudentCount(classItem),
                level: classItem.classLevel,
                studio: classItem.studio,
                description: classItem.description,
                createdAt: classItem.createdAt,
            }];
    });
}
function getAvailableTeachers() {
    const teacherMap = new Map();
    readCreatedTeacherClasses().forEach((classItem, index) => {
        const danceStyleId = resolveDanceStyleId(classItem.danceStyle);
        if (!danceStyleId) {
            return;
        }
        const teacherId = getTeacherIdForClass(classItem, danceStyleId);
        const existingTeacher = teacherMap.get(teacherId);
        const classDays = Array.isArray(classItem.days) ? classItem.days : [];
        const capacity = getClassCapacity(classItem);
        const remainingSeats = getClassRemainingSeats(classItem);
        if (existingTeacher) {
            existingTeacher.capacity += capacity;
            existingTeacher.availableSeats += remainingSeats;
            existingTeacher.students = `${existingTeacher.availableSeats} seats remaining`;
            return;
        }
        teacherMap.set(teacherId, {
            id: teacherId,
            name: classItem.teacherName ?? classItem.teacherUsername ?? "Teacher",
            danceStyleId,
            specialization: classItem.teacherSpecialization ?? classItem.danceStyle,
            experience: classItem.teacherExperienceYears ? `${classItem.teacherExperienceYears} years experience` : "Experience not added",
            students: `${remainingSeats} seats remaining`,
            time: `${formatClassDays(classDays)} • ${formatClassTime(classItem.startTime)}`,
            image: classItem.teacherAvatarImageDataUrl || danceImages.story[index % danceImages.story.length],
            bio: classItem.teacherBiography || classItem.description || `Teacher-created class for ${classItem.danceStyle}.`,
            capacity,
            availableSeats: remainingSeats,
        });
    });
    return Array.from(teacherMap.values());
}
function getDanceStyle(data) {
    return danceStyles.find((style) => style.id === data.danceStyleId);
}
function getClassSlot(data) {
    return getAvailableClassSlots().find((slot) => slot.id === data.slotId);
}
function getTeacher(data) {
    return getAvailableTeachers().find((teacher) => teacher.id === data.teacherId);
}
function readStudentSession() {
    const storedSession = localStorage.getItem(studentSessionStorageKey);
    if (!storedSession) {
        return null;
    }
    try {
        return JSON.parse(storedSession);
    }
    catch {
        localStorage.removeItem(studentSessionStorageKey);
        return null;
    }
}
function normalizeProfileGender(gender) {
    return gender === "Male" || gender === "Female" || gender === "Other" ? gender : "";
}
function getProfilePersonalInfo() {
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
function createInitialEnrolmentData() {
    return {
        ...emptyEnrolment,
        personal: {
            ...emptyEnrolment.personal,
            ...getProfilePersonalInfo(),
        },
    };
}
function fillMissingProfilePersonalInfo(data) {
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
function readDraft() {
    const storedDraft = localStorage.getItem(draftStorageKey);
    if (!storedDraft) {
        return null;
    }
    try {
        return JSON.parse(storedDraft);
    }
    catch {
        localStorage.removeItem(draftStorageKey);
        return null;
    }
}
function saveDraft(data, step) {
    localStorage.setItem(draftStorageKey, JSON.stringify({ data, step }));
}
function readSubmittedEnrolmentApplications() {
    const storedApplications = localStorage.getItem(submittedApplicationsStorageKey);
    const applications = [];
    if (storedApplications) {
        try {
            const parsedApplications = JSON.parse(storedApplications);
            if (Array.isArray(parsedApplications)) {
                applications.push(...parsedApplications.filter((application) => application.applicationId));
            }
        }
        catch {
            localStorage.removeItem(submittedApplicationsStorageKey);
        }
    }
    const storedApplication = localStorage.getItem(submittedStorageKey);
    if (storedApplication) {
        try {
            const legacyApplication = JSON.parse(storedApplication);
            if (legacyApplication?.applicationId &&
                !applications.some((application) => application.applicationId === legacyApplication.applicationId)) {
                applications.push(legacyApplication);
            }
        }
        catch {
            localStorage.removeItem(submittedStorageKey);
        }
    }
    return applications.sort((first, second) => new Date(second.submittedAt).getTime() - new Date(first.submittedAt).getTime());
}
function persistSubmittedEnrolment(application) {
    const currentApplications = readSubmittedEnrolmentApplications();
    const nextApplications = [
        application,
        ...currentApplications.filter((currentApplication) => currentApplication.applicationId !== application.applicationId),
    ];
    localStorage.setItem(submittedStorageKey, JSON.stringify(application));
    localStorage.setItem(submittedApplicationsStorageKey, JSON.stringify(nextApplications));
}
function readSubmittedEnrolment() {
    const storedApplication = localStorage.getItem(submittedStorageKey);
    if (!storedApplication) {
        return readSubmittedEnrolmentApplications()[0] ?? null;
    }
    try {
        const application = JSON.parse(storedApplication);
        const latestApplication = readSubmittedEnrolmentApplications().find((currentApplication) => currentApplication.applicationId === application.applicationId);
        return latestApplication ?? application;
    }
    catch {
        localStorage.removeItem(submittedStorageKey);
        return null;
    }
}
function getApplicationId() {
    const year = new Date().getFullYear();
    const applications = readSubmittedEnrolmentApplications();
    const nextSequence = applications.length + 1;
    return `ENR-${year}-${String(nextSequence).padStart(3, "0")}`;
}
function validateStep(step, data) {
    const errors = {};
    if (step === 1 && !data.danceStyleId) {
        errors.danceStyleId = "Please select a dance style to continue.";
    }
    if (step === 2 && (!data.slotId || !data.teacherId)) {
        errors.slotId = "Please select a teacher class and time.";
    }
    if (step === 3 && !data.teacherId) {
        errors.teacherId = "Please select a teacher to continue.";
    }
    if (step === 4) {
        if (!data.personal.fullName.trim())
            errors.fullName = "Enter your full name.";
        if (!data.personal.dateOfBirth)
            errors.dateOfBirth = "Date of birth is required.";
        if (!data.personal.gender)
            errors.gender = "Gender is required.";
        if (!/^\+?\d[\d\s-]{6,}$/.test(data.personal.phone.trim()))
            errors.phone = "Enter a valid phone number.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.personal.email.trim()))
            errors.email = "Enter a valid email address.";
        if (!data.personal.address.trim())
            errors.address = "Enter your address.";
    }
    if (step === 5) {
        if (!data.guardian.fullName.trim())
            errors.guardianFullName = "Enter guardian full name.";
        if (!/^\+?\d[\d\s-]{6,}$/.test(data.guardian.phone.trim()))
            errors.guardianPhone = "Enter guardian phone number.";
        if (!data.guardian.relationship)
            errors.relationship = "Select relationship.";
    }
    if (step === 6 && !data.confirmed) {
        errors.confirmed = "Confirm the information before submitting.";
    }
    return errors;
}
function createSubmittedEnrolment(data) {
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
    const [phase, setPhase] = useState("start");
    const [step, setStep] = useState(1);
    const [data, setData] = useState(() => createInitialEnrolmentData());
    const [errors, setErrors] = useState({});
    const [notice, setNotice] = useState("");
    const [submitted, setSubmitted] = useState(null);
    const [, setClassDataVersion] = useState(0);
    useEffect(() => {
        const shouldResume = location.state?.resumeDraft;
        if (shouldResume) {
            continueDraft();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useEffect(() => {
        let isMounted = true;
        async function loadPageData() {
            try {
                await Promise.all([getAllTeacherClasses(), getStudentEnrolments().catch(() => [])]);
                if (isMounted) {
                    setClassDataVersion((currentVersion) => currentVersion + 1);
                }
            }
            catch {
                if (isMounted) {
                    setNotice("Teacher classes could not be loaded from the database right now.");
                }
            }
        }
        void loadPageData();
        return () => {
            isMounted = false;
        };
    }, []);
    const selectedStyle = getDanceStyle(data);
    const selectedSlot = getClassSlot(data);
    const selectedTeacher = getTeacher(data);
    function updateData(updater) {
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
        setStep((current) => Math.max(1, current - 1));
        setErrors({});
    }
    async function goNext() {
        const nextErrors = validateStep(step, data);
        if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors);
            return;
        }
        if (step === 2 && selectedSlot && selectedSlot.seats <= 0) {
            setErrors({ slotId: "This class is full. Please select another class time." });
            return;
        }
        if (step === 6) {
            try {
                const application = await createStudentEnrolment(data);
                await getAllTeacherClasses().catch(() => []);
                persistSubmittedEnrolment(application);
                localStorage.removeItem(draftStorageKey);
                setSubmitted(application);
                setPhase("success");
            }
            catch (error) {
                await showErrorAlert("Enrolment Not Submitted", error instanceof Error ? error.message : "Unable to submit enrolment.");
            }
            return;
        }
        setStep((current) => Math.min(6, current + 1));
        setErrors({});
    }
    function goToStep(targetStep) {
        setStep(targetStep);
        setPhase("steps");
        setErrors({});
    }
    function closeEnrolment() {
        navigate("/student-dashboard");
    }
    if (phase === "success" && submitted) {
        return <EnrolmentSuccess application={submitted}/>;
    }
    return (<div className="min-h-screen overflow-hidden bg-[#0b020f] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(199,45,255,0.24),transparent_30rem),radial-gradient(circle_at_84%_82%,rgba(34,211,238,0.16),transparent_26rem)]"/>
      <div className="fixed inset-0 bg-gradient-to-br from-[#1b071f]/90 via-[#0b020f] to-[#001312]"/>

      <main className="relative z-10 mx-auto min-h-screen max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <button type="button" onClick={closeEnrolment} className="fixed right-5 top-5 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-[#17091d]/90 text-white/72 shadow-[0_18px_55px_rgba(0,0,0,0.35)] backdrop-blur-xl transition hover:border-[#f0b7ff]/55 hover:bg-[#2a1230] hover:text-white" aria-label="Close enrolment and return to student dashboard" title="Close enrolment">
          <X size={24}/>
        </button>

        {phase === "start" ? (<EnrolmentStart notice={notice} onStart={startNew}/>) : (<>
            <EnrolmentStepper currentStep={step}/>
            <div className="pb-28">
              {step === 1 && (<DanceStyleStep value={data.danceStyleId} error={errors.danceStyleId} onSelect={(danceStyleId) => updateData((current) => ({
                    ...current,
                    danceStyleId,
                    slotId: current.danceStyleId === danceStyleId ? current.slotId : "",
                    teacherId: current.danceStyleId === danceStyleId ? current.teacherId : "",
                }))}/>)}
              {step === 2 && (<DateTimeStep selectedStyle={selectedStyle} value={data.slotId} error={errors.slotId} onChangeStyle={() => goToStep(1)} onSelect={(slot) => updateData((current) => ({
                    ...current,
                    slotId: slot.id,
                    teacherId: slot.teacherId,
                }))}/>)}
              {step === 3 && (<TeacherStep selectedStyle={selectedStyle} selectedSlot={selectedSlot} selectedTeacher={selectedTeacher} error={errors.teacherId} onChangeClass={() => goToStep(2)}/>)}
              {step === 4 && (<PersonalInfoStep value={data.personal} errors={errors} onChange={(personal) => updateData((current) => ({ ...current, personal }))}/>)}
              {step === 5 && (<GuardianDetailsStep value={data.guardian} errors={errors} onChange={(guardian) => updateData((current) => ({ ...current, guardian }))}/>)}
              {step === 6 && (<ReviewFinishStep data={data} selectedStyle={selectedStyle} selectedSlot={selectedSlot} selectedTeacher={selectedTeacher} error={errors.confirmed} onEdit={goToStep} onConfirm={(confirmed) => updateData((current) => ({ ...current, confirmed }))}/>)}
            </div>

            {notice && (<p className="fixed bottom-24 left-1/2 z-30 -translate-x-1/2 rounded-full border border-cyanGlow/35 bg-[#0b1518] px-5 py-3 text-sm font-black text-cyanGlow shadow-[0_0_35px_rgba(34,211,238,0.16)]">
                {notice}
              </p>)}

            <StepActions step={step} canSubmit={step !== 6 || data.confirmed} onBack={goBack} onNext={goNext}/>
          </>)}
      </main>
    </div>);
}
function EnrolmentStart({ notice, onStart, }) {
    return (<section className="grid min-h-[calc(100svh-4rem)] place-items-center">
      <div className="w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/12 bg-white/[0.065] shadow-[0_32px_110px_rgba(0,0,0,0.5)] backdrop-blur-2xl">
        <div className="grid gap-0 lg:grid-cols-[1fr_24rem]">
          <div className="p-6 sm:p-9 lg:p-12">
            <div className="inline-flex items-center gap-4">
              <span className="inline-flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl border border-[#f0b7ff]/35 bg-black shadow-[0_0_35px_rgba(217,28,255,0.2)]">
                <img src={brandAssets.logo} alt="Sankalana logo" className="h-full w-full object-cover"/>
              </span>
              <span className="text-3xl font-black tracking-wide text-[#f0b7ff] drop-shadow-[0_0_22px_rgba(217,28,255,0.28)]">
                Sankalana
              </span>
            </div>

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
                {steps.map((label, index) => (<div key={label} className="flex items-center gap-3 rounded-xl bg-[#0b0310] px-4 py-3">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#f0b7ff] text-xs font-black text-[#17061d]">
                      {index + 1}
                    </span>
                    <span className="text-sm font-black text-white/74">{label}</span>
                  </div>))}
              </div>
            </div>

            {notice && <p className="mt-5 text-sm font-black text-cyanGlow">{notice}</p>}

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <button type="button" onClick={onStart} className="inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#e8a3ff] via-[#c026ff] to-[#e026b4] px-8 text-base font-black text-white shadow-[0_22px_55px_rgba(217,28,255,0.34)] transition hover:-translate-y-0.5">
                Start Enrolment
                <ArrowRight size={22}/>
              </button>
            </div>
          </div>

          <aside className="relative min-h-96 overflow-hidden border-t border-white/10 lg:border-l lg:border-t-0">
            <img src={danceImages.heroCarousel[2].src} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55"/>
            <div className="absolute inset-0 bg-gradient-to-t from-[#16051d] via-[#16051d]/72 to-transparent"/>
            <div className="absolute bottom-0 p-7">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cyanGlow">Sankalana Academy</p>
              <h2 className="mt-3 text-3xl font-black text-white">Choose your path with confidence.</h2>
            </div>
          </aside>
        </div>
      </div>
    </section>);
}
function EnrolmentStepper({ currentStep }) {
    return (<div className="mb-8 border-b border-white/10 pb-6">
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
            return (<div key={label} className="grid gap-2">
                <div className={`h-1.5 rounded-full ${isActive ? "bg-[#f0b7ff]" : "bg-white/14"}`}/>
                <span className="hidden text-center text-[0.65rem] font-black uppercase tracking-[0.08em] text-white/42 sm:block">
                  {label}
                </span>
              </div>);
        })}
        </div>
      </div>
    </div>);
}
function DanceStyleStep({ value, error, onSelect, }) {
    return (<StepShell eyebrow="Step 1 of 6" title="Choose Your Dance Style" subtitle="Select the discipline that resonates with your soul. Each path at Sankalana is designed to nurture technique, expression, and mastery." error={error}>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {danceStyles.map((style) => (<SelectableCard key={style.id} selected={value === style.id} image={style.image} badge={style.badge} focus={style.focus} title={style.name} description={style.description} buttonLabel={value === style.id ? "Selected" : "Select"} tone={style.tone} onClick={() => onSelect(style.id)}/>))}
      </div>
    </StepShell>);
}
function DateTimeStep({ selectedStyle, value, error, onChangeStyle, onSelect, }) {
    const availableTeachers = getAvailableTeachers();
    const availableSlots = getAvailableClassSlots();
    const relevantTeachers = selectedStyle
        ? availableTeachers.filter((teacher) => teacher.danceStyleId === selectedStyle.id)
        : [];
    const relevantSlots = selectedStyle
        ? availableSlots.filter((slot) => slot.danceStyleId === selectedStyle.id)
        : [];
    const classDays = Array.from(new Set(relevantSlots.flatMap((slot) => slot.days)));
    return (<StepShell eyebrow="Step 2 of 6" title="Select Date & Time" subtitle="Choose a teacher and one of their available class times for your selected dance style." error={error}>
      <SummaryBanner label="Current Selection" title={selectedStyle?.name ?? "No dance style selected"} meta={`${relevantTeachers.length} teachers • ${relevantSlots.length} available classes`} image={danceImages.heroCarousel[0].src} actionLabel="Change Style" onAction={onChangeStyle}/>

      <div className="mt-10 grid gap-7 lg:grid-cols-[22rem_1fr]">
        <div className="rounded-[1.35rem] border border-white/10 bg-[#211028] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-black text-white">Available Days</h3>
            <CalendarDays className="text-[#f0b7ff]" size={27}/>
          </div>
          <div className="mt-7 grid grid-cols-4 gap-3 text-center">
            {classDays.map((day) => (<span key={day} className="rounded-2xl border border-white/10 bg-[#0b0310] px-4 py-5 text-sm font-black text-white/72">
                {day}
              </span>))}
            {classDays.length === 0 && (<span className="col-span-4 rounded-2xl border border-white/10 bg-[#0b0310] px-4 py-5 text-sm font-black text-white/54">
                No days yet
              </span>)}
          </div>
          <div className="mt-7 rounded-2xl border border-cyanGlow/25 bg-cyanGlow/10 p-5">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-cyanGlow">Selection Rule</p>
            <p className="mt-3 text-sm font-semibold leading-7 text-white/68">
              Select one class time. The teacher assigned to that class will be saved with your enrolment.
            </p>
          </div>
        </div>

        <div>
          <h3 className="text-3xl font-black text-[#f4e7fb]">
            {selectedStyle ? `${selectedStyle.name} Teachers & Classes` : "Available Teachers & Classes"}
          </h3>
          <div className="mt-6 grid gap-6">
            {relevantTeachers.length > 0 ? relevantTeachers.map((teacher) => {
            const teacherSlots = relevantSlots.filter((slot) => slot.teacherId === teacher.id);
            return (<article key={teacher.id} className="overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#17091d]/88 shadow-[0_24px_90px_rgba(0,0,0,0.28)]">
                  <div className="grid gap-0 xl:grid-cols-[18rem_1fr]">
                    <div className="relative min-h-64 overflow-hidden">
                      <img src={teacher.image} alt="" className="absolute inset-0 h-full w-full object-cover grayscale"/>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#17091d] via-[#17091d]/34 to-transparent"/>
                      <div className="absolute bottom-0 p-6">
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-cyanGlow">{teacher.specialization}</p>
                        <h4 className="mt-2 text-2xl font-black leading-tight text-white">{teacher.name}</h4>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
                        <div>
                          <div className="flex flex-wrap gap-3 text-xs font-black uppercase tracking-[0.1em] text-white/54">
                            <span className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-2">
                              {teacher.experience}
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-2">
                              {teacher.students}
                            </span>
                          </div>
                          <p className="mt-4 max-w-2xl text-sm font-semibold leading-7 text-white/68">{teacher.bio}</p>
                        </div>
                      </div>

                      <div className="mt-6 grid gap-4">
                        {teacherSlots.map((slot) => {
                    const selected = value === slot.id;
                    const full = slot.seats <= 0;
                    return (<button key={slot.id} type="button" onClick={() => !full && onSelect(slot)} disabled={full} className={cn("grid gap-5 rounded-2xl border p-5 text-left transition sm:grid-cols-[1fr_auto] sm:items-center", selected
                            ? "border-cyanGlow bg-cyanGlow/12 shadow-[0_0_35px_rgba(34,211,238,0.25)]"
                            : full
                                ? "cursor-not-allowed border-white/10 bg-[#0b0310]/46 opacity-58"
                                : "border-white/10 bg-[#0b0310]/72 hover:border-cyanGlow/45")}>
                              <div>
                                <p className={cn("text-xl font-black", selected ? "text-cyanGlow" : "text-[#f4e7fb]")}>
                                  {slot.className}
                                </p>
                                <p className="mt-2 text-sm font-black text-white/60">
                                  {slot.day} • {slot.time} • {slot.studio}
                                </p>
                              </div>
                              <div className="grid gap-3 sm:justify-items-end">
                                <span className={cn("rounded-full px-4 py-2 text-xs font-black", full ? "bg-[#ff7aa8]/16 text-[#ffb0c8]" : "bg-[#1f6770] text-cyanGlow")}>
                                  {slot.level}
                                </span>
                                <span className="text-sm font-black text-white/70">
                                  {full ? "No seats left" : `${slot.seats} of ${slot.capacity} seats available`}
                                </span>
                                {selected && <CircleCheck className="text-cyanGlow" size={34}/>}
                              </div>
                            </button>);
                })}
                      </div>
                    </div>
                  </div>
                </article>);
        }) : (<article className="rounded-[1.35rem] border border-white/10 bg-[#17091d]/88 p-7">
                <Sparkles className="text-[#f0b7ff]" size={38}/>
                <h4 className="mt-5 text-2xl font-black text-white">No teacher classes available yet</h4>
                <p className="mt-3 max-w-2xl text-sm font-semibold leading-7 text-white/64">
                  When an approved teacher creates a class for {selectedStyle?.name ?? "this style"}, it will appear here with its schedule, studio, level, and available seats.
                </p>
              </article>)}
          </div>
        </div>
      </div>
    </StepShell>);
}
function TeacherStep({ selectedStyle, selectedSlot, selectedTeacher, error, onChangeClass, }) {
    return (<StepShell eyebrow="Step 3 of 6" title="Confirm Your Teacher" subtitle="Review the teacher and class time selected from the available classes." error={error}>
      <div className="rounded-[1.35rem] border-l-4 border-cyanGlow bg-[#211028] p-6">
        <div className="grid gap-5 lg:grid-cols-3">
          <SummaryItem icon={Sparkles} label="Course Style" value={selectedStyle?.name ?? "Not selected"}/>
          <SummaryItem icon={CalendarDays} label="Selected Class" value={selectedSlot?.className ?? "Not selected"}/>
          <SummaryItem icon={Clock3} label="Schedule" value={selectedSlot ? `${selectedSlot.day} • ${selectedSlot.time}` : "Not selected"}/>
        </div>
      </div>

      {selectedTeacher && selectedSlot ? (<article className="mt-10 overflow-hidden rounded-[1.35rem] border border-[#f0b7ff]/35 bg-[#17091d] shadow-[0_0_40px_rgba(217,28,255,0.16)]">
          <div className="grid gap-0 lg:grid-cols-[25rem_1fr]">
            <div className="relative min-h-80">
              <img src={selectedTeacher.image} alt="" className="absolute inset-0 h-full w-full object-cover grayscale"/>
              <div className="absolute inset-0 bg-gradient-to-t from-[#17091d] via-[#17091d]/20 to-transparent"/>
              <CircleCheck className="absolute right-6 top-6 rounded-full bg-orchid text-[#f0b7ff]" size={38}/>
              <div className="absolute inset-x-0 bottom-0 p-7">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-cyanGlow">{selectedTeacher.specialization}</p>
                <h3 className="mt-2 text-3xl font-black leading-tight text-white">{selectedTeacher.name}</h3>
              </div>
            </div>
            <div className="p-7">
              <div className="grid gap-4 sm:grid-cols-3">
                <SummaryMini label="Experience" value={selectedTeacher.experience}/>
                <SummaryMini label="Students" value={selectedTeacher.students}/>
                <SummaryMini label="Class Level" value={selectedSlot.level}/>
              </div>

              <p className="mt-7 text-base font-semibold leading-8 text-white/68">{selectedTeacher.bio}</p>

              <div className="mt-7 rounded-2xl border border-white/10 bg-[#0b0310]/72 p-5">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-white/42">Selected Class</p>
                <h4 className="mt-2 text-2xl font-black text-[#f4e7fb]">{selectedSlot.className}</h4>
                <div className="mt-4 grid gap-3 text-sm font-black text-white/68 sm:grid-cols-3">
                  <span>{selectedSlot.day}</span>
                  <span>{selectedSlot.time}</span>
                  <span>{selectedSlot.studio}</span>
                </div>
              </div>

              <button type="button" onClick={onChangeClass} className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl border border-cyanGlow px-6 text-sm font-black text-cyanGlow transition hover:bg-cyanGlow/10">
                Change Teacher or Class Time
              </button>
            </div>
          </div>
        </article>) : (<div className="mt-10 rounded-[1.35rem] border border-[#ff7aa8]/35 bg-[#ff7aa8]/10 p-6">
          <p className="text-sm font-black text-[#ffb0c8]">Please choose a teacher class and time in Step 2.</p>
          <button type="button" onClick={onChangeClass} className="mt-5 inline-flex min-h-12 items-center justify-center rounded-xl border border-[#ffb0c8]/60 px-6 text-sm font-black text-[#ffb0c8]">
            Back to Date & Time
          </button>
        </div>)}
    </StepShell>);
}
function SummaryMini({ label, value }) {
    return (<div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-white/42">{label}</p>
      <p className="mt-2 text-sm font-black text-white">{value}</p>
    </div>);
}
function PersonalInfoStep({ value, errors, onChange, }) {
    function setField(field, fieldValue) {
        onChange({ ...value, [field]: fieldValue });
    }
    return (<StepShell eyebrow="Registration Process" title="Personal Information" subtitle="Provide the details needed to identify and contact the enrolling student.">
      <div className="rounded-[1.35rem] border border-white/10 bg-[#211028]/86 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.28)] sm:p-8">
        <div className="grid gap-6 md:grid-cols-2">
          <FormInput label="Full Name *" value={value.fullName} error={errors.fullName} placeholder="Enter your legal name" onChange={(next) => setField("fullName", next)}/>
          <FormInput label="Date of Birth *" type="date" value={value.dateOfBirth} error={errors.dateOfBirth} onChange={(next) => setField("dateOfBirth", next)}/>
          <FormSelect label="Gender *" value={value.gender} error={errors.gender} options={["Male", "Female", "Other"]} placeholder="Select gender" onChange={(next) => setField("gender", next)}/>
          <FormInput label="Phone Number *" value={value.phone} error={errors.phone} placeholder="0771234567" helper="Example: 0771234567" onChange={(next) => setField("phone", next)}/>
          <FormInput label="Email Address *" type="email" value={value.email} error={errors.email} placeholder="student@email.com" helper="Example: student@email.com" onChange={(next) => setField("email", next)}/>
          <FormInput label="Address *" value={value.address} error={errors.address} placeholder="Street name, building number" className="md:col-span-2" onChange={(next) => setField("address", next)}/>
          <FormInput label="City" value={value.city} placeholder="Your city" onChange={(next) => setField("city", next)}/>
          <FormInput label="Emergency Contact Number" value={value.emergencyContact} placeholder="0779876543" onChange={(next) => setField("emergencyContact", next)}/>
        </div>
      </div>
    </StepShell>);
}
function GuardianDetailsStep({ value, errors, onChange, }) {
    function setField(field, fieldValue) {
        onChange({ ...value, [field]: fieldValue });
    }
    return (<StepShell eyebrow="Step 5 of 6" title="Guardian Details" subtitle="Guardian details are required for students under 18 and useful for emergency contact.">
      <div className="grid gap-7 lg:grid-cols-[1fr_22rem]">
        <div className="rounded-[1.35rem] border border-white/10 bg-[#211028]/86 p-6 shadow-[0_24px_90px_rgba(0,0,0,0.28)] sm:p-8">
          <div className="rounded-2xl border border-white/10 bg-[#312137] p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-cyanGlow/18 text-cyanGlow">
                  <UsersRound size={27}/>
                </span>
                <div>
                  <h3 className="text-xl font-black text-cyanGlow">Student Status</h3>
                  <p className="text-sm font-semibold text-white/64">Is the student under 18 years of age?</p>
                </div>
              </div>
              <div className="flex gap-2">
                {["Yes", "No"].map((option) => (<button key={option} type="button" onClick={() => setField("under18", option)} className={cn("rounded-full px-4 py-2 text-xs font-black transition", value.under18 === option ? "bg-[#f0b7ff] text-[#17061d]" : "bg-[#0b0310] text-white/62")}>
                    {option}
                  </button>))}
              </div>
            </div>
          </div>

          <div className="mt-7 grid gap-6 md:grid-cols-2">
            <FormInput label="Guardian Full Name *" value={value.fullName} error={errors.guardianFullName} placeholder="e.g. Elena Rodriguez" onChange={(next) => setField("fullName", next)}/>
            <FormSelect label="Relationship *" value={value.relationship} error={errors.relationship} options={["Mother", "Father", "Guardian", "Other"]} placeholder="Select relationship" onChange={(next) => setField("relationship", next)}/>
            <FormInput label="Guardian Phone Number *" value={value.phone} error={errors.guardianPhone} placeholder="+94 77 000 0000" onChange={(next) => setField("phone", next)}/>
            <FormInput label="Guardian Email" type="email" value={value.email} placeholder="guardian@example.com" onChange={(next) => setField("email", next)}/>
            <FormInput label="Guardian Address" value={value.address} placeholder="Street address, city" className="md:col-span-2" onChange={(next) => setField("address", next)}/>
          </div>
        </div>

        <aside className="grid content-start gap-6">
          <div className="rounded-[1.35rem] border border-cyanGlow/40 bg-[#211028]/86 p-6">
            <h3 className="flex items-center gap-3 text-xl font-black text-cyanGlow">
              <Heart size={22}/>
              Legal Requirements
            </h3>
            <p className="mt-5 text-sm font-semibold leading-7 text-white/68">
              Guardian details help the academy contact a responsible adult for safety, consent, and urgent updates.
            </p>
          </div>
          <img src={danceImages.heroCarousel[3]?.src ?? danceImages.heroCarousel[0].src} alt="" className="h-56 rounded-[1.35rem] object-cover opacity-75"/>
        </aside>
      </div>
    </StepShell>);
}
function ReviewFinishStep({ data, selectedStyle, selectedSlot, selectedTeacher, error, onEdit, onConfirm, }) {
    return (<StepShell title="Review & Finish" subtitle="Please check your enrolment details before submitting." error={error}>
      <div className="grid gap-5 md:grid-cols-2">
        <ReviewCard icon={Sparkles} title="Selected Dance Style" onEdit={() => onEdit(1)}>
          <p className="font-black text-white">{selectedStyle?.name ?? "Not selected"}</p>
        </ReviewCard>
        <ReviewCard icon={CalendarDays} title="Selected Date & Time" onEdit={() => onEdit(2)}>
          <p className="font-black text-white">{selectedSlot?.className ?? "Not selected"}</p>
          <p className="mt-1 text-sm text-white/52">{selectedSlot ? `${selectedSlot.day} • ${selectedSlot.time}` : ""}</p>
          <p className="mt-1 text-sm text-white/52">{selectedSlot ? `${selectedSlot.seats} seats available • ${selectedSlot.level}` : ""}</p>
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
        <input type="checkbox" checked={data.confirmed} onChange={(event) => onConfirm(event.target.checked)} className="h-5 w-5 accent-[#e026b4]"/>
        <span className="text-sm font-black text-white/78">I confirm that the information provided is accurate.</span>
      </label>
    </StepShell>);
}
function EnrolmentSuccess({ application }) {
    const selectedStyle = getDanceStyle(application.data);
    const selectedSlot = getClassSlot(application.data);
    const selectedTeacher = getTeacher(application.data);
    return (<div className="min-h-screen overflow-hidden bg-[#0b020f] text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(199,45,255,0.24),transparent_30rem),radial-gradient(circle_at_76%_78%,rgba(34,211,238,0.18),transparent_26rem)]"/>
      <main className="relative z-10 grid min-h-screen place-items-center px-4 py-10">
        <section className="w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/12 bg-white/[0.065] p-7 text-center shadow-[0_32px_110px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:p-10">
          <span className="mx-auto inline-flex h-24 w-24 items-center justify-center rounded-full border border-cyanGlow bg-cyanGlow/12 text-cyanGlow shadow-[0_0_45px_rgba(34,211,238,0.28)]">
            <CheckCircle2 size={48}/>
          </span>
          <h1 className="mx-auto mt-8 max-w-xl text-4xl font-black leading-tight text-[#f4e7fb] sm:text-5xl">
            Enrolment Submitted Successfully
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base font-semibold leading-7 text-white/68">
            Your enrolment request has been submitted and is waiting for teacher review.
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
            <SummaryRow icon={Sparkles} label="Dance Style" value={selectedStyle?.name ?? "Not selected"}/>
            <SummaryRow icon={CalendarDays} label="Class Schedule" value={selectedSlot ? `${selectedSlot.className} • ${selectedSlot.day}, ${selectedSlot.time}` : "Not selected"}/>
            <SummaryRow icon={UserRound} label="Instructor" value={selectedTeacher?.name ?? "Not selected"}/>
          </div>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link to="/student/enrolment/status" className="inline-flex min-h-13 items-center justify-center rounded-2xl bg-gradient-to-r from-[#e8a3ff] to-[#e026b4] px-7 text-sm font-black text-white">
              View Enrolment Progress
            </Link>
            <Link to="/student-dashboard" className="inline-flex min-h-13 items-center justify-center rounded-2xl border border-cyanGlow px-7 text-sm font-black text-cyanGlow">
              Go to Student Dashboard
            </Link>
          </div>
        </section>
      </main>
    </div>);
}
function StepShell({ eyebrow, title, subtitle, error, children, }) {
    return (<section>
      {eyebrow && <p className="text-xs font-black uppercase tracking-[0.22em] text-cyanGlow">{eyebrow}</p>}
      <h1 className="mt-2 text-4xl font-black leading-tight text-[#f0b7ff] sm:text-6xl">{title}</h1>
      {subtitle && <p className="mt-4 max-w-4xl text-lg font-semibold leading-8 text-white/70">{subtitle}</p>}
      {error && <p className="mt-5 rounded-2xl border border-[#ff7aa8]/35 bg-[#ff7aa8]/10 px-5 py-4 text-sm font-black text-[#ffb0c8]">{error}</p>}
      <div className="mt-8">{children}</div>
    </section>);
}
function SelectableCard({ selected, image, badge, focus, title, description, buttonLabel, tone, onClick, }) {
    const color = tone === "cyan" ? "text-cyanGlow border-cyanGlow" : tone === "pink" ? "text-[#ff9edc] border-[#ff9edc]" : "text-[#f0b7ff] border-[#f0b7ff]";
    const selectedOverlay = tone === "cyan" ? "from-cyanGlow/22" : tone === "pink" ? "from-[#ff9edc]/22" : "from-[#f0b7ff]/24";
    return (<button type="button" onClick={onClick} className={cn("group relative flex h-full min-h-[41rem] flex-col overflow-hidden rounded-[1.6rem] border text-left transition duration-300 hover:-translate-y-1", selected
            ? "border-[#f0b7ff] bg-orchid/24 shadow-[0_0_46px_rgba(217,28,255,0.3)]"
            : "border-white/10 bg-[#17091d]/88 shadow-[0_24px_80px_rgba(0,0,0,0.24)] hover:border-[#f0b7ff]/45 hover:shadow-[0_0_32px_rgba(217,28,255,0.14)]")}>
      <div className="relative h-44 overflow-hidden">
        <img src={image} alt="" className="h-full w-full object-cover opacity-76 transition duration-500 group-hover:scale-105 group-hover:opacity-90"/>
        <div className="absolute inset-0 bg-gradient-to-t from-[#17091d] via-[#17091d]/32 to-transparent"/>
        <div className={cn("absolute inset-0 bg-gradient-to-br to-transparent opacity-80", selected ? selectedOverlay : "from-black/18")}/>
        <span className="absolute left-5 top-5 rounded-full border border-white/15 bg-black/45 px-3 py-1.5 text-[0.65rem] font-black uppercase tracking-[0.13em] text-white/82 backdrop-blur-md">
          {badge}
        </span>
        {selected && (<span className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f0b7ff] text-[#17061d] shadow-[0_0_24px_rgba(240,183,255,0.55)]">
            <CircleCheck size={24}/>
          </span>)}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-1 flex-col">
          <h2 className="min-h-[4rem] text-2xl font-black leading-tight text-white">{title}</h2>
          <p className="mt-4 min-h-[9rem] text-sm font-semibold leading-6 text-white/68">{description}</p>
          <p className="mt-5 min-h-[4rem] rounded-2xl border border-white/10 bg-[#0b0310]/72 px-4 py-3 text-xs font-black uppercase tracking-[0.08em] text-white/54">
            {focus}
          </p>
        </div>

        <span className={cn("inline-flex min-h-13 w-full items-center justify-center rounded-xl text-base font-black", selected ? "bg-gradient-to-r from-[#e8a3ff] to-[#c026ff] text-white shadow-[0_18px_40px_rgba(217,28,255,0.28)]" : "border border-current", color)}>
          {buttonLabel}
        </span>
      </div>
    </button>);
}
function SummaryBanner({ label, title, meta, image, actionLabel, onAction, }) {
    return (<div className="rounded-[1.35rem] border border-white/10 bg-[#211028] p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 gap-5">
          <img src={image} alt="" className="h-24 w-28 rounded-xl object-cover"/>
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
    </div>);
}
function SummaryItem({ icon: Icon, label, value }) {
    return (<div className="flex items-center gap-4">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-cyanGlow/12 text-cyanGlow">
        <Icon size={26}/>
      </span>
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-white/48">{label}</p>
        <p className="mt-1 text-2xl font-black text-white">{value}</p>
      </div>
    </div>);
}
function FormInput({ label, value, onChange, error, helper, className, type = "text", placeholder, maxLength, }) {
    return (<label className={cn("grid gap-3", className)}>
      <span className="text-xs font-black uppercase tracking-[0.12em] text-white/64">{label}</span>
      <input type={type} value={value} maxLength={maxLength} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} className={cn("min-h-14 rounded-xl border bg-[#0b0310] px-5 text-sm font-semibold text-white outline-none transition placeholder:text-white/30 focus:border-cyanGlow/65 focus:ring-2 focus:ring-cyanGlow/15", error ? "border-[#ff7aa8]/60" : "border-white/10")}/>
      {helper && !error && <span className="text-xs font-semibold text-white/42">{helper}</span>}
      {error && <span className="text-xs font-black text-[#ffb0c8]">{error}</span>}
    </label>);
}
function FormSelect({ label, value, options, onChange, error, placeholder, }) {
    return (<label className="grid gap-3">
      <span className="text-xs font-black uppercase tracking-[0.12em] text-white/64">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className={cn("min-h-14 rounded-xl border bg-[#0b0310] px-5 text-sm font-semibold text-white outline-none transition focus:border-cyanGlow/65 focus:ring-2 focus:ring-cyanGlow/15", error ? "border-[#ff7aa8]/60" : "border-white/10")}>
        <option value="" className="bg-[#0b0310] text-white/50">{placeholder}</option>
        {options.map((option) => (<option key={option} value={option} className="bg-[#0b0310] text-white">{option}</option>))}
      </select>
      {error && <span className="text-xs font-black text-[#ffb0c8]">{error}</span>}
    </label>);
}
function ReviewCard({ icon: Icon, title, onEdit, className, children, }) {
    return (<article className={cn("rounded-[1.35rem] border border-white/10 bg-[#211028] p-5", className)}>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h3 className="flex items-center gap-3 text-sm font-black text-white/72">
          <Icon className="text-cyanGlow" size={20}/>
          {title}
        </h3>
        <button type="button" onClick={onEdit} className="text-xs font-black text-[#f0b7ff] transition hover:text-white">
          Edit
        </button>
      </div>
      {children}
    </article>);
}
function SummaryRow({ icon: Icon, label, value }) {
    return (<div className="mt-4 flex items-center justify-between gap-4 border-t border-white/10 pt-4">
      <span className="flex items-center gap-3 text-sm font-black text-white/66">
        <Icon className="text-cyanGlow" size={18}/>
        {label}
      </span>
      <span className="text-right text-sm font-black text-white">{value}</span>
    </div>);
}
function StepActions({ step, canSubmit, onBack, onNext, }) {
    const nextLabel = step === 1
        ? "Next: Select Date & Time"
        : step === 2
            ? "Next: Confirm Teacher"
            : step === 3
                ? "Next: Personal Information"
                : step === 4
                    ? "Next: Guardian Details"
                    : step === 5
                        ? "Next: Review & Finish"
                        : "Finish & Submit";
    return (<div className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-[#16051d]/96 px-4 py-4 shadow-[0_-22px_70px_rgba(0,0,0,0.44)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="button" onClick={onBack} className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl px-5 text-sm font-black text-white/68 transition hover:text-white">
          <ArrowLeft size={20}/>
          Back
        </button>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={onNext} disabled={!canSubmit} className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#e8a3ff] via-[#c026ff] to-[#e026b4] px-8 text-sm font-black text-white shadow-[0_16px_45px_rgba(217,28,255,0.34)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0">
            {nextLabel}
            <ArrowRight size={20}/>
          </button>
        </div>
      </div>
    </div>);
}
export { draftStorageKey, submittedStorageKey, readSubmittedEnrolment, saveDraft, getDanceStyle, getClassSlot, getTeacher, };
