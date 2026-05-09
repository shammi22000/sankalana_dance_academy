import { FormEvent, useState } from "react";
import { ArrowRight, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { danceImages } from "../assets/danceImages";
import { PageFooter } from "../components/PageFooter";
import { PageHeader } from "../components/PageHeader";
import { loginAdmin } from "../services/authService";

const adminSessionKey = "sankalanaAdminSession";

function hasAdminSession() {
  return Boolean(localStorage.getItem(adminSessionKey));
}

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (hasAdminSession()) {
    return <Navigate to="/admin-dashboard" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const username = String(formData.get("username") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    setIsSubmitting(true);
    setError("");

    try {
      const authentication = await loginAdmin({ username, password });

      localStorage.setItem(adminSessionKey, JSON.stringify(authentication));
      navigate("/admin-dashboard", { replace: true });
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Invalid admin username or password.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <PageHeader ctaLabel="Home" ctaTo="/" />

      <main className="relative min-h-[calc(100svh-5rem)] overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
        <img
          src={danceImages.heroCarousel[2].src}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-20 blur-[1px] saturate-125"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a061f]/95 via-black/94 to-[#001313]/96" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_38%_20%,rgba(217,28,255,0.2),transparent_28rem),radial-gradient(circle_at_76%_70%,rgba(41,216,255,0.12),transparent_26rem)]" />

        <section className="relative z-10 mx-auto flex min-h-[calc(100svh-13rem)] max-w-7xl items-center justify-center">
          <div className="w-full max-w-xl overflow-hidden rounded-[1.8rem] border border-white/12 bg-[#130a14]/88 shadow-[0_30px_100px_rgba(0,0,0,0.46)] backdrop-blur-xl">
            <div className="h-1.5 bg-gradient-to-r from-[#bb26ff] via-cyanGlow to-[#e026b4]" />
            <div className="p-7 sm:p-10 lg:p-12">
              <div className="text-center">
                <span className="mx-auto inline-flex h-20 w-20 items-center justify-center rounded-2xl border border-orchid/35 bg-orchid/25 text-[#f0b7ff] shadow-[0_0_36px_rgba(217,28,255,0.24)]">
                  <ShieldCheck size={38} />
                </span>
                <h1 className="mt-8 text-4xl font-black leading-tight text-[#f4e7fb] sm:text-5xl">
                  Admin Login
                </h1>
                <p className="mt-4 text-base font-semibold text-white/68">
                  Secure access to academy management.
                </p>
              </div>

              <form className="mt-10 grid gap-6" onSubmit={handleSubmit}>
                <label className="grid gap-3">
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-white/70">
                    Admin Username
                  </span>
                  <span className="flex min-h-14 items-center gap-4 rounded-xl border border-white/12 bg-black/30 px-5 transition focus-within:border-cyanGlow/55 focus-within:ring-2 focus-within:ring-cyanGlow/15">
                    <UserRound className="shrink-0 text-white/52" size={23} />
                    <input
                      name="username"
                      placeholder="admin"
                      className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/35 sm:text-base"
                      autoComplete="username"
                      disabled={isSubmitting}
                      required
                    />
                  </span>
                </label>

                <label className="grid gap-3">
                  <span className="text-xs font-black uppercase tracking-[0.18em] text-white/70">
                    Password
                  </span>
                  <span className="flex min-h-14 items-center gap-4 rounded-xl border border-white/12 bg-black/30 px-5 transition focus-within:border-cyanGlow/55 focus-within:ring-2 focus-within:ring-cyanGlow/15">
                    <LockKeyhole className="shrink-0 text-white/52" size={23} />
                    <input
                      name="password"
                      type="password"
                      placeholder="admin"
                      className="w-full bg-transparent text-sm font-semibold text-white outline-none placeholder:text-white/35 sm:text-base"
                      autoComplete="current-password"
                      disabled={isSubmitting}
                      required
                    />
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-3 inline-flex min-h-14 items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#bb26ff] to-[#e026b4] px-6 py-3 text-lg font-black text-white shadow-[0_18px_55px_rgba(217,28,255,0.36)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {isSubmitting ? "Checking..." : "Access Portal"}
                  <ArrowRight size={26} />
                </button>

                <p className="text-center text-sm font-bold italic text-white/48">
                  Default demo credentials: admin / admin
                </p>

                {error && (
                  <p className="rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-4 text-center text-sm font-bold text-red-200">
                    {error}
                  </p>
                )}
              </form>
            </div>
          </div>
        </section>
      </main>

      <PageFooter />
    </div>
  );
}
