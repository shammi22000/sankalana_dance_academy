import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "../utils/cn";
const slideDuration = 4600;
export function HeroCarousel({ images, className }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const activeImage = images[activeIndex];
    const nextIndex = useMemo(() => (activeIndex + 1) % images.length, [activeIndex, images.length]);
    useEffect(() => {
        if (!isPlaying || images.length <= 1) {
            return;
        }
        const timer = window.setTimeout(() => {
            setActiveIndex((currentIndex) => (currentIndex + 1) % images.length);
        }, slideDuration);
        return () => window.clearTimeout(timer);
    }, [activeIndex, images.length, isPlaying]);
    function showPrevious() {
        setActiveIndex((currentIndex) => (currentIndex - 1 + images.length) % images.length);
    }
    function showNext() {
        setActiveIndex((currentIndex) => (currentIndex + 1) % images.length);
    }
    return (<div className={cn("absolute inset-0 overflow-hidden bg-[#09070c]", className)}>
      {images.map((image, index) => (<img key={image.src} src={image.src} alt={image.alt} className={cn("absolute inset-0 h-full w-full object-cover object-center saturate-125 transition-all duration-1000 ease-out motion-reduce:transition-none", index === activeIndex
                ? "z-10 scale-100 opacity-100 motion-safe:animate-[heroImageZoom_6200ms_ease-out_forwards]"
                : "z-0 scale-105 opacity-0")}/>))}

      <div className="absolute inset-0 z-20 bg-gradient-to-r from-[#120407]/95 via-[#17070d]/70 to-[#2d0c05]/35"/>
      <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#100710]/90 via-transparent to-black/20"/>
      <div className="absolute inset-y-0 left-0 z-20 w-1/3 bg-[#100407]/55 blur-3xl"/>
      <div className="absolute bottom-0 left-0 z-20 h-40 w-full bg-gradient-to-t from-[#100710] to-transparent"/>

      <div className="absolute bottom-7 left-1/2 z-30 w-full max-w-7xl -translate-x-1/2 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-sm rounded-2xl border border-white/10 bg-black/35 p-4 backdrop-blur-md">
            <p className="text-[0.65rem] font-black uppercase tracking-[0.18em] text-champagne">
              {activeImage.tag}
            </p>
            <div className="mt-3 grid grid-cols-[1fr_auto] items-center gap-4">
              <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
                <div key={`${activeImage.src}-${isPlaying}`} className={cn("h-full rounded-full bg-gradient-to-r from-champagne via-orchid to-cyanGlow", isPlaying && "animate-[carouselProgress_4600ms_linear_forwards]")}/>
              </div>
              <p className="text-xs font-black text-white/75">
                {String(activeIndex + 1).padStart(2, "0")} /{" "}
                {String(images.length).padStart(2, "0")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" onClick={showPrevious} className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur transition hover:bg-white/15" aria-label="Show previous image">
              <ChevronLeft size={20}/>
            </button>
            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-2 backdrop-blur sm:flex">
              {images.map((image, index) => (<button key={image.src} type="button" onClick={() => setActiveIndex(index)} className={cn("h-2.5 rounded-full transition-all", index === activeIndex
                ? "w-8 bg-champagne shadow-[0_0_18px_rgba(244,199,107,0.45)]"
                : "w-2.5 bg-white/35 hover:bg-white/60")} aria-label={`Show ${image.title}`}/>))}
            </div>
            <button type="button" onClick={showNext} className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur transition hover:bg-white/15" aria-label="Show next image">
              <ChevronRight size={20}/>
            </button>
            <button type="button" onClick={() => setIsPlaying((playing) => !playing)} className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-black/35 text-white backdrop-blur transition hover:bg-white/15" aria-label={isPlaying ? "Pause carousel" : "Play carousel"}>
              {isPlaying ? <Pause size={16}/> : <Play size={16}/>}
            </button>
          </div>
        </div>
      </div>
    </div>);
}
