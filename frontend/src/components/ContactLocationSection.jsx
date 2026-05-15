import { ArrowRight, Clock3, MapPin, Navigation } from "lucide-react";
import { academyLocation } from "../utils/landingContent";
import { Button } from "./Button";
export function ContactLocationSection({ onContactClick }) {
    return (<section id="contact" className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-champagne/50 to-transparent"/>
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-stretch">
        <div className="glass-panel relative overflow-hidden rounded-[1.75rem] p-8 sm:p-10">
          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-champagne/10 blur-3xl"/>
          <div className="relative">
            <div className="mb-4 inline-flex text-xs font-black uppercase tracking-[0.2em] text-champagne">
              Visit Us
            </div>

            <h2 className="text-balance text-3xl font-black leading-tight text-white sm:text-4xl">
              Find Our Studio In The Heart Of Tampere
            </h2>

            <p className="mt-5 text-sm leading-7 text-white/75 sm:text-base">
              Step into a warm, focused dance space where classical heritage, movement training,
              and academy guidance come together.
            </p>

            <div className="mt-9 rounded-2xl border border-champagne/25 bg-[#160708]/80 p-6">
              <div className="flex items-start gap-4">
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-champagne text-ink shadow-[0_0_24px_rgba(244,199,107,0.22)]">
                  <MapPin size={22}/>
                </span>
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-champagne">
                    {academyLocation.name}
                  </p>
                  <address className="mt-3 not-italic text-xl font-black leading-snug text-white">
                    {academyLocation.addressLine1}
                    <br />
                    {academyLocation.addressLine2}
                  </address>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <Clock3 className="text-cyanGlow" size={22}/>
                <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-white/60">
                  Studio Visits
                </p>
                <p className="mt-2 text-base font-bold text-white">By appointment</p>
              </div>
              <a href={academyLocation.directionsUrl} target="_blank" rel="noreferrer" className="group rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-champagne/45 hover:bg-white/10">
                <Navigation className="text-champagne" size={22}/>
                <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-white/60">
                  Directions
                </p>
                <p className="mt-2 inline-flex items-center gap-2 text-base font-bold text-white">
                  Open in Maps
                  <ArrowRight size={18} className="transition group-hover:translate-x-1"/>
                </p>
              </a>
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Button variant="gold" onClick={() => onContactClick("location-visit")}>
                Book a Visit
              </Button>
              <Button variant="ghost" onClick={() => onContactClick("location-inquiry")}>
                Ask a Question
              </Button>
            </div>
          </div>
        </div>

        <div className="relative min-h-[460px] overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#160708] shadow-[0_30px_90px_rgba(0,0,0,0.34)]">
          <iframe title={`${academyLocation.name} map`} src={academyLocation.mapEmbedUrl} className="absolute inset-0 h-full w-full border-0 grayscale-[15%] contrast-110 saturate-125" loading="lazy" referrerPolicy="no-referrer-when-downgrade"/>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#100710]/45 via-transparent to-transparent"/>
          <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/10 bg-black/55 p-5 backdrop-blur-md sm:left-auto sm:max-w-sm">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-champagne">
              Tampere Studio
            </p>
            <p className="mt-2 text-lg font-black text-white">{academyLocation.addressLine1}</p>
            <p className="text-sm font-semibold text-white/70">{academyLocation.addressLine2}</p>
          </div>
        </div>
      </div>
    </section>);
}
