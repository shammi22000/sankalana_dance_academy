import { disciplines } from "../utils/landingContent";
import { DisciplineCard } from "./DisciplineCard";

export function DisciplinesSection() {
  return (
    <section
      id="disciplines"
      className="relative overflow-hidden border-y border-[#4d201b] bg-[#0b0304] px-4 py-24 sm:px-6 lg:px-8 lg:py-32"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-champagne/60 to-transparent" />
      <div className="mx-auto max-w-[92rem]">
        <div className="mx-auto max-w-5xl text-center">
          <p className="text-sm font-black uppercase tracking-[0.55em] text-[#d3a06c] sm:text-base">
            Classical Heritage
          </p>
          <h2 className="mt-8 text-balance text-5xl font-black leading-none text-white sm:text-6xl lg:text-7xl">
            Our Dance Forms
          </h2>
          <p className="mx-auto mt-9 max-w-4xl text-xl font-bold leading-9 text-[#d9c8ba] sm:text-2xl">
            Master the ancient art forms that have been passed down through generations.
          </p>
        </div>

        <div className="mt-20 grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
          {disciplines.map((discipline) => (
            <DisciplineCard key={discipline.title} {...discipline} />
          ))}
        </div>
      </div>
    </section>
  );
}
