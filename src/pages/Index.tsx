import { useEffect } from "react";
import { Confetti } from "@/components/Confetti";
import { ConfettiBurst } from "@/components/ConfettiBurst";
import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { MilestoneTimeline } from "@/components/MilestoneTimeline";
import { TheFirstsSection } from "@/components/TheFirstsSection";
import { VoiceNotesSection } from "@/components/VoiceNotesSection";
import { FutureLettersSection } from "@/components/FutureLettersSection";
import { BirthdayGame } from "@/components/BirthdayGame";
import { UploadSection } from "@/components/UploadSection";
import { Footer } from "@/components/Footer";
import { MusicToggle } from "@/components/MusicToggle";
import { FloatingBalls } from "@/components/FloatingBalls";
import { FloatingBabyElements } from "@/components/FloatingBabyElements";
import { useClickSound } from "@/hooks/useClickSound";
import { ConfettiProvider, useConfetti } from "@/hooks/useConfetti";

const IndexContent = () => {
  useClickSound();
  const { triggerConfetti, confettiKey } = useConfetti();

  // Trigger confetti on first page load
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerConfetti();
    }, 1000);
    return () => clearTimeout(timer);
  }, [triggerConfetti]);

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <FloatingBalls />
      <FloatingBabyElements />
      <Confetti />
      <ConfettiBurst trigger={confettiKey} />
      <Navigation />
      <main>
        <HeroSection />
        <MilestoneTimeline />
        <TheFirstsSection />
        <VoiceNotesSection />
        <FutureLettersSection />
        <BirthdayGame />
        <UploadSection />
      </main>
      <Footer />
      <MusicToggle />
    </div>
  );
};

const Index = () => {
  return (
    <ConfettiProvider>
      <IndexContent />
    </ConfettiProvider>
  );
};

export default Index;
