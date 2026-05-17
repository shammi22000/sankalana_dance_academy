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
    <article className="group relative min-h-[390px] overflow-hidden rounded-2xl border border-[#6f3427] bg-[#1b0708] shadow-[0_20px_55px_rgba(0,0,0,0.24)] transition duration-500 hover:-translate-y-1 hover:border-champagne/70 hover:shadow-[0_28px_70px_rgba(214,159,95,0.16)] sm:min-h-[430px]">
      <img
        src={image}
        alt={`${title} dance form`}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover opacity-75 saturate-125 transition duration-700 group-hover:scale-105 group-hover:opacity-90"
        style={{ objectPosition: imagePosition }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#120304] via-[#2b0c07]/50 to-black/10" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#120304] via-[#120304]/70 to-transparent" />

      <div className="relative z-10 flex h-full min-h-[390px] flex-col justify-end p-6 sm:min-h-[430px] sm:p-7">
        <h3
          className={cn(
            "max-w-full font-black leading-tight text-white drop-shadow-[0_4px_18px_rgba(0,0,0,0.35)] [overflow-wrap:anywhere]",
            isLongTitle
              ? "text-3xl sm:text-[2.1rem] xl:text-3xl 2xl:text-[2.1rem]"
              : "text-3xl sm:text-4xl lg:text-[2.15rem]",
          )}
        >
          {title}
        </h3>
        <p className="mt-4 max-w-[17rem] text-base font-semibold leading-7 text-[#d8b38a]">
          {description}
        </p>
        <a
          href="#contact"
          className="mt-6 inline-flex w-fit items-center gap-3 text-sm font-black text-champagne transition group-hover:gap-4 group-hover:text-white"
        >
          Learn More
          <ArrowRight size={18} strokeWidth={2.8} />
        </a>
      </div>
    </article>
  );
}
