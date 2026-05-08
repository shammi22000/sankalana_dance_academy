import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { brandAssets } from "../assets/brand";
import { getDashboardPath } from "../utils/authSession";
import { navLinks } from "../utils/landingContent";

interface PageHeaderProps {
  ctaLabel?: string;
  ctaTo?: string;
  onCtaClick?: () => void;
}

export function PageHeader({ ctaLabel = "Login Now", ctaTo = "/login", onCtaClick }: PageHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const dashboardPath = getDashboardPath();

  const routedLinks = navLinks.map((link) => ({
    label: link.label,
    to: link.href === "#home" ? "/" : `/${link.href}`,
  }));
  const showDashboardLink = Boolean(dashboardPath && (onCtaClick || ctaLabel !== "Login Now"));
  const headerLinks = dashboardPath && showDashboardLink
    ? [...routedLinks, { label: "Dashboard", to: dashboardPath }]
    : routedLinks;
  const resolvedCtaLabel = !onCtaClick && dashboardPath && ctaLabel === "Login Now" ? "Dashboard" : ctaLabel;
  const resolvedCtaTo = !onCtaClick && dashboardPath && ctaLabel === "Login Now" ? dashboardPath : ctaTo;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#120708]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center" aria-label="Home">
          <span className="relative inline-flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-champagne/30 bg-black shadow-[0_0_24px_rgba(244,199,107,0.12)]">
            <img
              src={brandAssets.logo}
              alt="Sankalana logo"
              className="h-full w-full object-cover object-center"
            />
            <span className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary navigation">
          {headerLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="text-xs font-semibold text-white/80 transition hover:text-cyanGlow"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {onCtaClick ? (
            <button
              type="button"
              onClick={onCtaClick}
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-champagne px-6 py-3 text-xs font-extrabold text-ink transition duration-200 hover:-translate-y-0.5 hover:bg-[#ffd887] hover:shadow-[0_0_22px_rgba(244,199,107,0.28)]"
            >
              {resolvedCtaLabel}
            </button>
          ) : (
            <Link
              to={resolvedCtaTo}
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-champagne px-6 py-3 text-xs font-extrabold text-ink transition duration-200 hover:-translate-y-0.5 hover:bg-[#ffd887] hover:shadow-[0_0_22px_rgba(244,199,107,0.28)]"
            >
              {resolvedCtaLabel}
            </Link>
          )}
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
            {headerLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/10"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {onCtaClick ? (
              <button
                type="button"
                className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-champagne px-6 py-3 text-sm font-extrabold text-ink transition hover:bg-[#ffd887]"
                onClick={() => {
                  setMenuOpen(false);
                  onCtaClick();
                }}
              >
                {resolvedCtaLabel}
              </button>
            ) : (
              <Link
                to={resolvedCtaTo}
                className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-champagne px-6 py-3 text-sm font-extrabold text-ink transition hover:bg-[#ffd887]"
                onClick={() => setMenuOpen(false)}
              >
                {resolvedCtaLabel}
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
