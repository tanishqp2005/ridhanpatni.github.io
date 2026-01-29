import { useEffect, useRef } from "react";

const CLICK_SOUND_URL = "https://res.cloudinary.com/dlasynehg/video/upload/v1769682481/baaaaaa_4d8Y0bS2_rltwxw.mp3";

export const useClickSound = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(CLICK_SOUND_URL);
    audioRef.current.volume = 0.5;

    const handleClick = () => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
      audioRef.current = null;
    };
  }, []);
};
