import { ArrowRight, BadgeCheck, GraduationCap, ShieldCheck, UserRoundCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { PageFooter } from "../components/PageFooter";
import { PageHeader } from "../components/PageHeader";
import { cn } from "../utils/cn";

const registrationOptions = [
  {
    role: "student" as const,
    title: "Register as Student",
    description:
      "Join classes, submit enrolment for our programs, and track your choreographic progress through your personal dashboard.",
    action: "Start Learning",
    icon: GraduationCap,
    accent: "orchid",
    benefits: ["Browse & book masterclasses", "View performance schedules"],
  },
  {
    role: "teacher" as const,
    title: "Register as Teacher",
    description:
      "Manage your curriculum, track student attendance, and organize performances after profile approval.",
    action: "Apply to Teach",
    icon: UserRoundCheck,
    accent: "cyan",
    benefits: ["Professional instructor tools", "Class & studio management"],
  },
];

export function RegistrationPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#120405] text-white">
      <PageHeader />

      <main className="relative min-h-[calc(100svh-5rem)] px-4 py-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(244,199,107,0.12),transparent_24rem),radial-gradient(circle_at_80%_35%,rgba(41,216,255,0.08),transparent_26rem)]" />
        <div className="absolute inset-x-[-10%] bottom-0 h-48 rounded-[50%_50%_0_0] bg-[#2b0b08]/75 blur-[1px]" />

        <section className="relative z-10 mx-auto max-w-7xl">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-balance text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
              Create Your Account
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-white/70 sm:text-base">
              Step into the spotlight. Choose your role to begin your journey with Sankalana.
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {registrationOptions.map((option) => {
              const Icon = option.icon;
              const isTeacher = option.role === "teacher";

              return (
                <article
                  key={option.role}
                  className="group relative overflow-hidden rounded-[1.7rem] border border-[#5c2520] bg-[#180607]/82 p-8 text-center shadow-[0_26px_80px_rgba(0,0,0,0.25)] backdrop-blur-xl transition duration-500 hover:-translate-y-1 hover:border-champagne/50 sm:p-10"
                >
                  <div
                    className={cn(
                      "absolute -right-24 -top-24 h-64 w-64 rounded-full blur-3xl transition group-hover:scale-110",
                      isTeacher ? "bg-cyanGlow/10" : "bg-champagne/10",
                    )}
                  />
                  <div className="relative z-10">
                    <span
                      className={cn(
                        "mx-auto inline-flex h-20 w-20 items-center justify-center rounded-full",
                        isTeacher ? "bg-cyanGlow/10 text-cyanGlow" : "bg-champagne text-[#170706]",
                      )}
                    >
                      <Icon size={38} strokeWidth={2.3} />
                    </span>

                    <h2 className="mt-9 text-balance text-2xl font-black leading-tight text-white sm:text-3xl">
                      {option.title}
                    </h2>
                    <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/70 sm:text-base">
                      {option.description}
                    </p>

                    <ul className="mx-auto mt-10 grid max-w-md gap-5 text-left">
                      {option.benefits.map((benefit) => (
                        <li key={benefit} className="flex items-center gap-4 text-sm font-black tracking-[0.08em] text-white/80">
                          {isTeacher ? (
                            <ShieldCheck className="shrink-0 text-cyanGlow" size={22} />
                          ) : (
                            <BadgeCheck className="shrink-0 text-[#e7a6ff]" size={22} />
                          )}
                          {benefit}
                        </li>
                      ))}
                    </ul>

                    <Link
                      to={isTeacher ? "/teacher-register" : "/student-register"}
                      className={cn(
                        "mt-10 inline-flex min-h-11 w-full items-center justify-center gap-3 rounded-lg px-6 py-3 text-sm font-extrabold transition duration-300",
                        isTeacher
                          ? "border-2 border-cyanGlow bg-transparent text-cyanGlow hover:bg-cyanGlow/10"
                          : "bg-champagne text-ink shadow-[0_0_22px_rgba(244,199,107,0.16)] hover:-translate-y-0.5 hover:bg-[#ffd887]",
                      )}
                    >
                      {option.action}
                      <ArrowRight size={22} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>

          <p className="mt-12 text-center text-sm font-black tracking-[0.08em] text-white/75">
            Already have an account?{" "}
            <Link to="/login" className="text-champagne transition hover:text-white">
              Sign in here
            </Link>
          </p>
        </section>
      </main>

      <PageFooter />
    </div>
  );
}
