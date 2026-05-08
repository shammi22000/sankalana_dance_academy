import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";

type ButtonVariant = "primary" | "outline" | "gold" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-orchid text-white shadow-glow hover:-translate-y-0.5 hover:bg-[#f120ff] hover:shadow-[0_0_34px_rgba(217,28,255,0.34)]",
  outline:
    "border border-cyanGlow/90 bg-cyanGlow/5 text-white hover:-translate-y-0.5 hover:bg-cyanGlow/20 hover:shadow-cyan",
  gold:
    "bg-champagne text-ink hover:-translate-y-0.5 hover:bg-[#ffd887] hover:shadow-[0_0_22px_rgba(244,199,107,0.28)]",
  ghost:
    "border border-white/10 bg-white/5 text-white hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10",
};

export function Button({ variant = "primary", className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-lg px-6 py-3 text-sm font-extrabold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60",
        variantClasses[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
