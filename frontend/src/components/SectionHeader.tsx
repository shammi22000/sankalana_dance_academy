interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  accent?: string;
  description?: string;
  align?: "left" | "center";
}

export function SectionHeader({
  eyebrow,
  title,
  accent,
  description,
  align = "center",
}: SectionHeaderProps) {
  const isCentered = align === "center";

  return (
    <div className={isCentered ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow && (
        <p className="mb-4 text-sm font-black uppercase tracking-[0.18em] text-[#ef8cff]">
          {eyebrow}
        </p>
      )}
      <h2 className="text-balance text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
        {title}
        {accent && <span className="italic text-[#ef8cff]"> {accent}</span>}
      </h2>
      {description && <p className="mt-4 text-sm leading-7 text-white/70 sm:text-base">{description}</p>}
    </div>
  );
}
