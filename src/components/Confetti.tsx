import { motion } from "framer-motion";
import { useMemo } from "react";

const CONFETTI_COLORS = [
  "hsl(350 80% 85%)", // pink
  "hsl(200 70% 85%)", // blue
  "hsl(45 90% 85%)",  // yellow
  "hsl(160 50% 85%)", // mint
  "hsl(270 50% 88%)", // lavender
  "hsl(15 80% 80%)",  // coral
];

const SHAPES = ["circle", "square", "triangle"];

interface ConfettiPieceProps {
  delay: number;
  duration: number;
  color: string;
  left: number;
  shape: string;
}

const ConfettiPiece = ({ delay, duration, color, left, shape }: ConfettiPieceProps) => {
  const shapeClass = shape === "circle" ? "rounded-full" : shape === "square" ? "rounded-sm" : "";
  
  return (
    <motion.div
      className={`absolute w-3 h-3 ${shapeClass}`}
      style={{
        left: `${left}%`,
        backgroundColor: color,
        clipPath: shape === "triangle" ? "polygon(50% 0%, 0% 100%, 100% 100%)" : undefined,
      }}
      initial={{ y: -50, rotate: 0, opacity: 1 }}
      animate={{
        y: "100vh",
        rotate: 720,
        opacity: [1, 1, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
};

export const Confetti = () => {
  const pieces = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      delay: Math.random() * 5,
      duration: 4 + Math.random() * 3,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      left: Math.random() * 100,
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {pieces.map((piece) => (
        <ConfettiPiece key={piece.id} {...piece} />
      ))}
    </div>
  );
};
