import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useEffect, useState } from "react";

const CONFETTI_COLORS = [
  "hsl(350 80% 70%)", // pink
  "hsl(200 70% 70%)", // blue
  "hsl(45 90% 70%)",  // yellow
  "hsl(160 50% 70%)", // mint
  "hsl(270 50% 75%)", // lavender
  "hsl(15 80% 65%)",  // coral
  "hsl(120 60% 70%)", // green
];

interface ConfettiPiece {
  id: number;
  x: number;
  delay: number;
  duration: number;
  color: string;
  size: number;
  rotation: number;
}

interface ConfettiBurstProps {
  trigger: number;
}

export const ConfettiBurst = ({ trigger }: ConfettiBurstProps) => {
  const [isActive, setIsActive] = useState(false);

  const pieces = useMemo<ConfettiPiece[]>(() => {
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      size: 8 + Math.random() * 8,
      rotation: Math.random() * 720,
    }));
  }, [trigger]);

  useEffect(() => {
    if (trigger > 0) {
      setIsActive(true);
      const timer = setTimeout(() => setIsActive(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [trigger]);

  return (
    <AnimatePresence>
      {isActive && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          {pieces.map((piece) => (
            <motion.div
              key={`${trigger}-${piece.id}`}
              className="absolute rounded-sm"
              style={{
                left: `${piece.x}%`,
                width: piece.size,
                height: piece.size,
                backgroundColor: piece.color,
              }}
              initial={{ y: -20, opacity: 1, rotate: 0 }}
              animate={{
                y: "100vh",
                opacity: [1, 1, 0],
                rotate: piece.rotation,
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration: piece.duration,
                delay: piece.delay,
                ease: "easeIn",
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
};
