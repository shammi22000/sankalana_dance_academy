import { FormEvent, useRef, useState } from "react";
import { ArrowRight, CheckCircle2, CloudUpload, Info, Save } from "lucide-react";
import { PageFooter } from "../components/PageFooter";
import { PageHeader } from "../components/PageHeader";
import { registerTeacher } from "../services/teacherRegistrationService";
import type {
  TeacherApplicationStatus,
  TeacherRegistration,
  TeachingDay,
} from "../types/teacherRegistration";
import { cn } from "../utils/cn";

const inputClass =
  "min-h-14 w-full rounded-lg border border-white/10 bg-black/25 px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-white/35 focus:border-champagne/60 focus:ring-2 focus:ring-champagne/20 sm:text-base";

const teachingDays: TeachingDay[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function TeacherRegistrationPage() {
  const [availableDays, setAvailableDays] = useState<TeachingDay[]>([]);
  const [selectedFileName, setSelectedFileName] = useState("");
  const applicationStatusRef = useRef<TeacherApplicationStatus>("submitted");
  const [registeredTeacher, setRegisteredTeacher] = useState<TeacherRegistration | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleTeachingDay(day: TeachingDay) {
    setAvailableDays((currentDays) =>
      currentDays.includes(day)
        ? currentDays.filter((currentDay) => currentDay !== day)
        : [...currentDays, day],
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setIsSubmitting(true);
    setError(null);
    setRegisteredTeacher(null);

    try {
      const teacher = await registerTeacher({
        fullName: String(formData.get("fullName") ?? ""),
        email: String(formData.get("email") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        username: String(formData.get("username") ?? ""),
        danceStyles: String(formData.get("danceStyles") ?? ""),
        experienceYears: Number(formData.get("experienceYears") ?? 0),
        qualifications: String(formData.get("qualifications") ?? ""),
        biography: String(formData.get("biography") ?? ""),
        availableDays,
        portfolioFileName: selectedFileName || undefined,
        password: String(formData.get("password") ?? ""),
        confirmPassword: String(formData.get("confirmPassword") ?? ""),
        applicationStatus: applicationStatusRef.current,
      });

      setRegisteredTeacher(teacher);
      form.reset();
      setAvailableDays([]);
      setSelectedFileName("");
      applicationStatusRef.current = "submitted";
    } catch (registrationError) {
      setError(
        registrationError instanceof Error
          ? registrationError.message
          : "Unable to register teacher right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#120405] text-white">
      <PageHeader ctaLabel="Login Now" ctaTo="/teacher-login" />

      <main className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(244,199,107,0.12),transparent_28rem),radial-gradient(circle_at_12%_78%,rgba(41,216,255,0.08),transparent_25rem)]" />
        <div className="absolute inset-x-[-8%] bottom-40 h-44 bg-[#2b0b08]/75 [clip-path:polygon(0_44%,16%_58%,36%_50%,58%_62%,78%_44%,100%_40%,100%_100%,0_100%)]" />

        <section className="relative z-10 mx-auto max-w-6xl rounded-[1.7rem] border border-[#5c2520] bg-[#180607]/82 p-7 shadow-[0_26px_80px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:p-10 lg:p-12">
          <div>
            <h1 className="text-balance text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
              Teacher Registration
            </h1>
            <p className="mt-4 text-sm leading-7 text-white/70 sm:text-base">
              Join our faculty and inspire the next generation of movement.
            </p>
          </div>

          <form className="mt-10 grid gap-8" onSubmit={handleSubmit}>
            <div className="grid gap-8 lg:grid-cols-2">
              <section className="grid gap-5">
                <h2 className="border-l-4 border-champagne pl-5 text-xl font-black text-white sm:text-2xl">
                  Personal Details
                </h2>

                <label className="grid gap-3">
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-champagne">
                    Full Name
                  </span>
                  <input className={inputClass} name="fullName" placeholder="Alex Rivers" required />
                </label>

                <label className="grid gap-3">
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-champagne">
                    Email Address
                  </span>
                  <input
                    className={inputClass}
                    name="email"
                    type="email"
                    placeholder="alex.rivers@sankalana.com"
                    required
                  />
                </label>

                <label className="grid gap-3">
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-champagne">
                    Phone Number
                  </span>
                  <input className={inputClass} name="phone" placeholder="+358 40 000 0000" required />
                </label>
              </section>

              <section className="grid gap-5">
                <h2 className="border-l-4 border-champagne pl-5 text-xl font-black text-white sm:text-2xl">
                  Specialization
                </h2>

                <label className="grid gap-3">
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-champagne">
                    Dance Styles
                  </span>
                  <input className={inputClass} name="danceStyles" placeholder="Kandyan, Low Country, Folk" required />
                </label>

                <label className="grid gap-3">
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-champagne">
                    Experience Years
                  </span>
                  <input className={inputClass} name="experienceYears" type="number" min={0} placeholder="8" required />
                </label>

                <label className="grid gap-3">
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-champagne">
                    Qualifications
                  </span>
                  <input className={inputClass} name="qualifications" placeholder="Dance diploma, certified instructor" required />
                </label>
              </section>
            </div>

            <section className="grid gap-8 lg:grid-cols-2">
              <div className="grid gap-5">
                <h2 className="border-l-4 border-champagne pl-5 text-xl font-black text-white sm:text-2xl">
                  Professional Profile
                </h2>

                <label className="grid gap-3">
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-champagne">
                    Short Biography
                  </span>
                  <textarea
                    className={`${inputClass} min-h-40 resize-none leading-7`}
                    name="biography"
                    placeholder="Tell us about your journey, teaching philosophy, and what makes your classes unique..."
                    required
                  />
                </label>
              </div>

              <div className="grid content-start gap-6 pt-12 lg:pt-11">
                <div className="grid gap-4">
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-champagne">
                    Available Teaching Days
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {teachingDays.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleTeachingDay(day)}
                        className={cn(
                          "min-h-10 rounded-full border px-5 text-sm font-black transition",
                          availableDays.includes(day)
                            ? "border-champagne bg-champagne/20 text-champagne"
                            : "border-white/15 bg-white/[0.055] text-white/75 hover:border-champagne/50 hover:text-white",
                        )}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="grid gap-3">
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-champagne">
                    Upload CV / Portfolio
                  </span>
                  <span className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-white/20 bg-white/[0.055] px-5 text-center transition hover:border-champagne/60 hover:bg-champagne/10">
                    <CloudUpload className="text-champagne" size={32} />
                    <span className="mt-4 text-sm font-semibold text-white/80 sm:text-base">
                      {selectedFileName || "Drop files or browse"}
                    </span>
                    <span className="mt-2 text-xs font-bold uppercase tracking-[0.08em] text-white/45">
                      PDF, DOCX, or portfolio file
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
            </section>

            <section className="grid gap-5">
              <h2 className="border-l-4 border-champagne pl-5 text-xl font-black text-white sm:text-2xl">
                Account Access
              </h2>

              <div className="grid gap-5 lg:grid-cols-3">
                <label className="grid gap-3">
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-champagne">
                    Username
                  </span>
                  <input className={inputClass} name="username" placeholder="alex_teacher" required />
                </label>

                <label className="grid gap-3">
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-champagne">
                    Password
                  </span>
                  <input className={inputClass} name="password" type="password" minLength={6} placeholder="••••••" required />
                </label>

                <label className="grid gap-3">
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-champagne">
                    Confirm Password
                  </span>
                  <input
                    className={inputClass}
                    name="confirmPassword"
                    type="password"
                    minLength={6}
                    placeholder="••••••"
                    required
                  />
                </label>
              </div>
            </section>

            <div className="border-t border-white/10 pt-8">
              <div className="grid gap-6 lg:grid-cols-[1fr_auto_auto] lg:items-center">
                <p className="flex gap-4 text-sm font-bold leading-5 text-white/60">
                  <Info className="mt-0.5 shrink-0 text-cyanGlow" size={22} />
                  Review by admin before activation. You can still login after saving this application in the current demo database.
                </p>

                <button
                  type="submit"
                  onClick={() => {
                    applicationStatusRef.current = "draft";
                  }}
                  disabled={isSubmitting}
                  className="inline-flex min-h-11 items-center justify-center gap-3 rounded-lg border border-white/15 px-6 py-3 text-sm font-extrabold text-white transition hover:border-champagne/60 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Save size={21} />
                  Save Draft
                </button>

                <button
                  type="submit"
                  onClick={() => {
                    applicationStatusRef.current = "submitted";
                  }}
                  disabled={isSubmitting}
                  className="inline-flex min-h-11 items-center justify-center gap-3 rounded-lg bg-champagne px-6 py-3 text-sm font-extrabold text-ink transition duration-200 hover:-translate-y-0.5 hover:bg-[#ffd887] hover:shadow-[0_0_22px_rgba(244,199,107,0.28)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {isSubmitting ? "Saving..." : "Submit Application"}
                  <ArrowRight size={22} />
                </button>
              </div>
            </div>

            {registeredTeacher && (
              <p className="flex items-center justify-center gap-3 rounded-2xl border border-cyanGlow/30 bg-cyanGlow/10 px-5 py-4 text-center text-sm font-bold text-cyanGlow">
                <CheckCircle2 size={20} />
                {registeredTeacher.applicationStatus === "draft" ? "Draft saved" : "Application submitted"} for{" "}
                {registeredTeacher.fullName}. You can now login as a teacher.
              </p>
            )}

            {error && (
              <p className="rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-center text-sm font-bold text-red-200">
                {error}
              </p>
            )}
          </form>
        </section>
      </main>

      <PageFooter />
    </div>
  );
}
