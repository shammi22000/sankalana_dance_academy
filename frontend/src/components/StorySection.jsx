import { storyImages } from "../utils/landingContent";
import { SectionHeader } from "./SectionHeader";
const values = [
    {
        title: "Mission",
        text: "To harmonize studio operations through thoughtful design and insight.",
    },
    {
        title: "Vision",
        text: "Setting the global standard for elegant academy management.",
    },
];
export function StorySection() {
    return (<section id="about" className="px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.95fr_1fr]">
        <div className="grid grid-cols-2 gap-5">
          {storyImages.map((image, index) => (<div key={image} className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_24px_60px_rgba(0,0,0,0.25)]">
              <img src={image} alt={`Dance academy moment ${index + 1}`} loading="lazy" className="aspect-square h-full w-full object-cover opacity-85 transition duration-500 group-hover:scale-105 group-hover:opacity-100"/>
            </div>))}
        </div>

        <div>
          <SectionHeader align="left" eyebrow="Behind the Curtain at Sankalana" title="Where Passion Meets Technology"/>
          <div className="mt-6 space-y-4 text-sm leading-7 text-white/75 sm:text-base">
            <p>
              Our studio experience was built for management teams who need a system as precise and
              expressive as the work happening inside each class.
            </p>
            <p>
              The platform removes friction from administration, giving instructors, students, and
              operators a shared place to coordinate schedules, enrolments, attendance, and progress.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {values.map((value) => (<div key={value.title} className="glass-panel rounded-xl p-5">
                <h3 className="text-base font-black text-cyanGlow">{value.title}</h3>
                <p className="mt-2 text-xs leading-5 text-white/70">{value.text}</p>
              </div>))}
          </div>
        </div>
      </div>
    </section>);
}
