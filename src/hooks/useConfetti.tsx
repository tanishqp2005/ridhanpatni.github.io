import { createContext, useContext, useCallback, useState, ReactNode } from "react";

interface ConfettiContextType {
  triggerConfetti: () => void;
  confettiKey: number;
}

const ConfettiContext = createContext<ConfettiContextType | null>(null);

export const ConfettiProvider = ({ children }: { children: ReactNode }) => {
  const [confettiKey, setConfettiKey] = useState(0);

  const triggerConfetti = useCallback(() => {
    setConfettiKey((prev) => prev + 1);
  }, []);

  return (
    <ConfettiContext.Provider value={{ triggerConfetti, confettiKey }}>
      {children}
    </ConfettiContext.Provider>
  );
};

export const useConfetti = () => {
  const context = useContext(ConfettiContext);
  if (!context) {
    throw new Error("useConfetti must be used within a ConfettiProvider");
  }
  return context;
};
