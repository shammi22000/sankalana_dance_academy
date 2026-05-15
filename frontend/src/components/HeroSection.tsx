import { danceImages } from "../assets/danceImages";
import { Button } from "./Button";
import { HeroCarousel } from "./HeroCarousel";

export function HeroSection() {
  function scrollToSection(sectionId: string) {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <section
      id="home"
      className="relative min-h-[calc(100svh-5rem)] overflow-hidden border-b border-white/10"
    >
      <HeroCarousel images={danceImages.heroCarousel} />

      <div className="relative z-30 mx-auto flex min-h-[calc(100svh-5rem)] max-w-7xl items-center px-4 pb-28 pt-14 sm:px-6 sm:pb-32 lg:px-8 lg:pb-28 lg:pt-16">
        <div className="max-w-4xl">
          <div className="mb-5 inline-flex text-[0.7rem] font-black uppercase tracking-[0.24em] text-champagne sm:text-xs">
            Sri Lankan Classical Dance
          </div>

          <h1 className="max-w-4xl text-balance text-4xl font-black leading-[1.05] tracking-normal text-white sm:text-5xl lg:text-6xl xl:text-7xl">
            Discover The Art Of Movement
          </h1>

          <p className="mt-6 max-w-2xl text-base font-semibold leading-8 text-white/78 sm:text-lg">
            Experience the grace and tradition of Sri Lankan classical dance through expert
            guidance, authentic choreography, and modern academy management.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <Button
              variant="gold"
              className="min-h-12 rounded-full px-8 text-sm"
              onClick={() => scrollToSection("disciplines")}
            >
              Explore Classes
            </Button>
            <Button
              variant="ghost"
              className="min-h-12 rounded-full border border-champagne/70 bg-transparent px-8 text-sm text-champagne hover:border-champagne hover:bg-champagne/10"
              onClick={() => scrollToSection("about")}
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
