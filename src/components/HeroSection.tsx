import { motion } from "framer-motion";
import { Cake, Sparkles, Star } from "lucide-react";
import heroCelebration from "@/assets/hero-celebration.jpg";
import { useConfetti } from "@/hooks/useConfetti";

export const HeroSection = () => {
  const { triggerConfetti } = useConfetti();

  const handleHeadingClick = () => {
    triggerConfetti();
  };

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 pt-20">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${heroCelebration})` }}
      />
      {/* Decorative floating elements */}
      <motion.div
        className="absolute top-1/4 left-10 w-16 h-16 bg-baby-pink rounded-full opacity-60"
        animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 right-16 w-12 h-12 bg-baby-blue rounded-full opacity-60"
        animate={{ y: [0, -15, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
      />
      <motion.div
        className="absolute bottom-1/4 left-1/4 w-10 h-10 bg-baby-yellow rounded-full opacity-60"
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
      <motion.div
        className="absolute bottom-1/3 right-1/4 w-14 h-14 bg-baby-mint rounded-full opacity-60"
        animate={{ y: [0, -18, 0], rotate: [0, 15, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
      />

      <div className="text-center z-10 max-w-3xl">
        {/* Sparkles icon */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
          className="inline-flex items-center justify-center w-24 h-24 mb-8 bg-baby-coral rounded-full shadow-baby-float"
        >
          <Cake size={48} className="text-primary-foreground" />
        </motion.div>

        {/* Main heading - clickable for confetti */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          onClick={handleHeadingClick}
          className="text-5xl md:text-7xl lg:text-8xl font-fredoka font-bold text-gradient mb-6 cursor-pointer hover:scale-105 transition-transform"
        >
          Happy 1st Birthday!
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-xl md:text-2xl font-nunito text-muted-foreground mb-4"
        >
          A beautiful 1-year milestone journey
        </motion.p>

        {/* Birthdate */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="inline-flex items-center gap-2 px-6 py-3 bg-card rounded-full shadow-baby-card"
        >
          <Star size={20} className="text-baby-yellow fill-baby-yellow" />
          <span className="font-fredoka text-lg text-foreground">Born February 17, 2025</span>
          <Star size={20} className="text-baby-yellow fill-baby-yellow" />
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-16"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="inline-flex flex-col items-center gap-2 text-muted-foreground"
          >
            <Sparkles size={24} className="text-primary" />
            <span className="text-sm font-medium">Scroll to explore</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
