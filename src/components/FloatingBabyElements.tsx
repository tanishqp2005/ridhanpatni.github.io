import { motion } from "framer-motion";
import { useMemo } from "react";

interface FloatingElement {
  id: number;
  type: "balloon" | "star" | "bottle" | "teddy" | "heart";
  size: number;
  color: string;
  initialX: number;
  initialY: number;
  duration: number;
  delay: number;
}

const ELEMENT_COLORS = [
  "hsl(350 80% 85%)", // pink
  "hsl(200 70% 85%)", // blue
  "hsl(45 90% 85%)",  // yellow
  "hsl(160 50% 85%)", // mint
  "hsl(270 50% 88%)", // lavender
  "hsl(15 80% 80%)",  // coral
];

const BalloonSVG = ({ color, size }: { color: string; size: number }) => (
  <svg width={size} height={size * 1.4} viewBox="0 0 40 56" fill="none">
    <ellipse cx="20" cy="18" rx="16" ry="18" fill={color} />
    <polygon points="20,36 17,42 23,42" fill={color} />
    <path d="M20 42 Q 18 48, 20 54 Q 22 48, 20 42" stroke="hsl(0 0% 70%)" strokeWidth="1" fill="none" />
  </svg>
);

const StarSVG = ({ color, size }: { color: string; size: number }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <polygon 
      points="20,2 24,15 38,15 27,24 31,38 20,30 9,38 13,24 2,15 16,15" 
      fill={color}
    />
  </svg>
);

const BottleSVG = ({ color, size }: { color: string; size: number }) => (
  <svg width={size * 0.6} height={size} viewBox="0 0 24 40" fill="none">
    <rect x="8" y="0" width="8" height="6" rx="2" fill="hsl(30 50% 80%)" />
    <path d="M6 8 L8 6 L16 6 L18 8 L18 36 Q18 40, 12 40 Q6 40, 6 36 Z" fill={color} />
    <ellipse cx="12" cy="28" rx="4" ry="8" fill="hsl(0 0% 100% / 0.3)" />
  </svg>
);

const TeddySVG = ({ color, size }: { color: string; size: number }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <circle cx="10" cy="10" r="6" fill={color} />
    <circle cx="30" cy="10" r="6" fill={color} />
    <ellipse cx="20" cy="24" rx="14" ry="12" fill={color} />
    <circle cx="20" cy="18" r="10" fill={color} />
    <circle cx="16" cy="16" r="2" fill="hsl(0 0% 20%)" />
    <circle cx="24" cy="16" r="2" fill="hsl(0 0% 20%)" />
    <ellipse cx="20" cy="20" rx="3" ry="2" fill="hsl(350 60% 60%)" />
  </svg>
);

const HeartSVG = ({ color, size }: { color: string; size: number }) => (
  <svg width={size} height={size * 0.9} viewBox="0 0 40 36" fill="none">
    <path 
      d="M20 36 C 10 28, 0 18, 0 10 C 0 4, 4 0, 10 0 C 14 0, 18 3, 20 6 C 22 3, 26 0, 30 0 C 36 0, 40 4, 40 10 C 40 18, 30 28, 20 36 Z" 
      fill={color}
    />
  </svg>
);

const ElementRenderer = ({ type, color, size }: { type: FloatingElement["type"]; color: string; size: number }) => {
  switch (type) {
    case "balloon":
      return <BalloonSVG color={color} size={size} />;
    case "star":
      return <StarSVG color={color} size={size} />;
    case "bottle":
      return <BottleSVG color={color} size={size} />;
    case "teddy":
      return <TeddySVG color={color} size={size} />;
    case "heart":
      return <HeartSVG color={color} size={size} />;
  }
};

export const FloatingBabyElements = () => {
  const elements = useMemo<FloatingElement[]>(() => {
    const types: FloatingElement["type"][] = ["balloon", "star", "bottle", "teddy", "heart"];
    return Array.from({ length: 15 }, (_, i) => ({
      id: i,
      type: types[Math.floor(Math.random() * types.length)],
      size: Math.random() * 25 + 20,
      color: ELEMENT_COLORS[Math.floor(Math.random() * ELEMENT_COLORS.length)],
      initialX: Math.random() * 100,
      initialY: Math.random() * 100,
      duration: Math.random() * 15 + 20,
      delay: Math.random() * 8,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {elements.map((element) => (
        <motion.div
          key={element.id}
          className="absolute opacity-30"
          style={{
            left: `${element.initialX}%`,
            top: `${element.initialY}%`,
          }}
          animate={{
            x: [0, 20, -15, 25, -20, 0],
            y: [0, -30, 15, -25, 35, 0],
            rotate: [0, 10, -8, 12, -10, 0],
          }}
          transition={{
            duration: element.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: element.delay,
          }}
        >
          <ElementRenderer type={element.type} color={element.color} size={element.size} />
        </motion.div>
      ))}
    </div>
  );
};
