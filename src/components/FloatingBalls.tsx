import { motion } from "framer-motion";
import { useMemo } from "react";

const BALL_COLORS = [
  "bg-baby-pink",
  "bg-baby-blue",
  "bg-baby-yellow",
  "bg-baby-mint",
  "bg-baby-lavender",
  "bg-baby-coral",
];

interface Ball {
  id: number;
  size: number;
  color: string;
  initialX: number;
  initialY: number;
  duration: number;
  delay: number;
}

export const FloatingBalls = () => {
  const balls = useMemo<Ball[]>(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      size: Math.random() * 40 + 20,
      color: BALL_COLORS[Math.floor(Math.random() * BALL_COLORS.length)],
      initialX: Math.random() * 100,
      initialY: Math.random() * 100,
      duration: Math.random() * 10 + 15,
      delay: Math.random() * 5,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {balls.map((ball) => (
        <motion.div
          key={ball.id}
          className={`absolute rounded-full ${ball.color} opacity-40 blur-[1px]`}
          style={{
            width: ball.size,
            height: ball.size,
            left: `${ball.initialX}%`,
            top: `${ball.initialY}%`,
          }}
          animate={{
            x: [0, 30, -20, 40, -30, 0],
            y: [0, -40, 20, -30, 50, 0],
            scale: [1, 1.1, 0.9, 1.15, 0.95, 1],
          }}
          transition={{
            duration: ball.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: ball.delay,
          }}
        />
      ))}
    </div>
  );
};
