import { FormEvent, useEffect } from "react";
import { X } from "lucide-react";
import { useContactForm } from "../hooks/useContactForm";
import { showErrorAlert, showSuccessAlert } from "../utils/alerts";
import { Button } from "./Button";

interface ContactDialogProps {
  open: boolean;
  source: string;
  onClose: () => void;
}

export function ContactDialog({ open, source, onClose }: ContactDialogProps) {
  const { values, state, updateField, submit, resetStatus } = useContactForm(source);

  useEffect(() => {
    if (!open) {
      resetStatus();
      return;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onClose, resetStatus]);

  if (!open) {
    return null;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = await submit();

    if (result.success) {
      await showSuccessAlert("Inquiry Sent", result.message);
      onClose();
      return;
    }

    await showErrorAlert("Inquiry Failed", result.message);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center px-4 py-8">
      <button
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close contact form"
      />
      <div className="glass-panel relative w-full max-w-xl rounded-2xl p-6 shadow-[0_30px_90px_rgba(0,0,0,0.45)] sm:p-8">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="pr-12">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-cyanGlow">Contact</p>
          <h2 className="mt-3 text-3xl font-black text-white">Start the conversation</h2>
          <p className="mt-3 text-sm leading-6 text-white/70">
            Share a few details and the academy team will follow up with the right next step.
          </p>
        </div>

        <form className="mt-7 grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-bold text-white/75">
            Name
            <input
              value={values.name}
              onChange={(event) => updateField("name", event.target.value)}
              className="rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none transition placeholder:text-white/40 focus:border-cyanGlow/70 focus:ring-2 focus:ring-cyanGlow/20"
              placeholder="Your name"
              required
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-white/75">
            Email
            <input
              type="email"
              value={values.email}
              onChange={(event) => updateField("email", event.target.value)}
              className="rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none transition placeholder:text-white/40 focus:border-cyanGlow/70 focus:ring-2 focus:ring-cyanGlow/20"
              placeholder="you@example.com"
              required
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-white/75">
            Message
            <textarea
              value={values.message}
              onChange={(event) => updateField("message", event.target.value)}
              className="min-h-32 resize-y rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-white outline-none transition placeholder:text-white/40 focus:border-cyanGlow/70 focus:ring-2 focus:ring-cyanGlow/20"
              placeholder="Tell us what you want to build."
              required
            />
          </label>

          <Button type="submit" disabled={state === "submitting"} className="mt-2 w-full">
            {state === "submitting" ? "Sending..." : "Send Inquiry"}
          </Button>
        </form>
      </div>
    </div>
  );
}
