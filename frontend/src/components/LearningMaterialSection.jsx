import { ArrowRight, FileText, Video } from "lucide-react";
import { learningMaterials } from "../utils/landingContent";
export function LearningMaterialSection() {
    return (<section id="learning-material" className="relative overflow-hidden border-y border-[#4d201b] bg-[#080202] px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-champagne/50 to-transparent"/>
      <div className="absolute left-1/2 top-20 h-80 w-80 -translate-x-1/2 rounded-full bg-champagne/5 blur-3xl"/>

      <div className="relative mx-auto max-w-[92rem]">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#d3a06c]">
            Educational Resources
          </p>
          <h2 className="mt-4 text-balance text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
            Learning Material
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base font-semibold leading-7 text-[#d9c8ba]">
            Enhance your dance journey with our curated collection of videos and study materials.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {learningMaterials.map((material) => {
            const Icon = material.type === "video" ? Video : FileText;
            return (<article key={material.title} className="group relative min-h-[320px] overflow-hidden rounded-2xl border border-[#6f3427] bg-[#180607] p-6 shadow-[0_24px_70px_rgba(0,0,0,0.22)] transition duration-500 hover:-translate-y-1 hover:border-champagne/70 hover:bg-[#21090a] sm:p-8 lg:min-h-[380px]">
                <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-champagne/10 blur-3xl transition group-hover:bg-champagne/20"/>
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#080202] to-transparent"/>

                <div className="relative z-10 flex h-full min-h-[272px] flex-col lg:min-h-[316px]">
                  <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#d6a162] text-[#170706] shadow-[0_20px_60px_rgba(214,161,98,0.18)]">
                    <Icon size={30} strokeWidth={2.6}/>
                  </span>

                  <h3 className="mt-8 text-balance text-2xl font-black leading-tight text-white sm:text-3xl">
                    {material.title}
                  </h3>
                  <p className="mt-4 max-w-2xl text-base font-semibold leading-7 text-[#dfd0c3]">
                    {material.description}
                  </p>

                  <div className="mt-auto flex flex-col gap-4 pt-8 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-lg font-black text-champagne">{material.count}</p>
                    <a href="#contact" className="inline-flex w-fit items-center gap-3 text-sm font-black text-champagne transition group-hover:gap-4 group-hover:text-white">
                      {material.action}
                      <ArrowRight size={18} strokeWidth={2.8}/>
                    </a>
                  </div>
                </div>
              </article>);
        })}
        </div>
      </div>
    </section>);
}
