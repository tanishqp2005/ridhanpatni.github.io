import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Music, VolumeX } from "lucide-react";

const MUSIC_URL = "https://res.cloudinary.com/dlasynehg/video/upload/v1769271466/Pappu.mp3_rjl4so.mp3";

export const MusicToggle = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(MUSIC_URL);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const toggleMusic = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <motion.button
      onClick={toggleMusic}
      className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-baby-pink to-baby-blue shadow-lg border-2 border-white/50 backdrop-blur-sm"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      animate={isPlaying ? { rotate: [0, 5, -5, 0] } : {}}
      transition={isPlaying ? { repeat: Infinity, duration: 1 } : {}}
      aria-label={isPlaying ? "Pause music" : "Play music"}
    >
      {isPlaying ? (
        <Music className="w-6 h-6 text-foreground" />
      ) : (
        <VolumeX className="w-6 h-6 text-muted-foreground" />
      )}
      
      {/* Sound waves animation when playing */}
      {isPlaying && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-baby-pink"
          animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
      )}
    </motion.button>
  );
};
