import { FormEvent, useState } from "react";
import { ArrowRight, CheckCircle2, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { PageFooter } from "../components/PageFooter";
import { PageHeader } from "../components/PageHeader";
import { registerStudent } from "../services/studentRegistrationService";
import type { StudentGender } from "../types/studentRegistration";
import { showErrorAlert, showSuccessAlert } from "../utils/alerts";

const inputClass =
  "min-h-14 w-full rounded-lg border border-white/10 bg-black/25 px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-white/35 focus:border-champagne/60 focus:ring-2 focus:ring-champagne/20 sm:text-base";

export function StudentRegistrationPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    setIsSubmitting(true);

    try {
      const student = await registerStudent({
        fullName: String(formData.get("fullName") ?? ""),
        email: String(formData.get("email") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        username: String(formData.get("username") ?? ""),
        gender: String(formData.get("gender") ?? "") as StudentGender,
        dateOfBirth: String(formData.get("dateOfBirth") ?? ""),
        password: String(formData.get("password") ?? ""),
        confirmPassword: String(formData.get("confirmPassword") ?? ""),
      });

      form.reset();
      await showSuccessAlert(
        "Registration Submitted",
        `Registration saved for ${student.fullName}. You can login after admin approval.`,
      );
    } catch (registrationError) {
      await showErrorAlert(
        "Registration Failed",
        registrationError instanceof Error
          ? registrationError.message
          : "Unable to register student right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#120405] text-white">
      <PageHeader />

      <main className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(244,199,107,0.12),transparent_25rem),radial-gradient(circle_at_72%_86%,rgba(41,216,255,0.08),transparent_24rem)]" />
        <div className="absolute inset-x-[12%] bottom-24 h-10 bg-[#2b0b08]/75 [clip-path:polygon(0_30%,30%_42%,52%_30%,74%_46%,100%_34%,100%_76%,0_76%)]" />

        <section className="relative z-10 mx-auto max-w-4xl rounded-[1.7rem] border border-[#5c2520] bg-[#180607]/82 p-7 shadow-[0_26px_80px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:p-10 lg:p-12">
          <div className="text-center">
            <h1 className="text-balance text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
              Student Registration
            </h1>
            <p className="mt-4 text-sm leading-7 text-white/70 sm:text-base">
              Join the rhythm and master your motion at Sankalana.
            </p>
          </div>

          <form className="mt-10 grid gap-6" onSubmit={handleSubmit}>
            <div className="grid gap-6 md:grid-cols-2">
              <label className="grid gap-3">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-champagne">
                  Full Name
                </span>
                <input className={inputClass} name="fullName" placeholder="Alex Rivers" required />
              </label>

              <label className="grid gap-3">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-champagne">
                  Email
                </span>
                <input className={inputClass} name="email" type="email" placeholder="alex@motion.com" required />
              </label>

              <label className="grid gap-3">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-champagne">
                  Phone
                </span>
                <input className={inputClass} name="phone" placeholder="+358 40 000 0000" required />
              </label>

              <label className="grid gap-3">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-champagne">
                  Username
                </span>
                <input className={inputClass} name="username" placeholder="alex_dancer" required />
              </label>

              <label className="relative grid gap-3">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-champagne">
                  Gender
                </span>
                <select className={`${inputClass} appearance-none`} name="gender" defaultValue="" required>
                  <option value="" disabled>
                    Select Gender
                  </option>
                  <option>Female</option>
                  <option>Male</option>
                  <option>Other</option>
                  <option>Prefer not to say</option>
                </select>
                <ChevronDown className="pointer-events-none absolute bottom-4 right-4 text-white/55" size={21} />
              </label>

              <label className="grid gap-3">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-champagne">
                  Date of Birth
                </span>
                <input className={inputClass} name="dateOfBirth" type="date" required />
              </label>

              <label className="grid gap-3">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-champagne">
                  Password
                </span>
                <input
                  className={inputClass}
                  name="password"
                  type="password"
                  placeholder="••••••"
                  minLength={6}
                  required
                />
              </label>

              <label className="grid gap-3">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-champagne">
                  Confirm Password
                </span>
                <input
                  className={inputClass}
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••"
                  minLength={6}
                  required
                />
              </label>
            </div>

            <div className="grid gap-3">
              <span className="text-xs font-black uppercase tracking-[0.18em] text-champagne">
                Account Role
              </span>
              <div className="flex min-h-14 items-center justify-between rounded-lg border border-champagne/60 bg-champagne/10 px-4 text-sm font-black text-champagne sm:text-base">
                Student
                <CheckCircle2 size={27} />
              </div>
              <p className="text-xs italic text-white/75">
                This registration is specifically for dance academy students.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 inline-flex min-h-14 items-center justify-center gap-3 rounded-lg bg-champagne px-6 py-3 text-sm font-extrabold text-ink transition duration-200 hover:-translate-y-0.5 hover:bg-[#ffd887] hover:shadow-[0_0_22px_rgba(244,199,107,0.28)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Saving..." : "Register"}
              <ArrowRight size={28} />
            </button>

            <div className="flex flex-col gap-4 border-t border-white/10 pt-8 text-sm font-semibold text-white/80 sm:flex-row sm:items-center sm:justify-between">
              <p>
                Already have an account?{" "}
                <Link to="/student-login" className="font-black text-champagne transition hover:text-white">
                  Login
                </Link>
              </p>
              <Link
                to="/teacher-register"
                className="inline-flex items-center gap-2 font-black text-champagne transition hover:text-white"
              >
                Teacher Registration
                <ArrowRight size={17} />
              </Link>
            </div>
          </form>
        </section>
      </main>

      <PageFooter />
    </div>
  );
}
