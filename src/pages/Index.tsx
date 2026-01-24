import { Confetti } from "@/components/Confetti";
import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { MilestoneTimeline } from "@/components/MilestoneTimeline";
import { UploadSection } from "@/components/UploadSection";
import { WishesSection } from "@/components/WishesSection";
import { Footer } from "@/components/Footer";
import { MusicToggle } from "@/components/MusicToggle";

const Index = () => {
  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <Confetti />
      <Navigation />
      <main>
        <HeroSection />
        <MilestoneTimeline />
        <UploadSection />
        <WishesSection />
      </main>
      <Footer />
      <MusicToggle />
    </div>
  );
};

export default Index;
