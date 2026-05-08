import { FormEvent, useState } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { danceImages } from "../assets/danceImages";
import { PageFooter } from "./PageFooter";
import { PageHeader } from "./PageHeader";
import type { LoginCredentials } from "../types/auth";

interface AuthLoginPageProps {
  roleLabel: "Student" | "Teacher";
  subtitle: string;
  statusMessage: string;
  onSubmit?: (credentials: LoginCredentials) => Promise<string | void> | string | void;
}

export function AuthLoginPage({ roleLabel, subtitle, statusMessage, onSubmit }: AuthLoginPageProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const registrationPath = roleLabel === "Student" ? "/student-register" : "/teacher-register";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const credentials = {
      identity: String(formData.get("identity") ?? ""),
      password: String(formData.get("password") ?? ""),
    };

    setStatus("submitting");
    setMessage("");

    try {
      const successMessage = onSubmit ? await onSubmit(credentials) : statusMessage;

      setStatus("success");
      setMessage(successMessage || statusMessage);
    } catch (loginError) {
      setStatus("error");
      setMessage(loginError instanceof Error ? loginError.message : "Unable to login right now.");
    }
  }

  return (
    <div className="min-h-screen bg-[#120405] text-white">
      <PageHeader ctaLabel="Register" ctaTo={registrationPath} />

      <main className="relative min-h-[calc(100svh-5rem)] overflow-hidden">
        <img
          src={roleLabel === "Student" ? danceImages.heroCarousel[1].src : danceImages.heroCarousel[2].src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-30 blur-[1px] saturate-125"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#120405]/92 via-[#120405]/90 to-[#0b0304]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_34%,rgba(244,199,107,0.12),transparent_30rem)]" />

        <section className="relative z-10 mx-auto flex min-h-[calc(100svh-5rem)] max-w-7xl items-center justify-center px-4 py-20 sm:px-6 lg:px-8">
          <div className="w-full max-w-2xl rounded-[1.7rem] border border-[#5c2520] bg-[#180607]/82 p-7 shadow-[0_26px_80px_rgba(0,0,0,0.25)] backdrop-blur-xl sm:p-10 lg:p-12">
            <div className="text-center">
              <h1 className="text-balance text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
                {roleLabel} <span className="italic text-champagne">Login</span>
              </h1>
              <p className="mt-4 text-sm leading-7 text-white/70 sm:text-base">{subtitle}</p>
            </div>

            <form className="mt-10 grid gap-6" onSubmit={handleSubmit}>
              <label className="grid gap-3">
                <span className="text-xs font-black uppercase tracking-[0.18em] text-champagne">
                  Identity
                </span>
                <span className="flex min-h-14 items-center gap-4 rounded-lg border border-white/10 bg-[#100404]/90 px-5 transition focus-within:border-champagne/60 focus-within:ring-2 focus-within:ring-champagne/20">
                  <UserRound className="shrink-0 text-white/55" size={25} />
                  <input
                    name="identity"
                    placeholder="Email or Username"
                    className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/35 sm:text-base"
                    autoComplete="username"
                    disabled={status === "submitting"}
                    required
                  />
                </span>
              </label>

              <label className="grid gap-3">
                <span className="flex items-center justify-between gap-4">
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-champagne">
                    Security
                  </span>
                  <Link
                    to="/#contact"
                    className="text-xs font-black uppercase tracking-[0.14em] text-cyanGlow transition hover:text-white"
                  >
                    Forgot Password?
                  </Link>
                </span>
                <span className="flex min-h-14 items-center gap-4 rounded-lg border border-white/10 bg-[#100404]/90 px-5 transition focus-within:border-champagne/60 focus-within:ring-2 focus-within:ring-champagne/20">
                  <LockKeyhole className="shrink-0 text-white/55" size={25} />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/35 sm:text-base"
                    autoComplete="current-password"
                    disabled={status === "submitting"}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="text-white/55 transition hover:text-white"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                  </button>
                </span>
              </label>

              <button
                type="submit"
                disabled={status === "submitting"}
                className="mt-2 inline-flex min-h-14 items-center justify-center gap-3 rounded-lg bg-champagne px-6 py-3 text-sm font-extrabold text-ink transition duration-200 hover:-translate-y-0.5 hover:bg-[#ffd887] hover:shadow-[0_0_22px_rgba(244,199,107,0.28)] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {status === "submitting" ? "Checking..." : "Enter the Stage"}
                <ArrowRight size={28} />
              </button>

              <div className="mt-7 border-t border-white/10 pt-7 text-center text-sm font-semibold text-white/75 sm:text-base">
                New to Sankalana?{" "}
                <Link to={registrationPath} className="font-black text-champagne transition hover:text-white">
                  Register Now
                </Link>
              </div>

              {(status === "success" || status === "error") && (
                <p
                  className={`rounded-2xl border px-5 py-4 text-center text-sm font-bold ${
                    status === "success"
                      ? "border-cyanGlow/30 bg-cyanGlow/10 text-cyanGlow"
                      : "border-red-400/30 bg-red-500/10 text-red-200"
                  }`}
                >
                  {message}
                </p>
              )}
            </form>
          </div>
        </section>
      </main>

      <PageFooter />
    </div>
  );
}
