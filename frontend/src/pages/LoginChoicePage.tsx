import { ArrowRight, GraduationCap, UserRoundCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { cn } from "../utils/cn";

const loginOptions = [
  {
    title: "Student Login",
    description: "Continue your learning path, view classes, and follow your performance progress.",
    href: "/student-login",
    icon: GraduationCap,
    accent: "orchid",
  },
  {
    title: "Teacher Login",
    description: "Open your instructor dashboard, manage classes, and review student attendance.",
    href: "/teacher-login",
    icon: UserRoundCheck,
    accent: "cyan",
  },
];

export function LoginChoicePage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#120405] text-white">
      <PageHeader ctaLabel="Register" ctaTo="/register" />

      <main className="relative min-h-[calc(100svh-5rem)] px-4 py-20 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(244,199,107,0.12),transparent_25rem),radial-gradient(circle_at_78%_30%,rgba(41,216,255,0.08),transparent_25rem)]" />
        <div className="absolute inset-x-[-10%] bottom-0 h-48 rounded-[50%_50%_0_0] bg-[#2b0b08]/75" />

        <section className="relative z-10 mx-auto max-w-6xl">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-balance text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
              Choose Your Login
            </h1>
            <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-white/70 sm:text-base">
              Select how you want to enter Sankalana.
            </p>
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            {loginOptions.map((option) => {
              const Icon = option.icon;
              const isTeacher = option.accent === "cyan";

              return (
                <Link
                  key={option.href}
                  to={option.href}
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

                    <span
                      className={cn(
                        "mt-10 inline-flex min-h-11 w-full items-center justify-center gap-3 rounded-lg px-6 py-3 text-sm font-extrabold transition duration-300",
                        isTeacher
                          ? "border-2 border-cyanGlow bg-transparent text-cyanGlow group-hover:bg-cyanGlow/10"
                          : "bg-champagne text-ink shadow-[0_0_22px_rgba(244,199,107,0.16)] group-hover:-translate-y-0.5 group-hover:bg-[#ffd887]",
                      )}
                    >
                      Continue
                      <ArrowRight size={22} />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          <p className="mt-12 text-center text-sm font-black tracking-[0.08em] text-white/75">
            New to Sankalana?{" "}
            <Link to="/register" className="text-champagne transition hover:text-white">
              Create an account
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
