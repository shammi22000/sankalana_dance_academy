import { ArrowRight } from "lucide-react";
import { Button } from "./Button";

interface CtaSectionProps {
  onContactClick: (source?: string) => void;
}

export function CtaSection({ onContactClick }: CtaSectionProps) {
  return (
    <section id="enroll" className="px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#5d176e] via-[#5b1b6a] to-[#331327] px-6 py-12 text-center shadow-glow sm:px-10 lg:px-16">
        <h2 className="mx-auto max-w-2xl text-balance text-3xl font-black leading-tight text-white sm:text-4xl">
          Ready to Transform Your <span className="italic text-white">Backstage?</span>
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-white/75 sm:text-base">
          Join dance academies already using Sankalana to power their dreams. Start your free trial
          today and experience management in motion.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Button onClick={() => onContactClick("create-studio")} className="min-w-48">
            Create Your Studio
          </Button>
          <Button variant="ghost" onClick={() => onContactClick("contact-sales")} className="min-w-44">
            Contact Sales
            <ArrowRight size={17} className="ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
}
