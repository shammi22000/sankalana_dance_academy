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

      <div className="relative z-30 mx-auto flex min-h-[calc(100svh-5rem)] max-w-7xl items-center px-4 pb-36 pt-16 sm:px-6 sm:pb-40 lg:px-8 lg:pb-32 lg:pt-20">
        <div className="max-w-5xl">
          <div className="mb-8 inline-flex text-xs font-black uppercase tracking-[0.42em] text-champagne sm:text-sm">
            Sri Lankan Classical Dance
          </div>

          <h1 className="max-w-5xl text-balance text-5xl font-black leading-[0.98] tracking-normal text-white sm:text-7xl lg:text-8xl xl:text-[7.6rem]">
            Discover The Art Of Movement
          </h1>

          <p className="mt-8 max-w-3xl text-lg font-semibold leading-9 text-white/80 sm:text-2xl sm:leading-10">
            Experience the grace and tradition of Sri Lankan classical dance through expert
            guidance, authentic choreography, and modern academy management.
          </p>

          <div className="mt-11 flex flex-col gap-5 sm:flex-row">
            <Button
              variant="gold"
              className="min-h-16 rounded-full px-12 text-lg"
              onClick={() => scrollToSection("disciplines")}
            >
              Explore Classes
            </Button>
            <Button
              variant="ghost"
              className="min-h-16 rounded-full border-2 border-champagne/80 bg-transparent px-12 text-lg text-champagne hover:border-champagne hover:bg-champagne/10"
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
