import { ArrowRight, CalendarDays, Clock3, MapPin } from "lucide-react";
import { upcomingEvents } from "../utils/landingContent";
import { cn } from "../utils/cn";

interface EventsSectionProps {
  onRegisterClick: (source?: string) => void;
}

type EventItem = (typeof upcomingEvents)[number];

function EventCard({ event, onRegisterClick }: { event: EventItem; onRegisterClick: (source?: string) => void }) {
  const source = `event-${event.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <article
      className={cn(
        "group relative min-h-[330px] overflow-hidden rounded-[1.7rem] border bg-[#180607] p-8 shadow-[0_26px_80px_rgba(0,0,0,0.25)] transition duration-500 hover:-translate-y-1 hover:bg-[#21090a] sm:p-10 lg:min-h-[380px]",
        event.featured
          ? "border-champagne/70 shadow-[0_0_0_1px_rgba(244,199,107,0.16),0_30px_90px_rgba(214,159,95,0.12)]"
          : "border-[#5c2520] hover:border-champagne/50",
      )}
    >
      <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-champagne/10 blur-3xl transition group-hover:bg-champagne/20" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0b0304] to-transparent" />

      <div className="relative z-10 flex h-full flex-col">
        <div className="flex items-start justify-between gap-5">
          <h3
            className={cn(
              "text-balance text-3xl font-black leading-tight sm:text-4xl",
              event.featured ? "text-champagne" : "text-white",
            )}
          >
            {event.title}
          </h3>
          <span className="hidden shrink-0 rounded-full border border-champagne/25 bg-champagne/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-champagne md:inline-flex">
            {event.type}
          </span>
        </div>

        <div className="mt-10 grid gap-5 text-xl font-bold text-[#e0d2c5] sm:text-2xl">
          <p className="flex items-center gap-5">
            <CalendarDays className="shrink-0 text-champagne" size={27} strokeWidth={2.3} />
            {event.date}
          </p>
          <p className="flex items-center gap-5">
            <Clock3 className="shrink-0 text-champagne" size={27} strokeWidth={2.3} />
            {event.time}
          </p>
          <p className="flex items-center gap-5">
            <MapPin className="shrink-0 text-champagne" size={27} strokeWidth={2.3} />
            {event.venue}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onRegisterClick(source)}
          className="mt-auto inline-flex w-fit items-center gap-4 pt-10 text-xl font-black text-champagne transition group-hover:gap-5 group-hover:text-white"
        >
          Register Now
          <ArrowRight size={26} strokeWidth={2.8} />
        </button>
      </div>
    </article>
  );
}

export function EventsSection({ onRegisterClick }: EventsSectionProps) {
  return (
    <section
      id="events"
      className="relative overflow-hidden bg-[#120405] px-4 py-24 sm:px-6 lg:px-8 lg:py-32"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#5c2520] to-transparent" />
      <div className="absolute left-1/2 top-20 h-72 w-72 -translate-x-1/2 rounded-full bg-champagne/5 blur-3xl" />

      <div className="relative mx-auto max-w-[92rem]">
        <div className="mx-auto max-w-6xl text-center">
          <p className="text-sm font-black uppercase tracking-[0.55em] text-[#d3a06c] sm:text-base">
            What's Coming
          </p>
          <h2 className="mt-8 text-balance text-5xl font-black leading-none text-white sm:text-6xl lg:text-7xl">
            Upcoming Events & Workshops
          </h2>
          <p className="mx-auto mt-9 max-w-4xl text-xl font-bold leading-9 text-[#d9c8ba] sm:text-2xl">
            Join us for performances, workshops, and cultural celebrations.
          </p>
        </div>

        <div className="mt-20 grid gap-8 lg:grid-cols-2">
          {upcomingEvents.map((event) => (
            <EventCard key={`${event.title}-${event.date}`} event={event} onRegisterClick={onRegisterClick} />
          ))}
        </div>
      </div>
    </section>
  );
}
