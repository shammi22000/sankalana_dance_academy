import { ArrowRight } from "lucide-react";
import { cn } from "../utils/cn";

interface DisciplineCardProps {
  title: string;
  description: string;
  image: string;
  imagePosition?: string;
}

export function DisciplineCard({ title, description, image, imagePosition = "center" }: DisciplineCardProps) {
  const isLongTitle = title.length > 11;

  return (
    <article className="group relative min-h-[470px] overflow-hidden rounded-[1.7rem] border border-[#6f3427] bg-[#1b0708] shadow-[0_24px_70px_rgba(0,0,0,0.28)] transition duration-500 hover:-translate-y-2 hover:border-champagne/70 hover:shadow-[0_34px_90px_rgba(214,159,95,0.18)] sm:min-h-[520px]">
      <img
        src={image}
        alt={`${title} dance form`}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover opacity-75 saturate-125 transition duration-700 group-hover:scale-105 group-hover:opacity-90"
        style={{ objectPosition: imagePosition }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#120304] via-[#2b0c07]/50 to-black/10" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#120304] via-[#120304]/70 to-transparent" />

      <div className="relative z-10 flex h-full min-h-[470px] flex-col justify-end p-8 sm:min-h-[520px] sm:p-9">
        <h3
          className={cn(
            "max-w-full font-black leading-[1.04] text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.35)] [overflow-wrap:anywhere]",
            isLongTitle
              ? "text-[2.35rem] sm:text-[2.7rem] xl:text-[2.35rem] 2xl:text-[2.55rem]"
              : "text-4xl sm:text-5xl lg:text-[2.75rem]",
          )}
        >
          {title}
        </h3>
        <p className="mt-6 max-w-[17rem] text-xl font-extrabold leading-8 text-[#d8b38a] sm:text-2xl">
          {description}
        </p>
        <a
          href="#contact"
          className="mt-8 inline-flex w-fit items-center gap-4 text-xl font-black text-champagne transition group-hover:gap-5 group-hover:text-white"
        >
          Learn More
          <ArrowRight size={25} strokeWidth={2.8} />
        </a>
      </div>
    </article>
  );
}
