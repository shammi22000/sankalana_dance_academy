import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { brandAssets } from "../assets/brand";
import { getDashboardPath } from "../utils/authSession";
import { navLinks } from "../utils/landingContent";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const dashboardPath = getDashboardPath();
  const actionLabel = dashboardPath ? "Dashboard" : "Login Now";
  const actionPath = dashboardPath ?? "/login";

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#120708]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="#home" className="flex min-w-0 items-center" aria-label="Home">
          <span className="relative inline-flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-champagne/30 bg-black shadow-[0_0_24px_rgba(244,199,107,0.12)]">
            <img
              src={brandAssets.logo}
              alt="Sankalana logo"
              className="h-full w-full object-cover object-center"
            />
            <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
          </span>
        </a>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary navigation">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs font-semibold text-white/80 transition hover:text-cyanGlow"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            to={actionPath}
            className="inline-flex min-h-10 items-center justify-center rounded-full bg-champagne px-6 py-3 text-xs font-extrabold text-ink transition duration-200 hover:-translate-y-0.5 hover:bg-[#ffd887] hover:shadow-[0_0_22px_rgba(244,199,107,0.28)]"
          >
            {actionLabel}
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white lg:hidden"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-white/10 bg-[#160812] px-4 py-4 lg:hidden">
          <nav className="mx-auto grid max-w-7xl gap-2" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/10"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <Link
              to={actionPath}
              className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-champagne px-6 py-3 text-sm font-extrabold text-ink transition hover:bg-[#ffd887]"
              onClick={() => setMenuOpen(false)}
            >
              {actionLabel}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
