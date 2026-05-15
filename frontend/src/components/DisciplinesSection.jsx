import { disciplines } from "../utils/landingContent";
import { DisciplineCard } from "./DisciplineCard";
export function DisciplinesSection() {
    return (<section id="disciplines" className="relative overflow-hidden border-y border-[#4d201b] bg-[#0b0304] px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-champagne/60 to-transparent"/>
      <div className="mx-auto max-w-[92rem]">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#d3a06c]">
            Classical Heritage
          </p>
          <h2 className="mt-4 text-balance text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
            Our Dance Forms
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base font-semibold leading-7 text-[#d9c8ba]">
            Master the ancient art forms that have been passed down through generations.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {disciplines.map((discipline) => (<DisciplineCard key={discipline.title} {...discipline}/>))}
        </div>
      </div>
    </section>);
}
