import { useState } from "react";
import { ContactDialog } from "../components/ContactDialog";
import { ContactLocationSection } from "../components/ContactLocationSection";
import { CtaSection } from "../components/CtaSection";
import { DisciplinesSection } from "../components/DisciplinesSection";
import { EventsSection } from "../components/EventsSection";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { HeroSection } from "../components/HeroSection";
import { LearningMaterialSection } from "../components/LearningMaterialSection";
import { StorySection } from "../components/StorySection";
import { MainLayout } from "../layouts/MainLayout";

export function LandingPage() {
  const [contactOpen, setContactOpen] = useState(false);
  const [contactSource, setContactSource] = useState("landing");

  function openContact(source = "landing") {
    setContactSource(source);
    setContactOpen(true);
  }

  return (
    <MainLayout>
      <Header />
      <main>
        <HeroSection />
        <StorySection />
        <DisciplinesSection />
        <EventsSection onRegisterClick={openContact} />
        <LearningMaterialSection />
        <CtaSection onContactClick={openContact} />
        <ContactLocationSection onContactClick={openContact} />
      </main>
      <Footer />
      <ContactDialog open={contactOpen} source={contactSource} onClose={() => setContactOpen(false)} />
    </MainLayout>
  );
}
