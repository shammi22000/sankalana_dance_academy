import { ArrowRight, FileText, Video } from "lucide-react";
import { learningMaterials } from "../utils/landingContent";

export function LearningMaterialSection() {
  return (
    <section
      id="learning-material"
      className="relative overflow-hidden border-y border-[#4d201b] bg-[#080202] px-4 py-24 sm:px-6 lg:px-8 lg:py-32"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-champagne/50 to-transparent" />
      <div className="absolute left-1/2 top-20 h-80 w-80 -translate-x-1/2 rounded-full bg-champagne/5 blur-3xl" />

      <div className="relative mx-auto max-w-[92rem]">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-sm font-black uppercase tracking-[0.55em] text-[#d3a06c] sm:text-base">
            Educational Resources
          </p>
          <h2 className="mt-8 text-balance text-5xl font-black leading-none text-white sm:text-6xl lg:text-7xl">
            Learning Material
          </h2>
          <p className="mx-auto mt-9 max-w-5xl text-xl font-bold leading-9 text-[#d9c8ba] sm:text-2xl">
            Enhance your dance journey with our curated collection of videos and study materials.
          </p>
        </div>

        <div className="mt-20 grid gap-8 lg:grid-cols-2">
          {learningMaterials.map((material) => {
            const Icon = material.type === "video" ? Video : FileText;

            return (
              <article
                key={material.title}
                className="group relative min-h-[430px] overflow-hidden rounded-[1.7rem] border border-[#6f3427] bg-[#180607] p-9 shadow-[0_28px_90px_rgba(0,0,0,0.25)] transition duration-500 hover:-translate-y-2 hover:border-champagne/70 hover:bg-[#21090a] sm:p-12 lg:min-h-[500px]"
              >
                <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-champagne/10 blur-3xl transition group-hover:bg-champagne/20" />
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#080202] to-transparent" />

                <div className="relative z-10 flex h-full min-h-[352px] flex-col lg:min-h-[404px]">
                  <span className="inline-flex h-28 w-28 items-center justify-center rounded-full bg-[#d6a162] text-[#170706] shadow-[0_20px_60px_rgba(214,161,98,0.18)]">
                    <Icon size={46} strokeWidth={2.6} />
                  </span>

                  <h3 className="mt-14 text-balance text-4xl font-black leading-tight text-white sm:text-5xl">
                    {material.title}
                  </h3>
                  <p className="mt-8 max-w-2xl text-2xl font-bold leading-10 text-[#dfd0c3]">
                    {material.description}
                  </p>

                  <div className="mt-auto flex flex-col gap-5 pt-12 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-2xl font-black text-champagne">{material.count}</p>
                    <a
                      href="#contact"
                      className="inline-flex w-fit items-center gap-4 text-2xl font-black text-champagne transition group-hover:gap-5 group-hover:text-white"
                    >
                      {material.action}
                      <ArrowRight size={28} strokeWidth={2.8} />
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
