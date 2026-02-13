import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import babyLoader from "@/assets/funny-baby-loader.png";

export const LoadingScreen = ({ onFinished }: { onFinished: () => void }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onFinished, 600);
    }, 3000);
    return () => clearTimeout(timer);
  }, [onFinished]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
      style={{ background: "var(--gradient-hero)" }}
    >
      <motion.img
        src={babyLoader}
        alt="Loading..."
        className="w-48 h-48 object-contain"
        animate={{ y: [0, -15, 0], rotate: [0, 3, -3, 0] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.p
        className="mt-4 font-fredoka text-xl text-primary"
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Getting the party ready...
      </motion.p>
    </div>
  );
};
