import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RotateCcw, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Balloon {
  id: number;
  x: number;
  y: number;
  color: string;
  popped: boolean;
}

const BALLOON_COLORS = [
  "hsl(350 80% 70%)", // pink
  "hsl(200 70% 70%)", // blue
  "hsl(45 90% 70%)",  // yellow
  "hsl(160 50% 70%)", // mint
  "hsl(270 50% 75%)", // lavender
  "hsl(15 80% 65%)",  // coral
];

const GAME_DURATION = 30;
const BALLOON_SPAWN_INTERVAL = 800;

export const BirthdayGame = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem("birthday-game-highscore");
    return saved ? parseInt(saved, 10) : 0;
  });

  const spawnBalloon = useCallback(() => {
    const newBalloon: Balloon = {
      id: Date.now() + Math.random(),
      x: Math.random() * 80 + 10,
      y: 110,
      color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
      popped: false,
    };
    setBalloons((prev) => [...prev.slice(-15), newBalloon]);
  }, []);

  const popBalloon = (id: number) => {
    setBalloons((prev) =>
      prev.map((b) => (b.id === id && !b.popped ? { ...b, popped: true } : b))
    );
    setScore((prev) => prev + 1);
  };

  const startGame = () => {
    setIsPlaying(true);
    setGameOver(false);
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setBalloons([]);
  };

  const endGame = useCallback(() => {
    setIsPlaying(false);
    setGameOver(true);
    setBalloons([]);
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("birthday-game-highscore", score.toString());
    }
  }, [score, highScore]);

  // Timer
  useEffect(() => {
    if (!isPlaying) return;
    if (timeLeft <= 0) {
      endGame();
      return;
    }
    const timer = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [isPlaying, timeLeft, endGame]);

  // Spawn balloons
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(spawnBalloon, BALLOON_SPAWN_INTERVAL);
    return () => clearInterval(interval);
  }, [isPlaying, spawnBalloon]);

  // Move balloons up
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setBalloons((prev) =>
        prev
          .map((b) => ({ ...b, y: b.y - 2 }))
          .filter((b) => b.y > -20 && !b.popped)
      );
    }, 50);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <section id="game" className="py-20 px-4 bg-gradient-to-b from-baby-yellow/10 to-background">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-baby-yellow mb-4">
            <Sparkles className="w-8 h-8 text-foreground" />
          </div>
          <h2 className="text-4xl md:text-5xl font-fredoka font-bold text-gradient mb-4">
            Birthday Balloon Pop!
          </h2>
          <p className="text-lg text-muted-foreground">
            Pop as many balloons as you can in 30 seconds!
          </p>
        </motion.div>

        <Card className="overflow-hidden bg-gradient-to-b from-baby-blue/20 to-baby-pink/20 border-2 border-baby-yellow/30">
          <CardContent className="p-0">
            {/* Game Header */}
            <div className="flex justify-between items-center p-4 bg-card/50 border-b border-baby-yellow/20">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-baby-yellow" />
                <span className="font-fredoka font-semibold">High: {highScore}</span>
              </div>
              <div className="text-2xl font-fredoka font-bold text-baby-coral">
                {isPlaying ? `⏱️ ${timeLeft}s` : "🎈"}
              </div>
              <div className="font-fredoka font-semibold">
                Score: <span className="text-baby-coral">{score}</span>
              </div>
            </div>

            {/* Game Area */}
            <div 
              className="relative h-80 sm:h-96 overflow-hidden bg-gradient-to-b from-sky-100 to-sky-200"
              style={{ touchAction: "manipulation" }}
            >
              {!isPlaying && !gameOver && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                  <Button
                    onClick={startGame}
                    size="lg"
                    className="bg-baby-coral hover:bg-baby-coral/80 text-xl font-fredoka px-8 py-6"
                  >
                    Start Game 🎈
                  </Button>
                </div>
              )}

              {gameOver && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 backdrop-blur-sm z-20">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-center bg-card p-8 rounded-2xl shadow-baby-float"
                  >
                    <h3 className="text-3xl font-fredoka font-bold text-gradient mb-2">
                      🎉 You're 1 today, Ridhan!
                    </h3>
                    <p className="text-4xl font-fredoka font-bold text-baby-coral mb-2">
                      {score} balloons!
                    </p>
                    {score > highScore - 1 && score > 0 && (
                      <p className="text-baby-yellow font-semibold mb-4">
                        🏆 New High Score!
                      </p>
                    )}
                    <Button
                      onClick={startGame}
                      className="bg-baby-coral hover:bg-baby-coral/80 font-fredoka"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Play Again
                    </Button>
                  </motion.div>
                </div>
              )}

              {/* Balloons */}
              <AnimatePresence>
                {balloons.map((balloon) => (
                  <motion.div
                    key={balloon.id}
                    className="absolute cursor-pointer select-none"
                    style={{
                      left: `${balloon.x}%`,
                      top: `${balloon.y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: balloon.popped ? 0 : 1 }}
                    exit={{ scale: 0 }}
                    onClick={() => popBalloon(balloon.id)}
                    onTouchStart={(e) => {
                      e.preventDefault();
                      popBalloon(balloon.id);
                    }}
                  >
                    <svg width="50" height="65" viewBox="0 0 40 56">
                      <ellipse cx="20" cy="18" rx="16" ry="18" fill={balloon.color} />
                      <polygon points="20,36 17,42 23,42" fill={balloon.color} />
                      <path 
                        d="M20 42 Q 18 48, 20 54 Q 22 48, 20 42" 
                        stroke="hsl(0 0% 60%)" 
                        strokeWidth="1" 
                        fill="none" 
                      />
                      <ellipse 
                        cx="14" 
                        cy="12" 
                        rx="4" 
                        ry="5" 
                        fill="rgba(255,255,255,0.3)" 
                      />
                    </svg>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Tap or click the balloons to pop them! 🎈
        </p>
      </div>
    </section>
  );
};
