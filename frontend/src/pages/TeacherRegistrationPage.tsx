import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { ArrowRight, CloudUpload, ImagePlus, X } from "lucide-react";
import { PageFooter } from "../components/PageFooter";
import { PageHeader } from "../components/PageHeader";
import { registerTeacher } from "../services/teacherRegistrationService";
import type { TeachingDay } from "../types/teacherRegistration";
import { showErrorAlert, showSuccessAlert } from "../utils/alerts";
import { cn } from "../utils/cn";

const inputClass =
  "min-h-14 w-full rounded-lg border border-white/10 bg-black/25 px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-white/35 focus:border-champagne/60 focus:ring-2 focus:ring-champagne/20 sm:text-base";
const labelClass = "text-xs font-black uppercase tracking-[0.18em] text-champagne";
const sectionClass =
  "rounded-[1.5rem] border border-[#5c2520]/85 bg-[#180607]/88 p-6 shadow-[0_26px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl sm:p-8";

const teachingDays: TeachingDay[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const danceStyleOptions = ["Kandyan Dancing", "Low Country Dancing", "Sabaragamu", "Contemporary"];
const maxAvatarFileSize = 1_000_000;
const avatarFileTypes = ["image/png", "image/jpeg", "image/webp"];

export function TeacherRegistrationPage() {
  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const [availableDays, setAvailableDays] = useState<TeachingDay[]>([]);
  const [avatarFileName, setAvatarFileName] = useState("");
  const [avatarPreviewDataUrl, setAvatarPreviewDataUrl] = useState("");
  const [selectedFileName, setSelectedFileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    const form = event.currentTarget;
    const formData = new FormData(form);

    setIsSubmitting(true);

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
        avatarFileName: avatarFileName || undefined,
        avatarImageDataUrl: avatarPreviewDataUrl || undefined,
        portfolioFileName: selectedFileName || undefined,
        password: String(formData.get("password") ?? ""),
        confirmPassword: String(formData.get("confirmPassword") ?? ""),
      });

      form.reset();
      setAvailableDays([]);
      clearAvatarAttachment();
      setSelectedFileName("");
      await showSuccessAlert(
        "Application Submitted",
        `Application submitted for ${teacher.fullName}. You can login after admin approval.`,
      );
    } catch (registrationError) {
      await showErrorAlert(
        "Application Failed",
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

        <section className="relative z-10 mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.34em] text-champagne">Faculty Application</p>
            <h1 className="mt-4 text-balance text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
              Teacher Registration
            </h1>
            <p className="mt-4 text-base font-semibold leading-8 text-white/70 sm:text-lg">
              Join our faculty and inspire the next generation of movement.
            </p>
          </div>

          <form className="mt-9 grid gap-6" onSubmit={handleSubmit}>
            <section className={sectionClass}>
              <div className="flex flex-col gap-3 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-cyanGlow">01</p>
                  <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">Personal Details</h2>
                </div>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-[17rem_1fr] lg:items-start">
                <div className="grid gap-3">
                  <span className={labelClass}>Profile Avatar</span>
                  <label className="group grid min-h-[15rem] cursor-pointer place-items-center rounded-2xl border border-dashed border-white/20 bg-black/25 p-5 text-center transition hover:border-champagne/60 hover:bg-champagne/10">
                    <span className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-[#100405] shadow-[0_0_32px_rgba(244,199,107,0.14)]">
                      {avatarPreviewDataUrl ? (
                        <img src={avatarPreviewDataUrl} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <ImagePlus className="text-champagne" size={36} />
                      )}
                    </span>
                    <span className="mt-4 block max-w-full truncate text-sm font-semibold text-white/80 sm:text-base">
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
                      className="inline-flex w-fit items-center gap-2 text-sm font-black text-white/60 transition hover:text-champagne"
                    >
                      <X size={16} />
                      Remove image
                    </button>
                  )}
                </div>

                <div className="grid content-start gap-5 sm:grid-cols-2">
                  <label className="grid gap-3 sm:col-span-2">
                    <span className={labelClass}>Full Name</span>
                    <input className={inputClass} name="fullName" placeholder="Alex Rivers" required />
                  </label>

                  <label className="grid gap-3">
                    <span className={labelClass}>Email Address</span>
                    <input
                      className={inputClass}
                      name="email"
                      type="email"
                      placeholder="alex.rivers@sankalana.com"
                      required
                    />
                  </label>

                  <label className="grid gap-3">
                    <span className={labelClass}>Phone Number</span>
                    <input className={inputClass} name="phone" placeholder="+358 40 000 0000" required />
                  </label>
                </div>
              </div>
            </section>

            <section className={sectionClass}>
              <div className="flex flex-col gap-3 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-cyanGlow">02</p>
                  <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">Teaching Profile</h2>
                </div>
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-3">
                <label className="grid gap-3">
                  <span className={labelClass}>Dancing Style</span>
                  <select className={`${inputClass} cursor-pointer`} name="danceStyles" defaultValue="" required>
                    <option value="" disabled className="bg-[#180607] text-white/50">
                      Select dancing style
                    </option>
                    {danceStyleOptions.map((style) => (
                      <option key={style} value={style} className="bg-[#180607] text-white">
                        {style}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-3">
                  <span className={labelClass}>Experience Years</span>
                  <input className={inputClass} name="experienceYears" type="number" min={0} placeholder="8" required />
                </label>

                <label className="grid gap-3">
                  <span className={labelClass}>Qualifications</span>
                  <input
                    className={inputClass}
                    name="qualifications"
                    placeholder="Dance diploma, certified instructor"
                    required
                  />
                </label>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_24rem]">
                <label className="grid gap-3">
                  <span className={labelClass}>Short Biography</span>
                  <textarea
                    className={`${inputClass} min-h-[17rem] resize-none leading-7`}
                    name="biography"
                    placeholder="Tell us about your journey, teaching philosophy, and what makes your classes unique..."
                    required
                  />
                </label>

                <div className="grid content-start gap-6">
                  <div className="grid gap-4">
                    <span className={labelClass}>Available Teaching Days</span>
                    <div className="flex flex-wrap gap-3">
                      {teachingDays.map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleTeachingDay(day)}
                          className={cn(
                            "min-h-11 min-w-14 rounded-full border px-4 text-sm font-black transition",
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
                    <span className={labelClass}>Upload CV / Portfolio</span>
                    <span className="grid min-h-[11rem] cursor-pointer place-items-center rounded-2xl border border-dashed border-white/20 bg-black/25 px-5 text-center transition hover:border-champagne/60 hover:bg-champagne/10">
                      <span>
                        <CloudUpload className="mx-auto text-champagne" size={32} />
                        <span className="mt-4 block max-w-full truncate text-sm font-semibold text-white/80 sm:text-base">
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

            <section className={sectionClass}>
              <div className="flex flex-col gap-3 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.28em] text-cyanGlow">03</p>
                  <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">Account Access</h2>
                </div>
              </div>

              <div className="mt-6 grid gap-5 lg:grid-cols-3">
                <label className="grid gap-3">
                  <span className={labelClass}>Username</span>
                  <input className={inputClass} name="username" placeholder="alex_teacher" required />
                </label>

                <label className="grid gap-3">
                  <span className={labelClass}>Password</span>
                  <input className={inputClass} name="password" type="password" minLength={6} placeholder="••••••" required />
                </label>

                <label className="grid gap-3">
                  <span className={labelClass}>Confirm Password</span>
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

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-lg bg-champagne px-7 py-3 text-sm font-extrabold text-ink transition duration-200 hover:-translate-y-0.5 hover:bg-[#ffd887] hover:shadow-[0_0_22px_rgba(244,199,107,0.28)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 sm:w-auto"
              >
                {isSubmitting ? "Saving..." : "Submit Application"}
                <ArrowRight size={22} />
              </button>
            </div>

          </form>
        </section>
      </main>

      <PageFooter />
    </div>
  );
}
