import React, { useEffect, useState } from 'react';

interface BootScreenProps {
  onComplete: () => void;
}

const lines = [
  "BIOS DATE 01/05/24 14:22:51 VER: 1.0.0",
  "CPU: RKW-QUANTUM-CORE @ 4096 THZ",
  "640K RAM SYSTEM ... OK",
  "LOADING KERNEL ... OK",
  "MOUNTING VOLUMES ... OK",
  "CHECKING PERMISSIONS ...",
  "INITIALIZING SENTRY PROTOCOLS ...",
  "LOADING GEMINI-3-PRO ... SUCCESS",
  "ESTABLISHING SECURE CONNECTION ...",
  "ACCESS KEY: ************",
  "BOOT_SEQUENCE_COMPLETE",
];

const BootScreen: React.FC<BootScreenProps> = ({ onComplete }) => {
  const [currentLine, setCurrentLine] = useState(0);

  useEffect(() => {
    if (currentLine < lines.length) {
      const timeout = setTimeout(() => {
        setCurrentLine(prev => prev + 1);
      }, Math.random() * 300 + 100);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(onComplete, 800);
      return () => clearTimeout(timeout);
    }
  }, [currentLine, onComplete]);

  return (
    <div className="h-screen w-full bg-black text-terminal-green font-mono p-8 text-sm md:text-base leading-loose selection:bg-terminal-green selection:text-black">
      {lines.slice(0, currentLine).map((line, i) => (
        <div key={i}>{line}</div>
      ))}
      {currentLine < lines.length && (
         <div>
            {lines[currentLine]}<span className="inline-block w-2 h-4 bg-terminal-green ml-1 animate-blink"></span>
         </div>
      )}
      <div className="fixed bottom-4 right-4 text-xs text-terminal-dim">
        SYSTEM ID: RKW-9000
      </div>
    </div>
  );
};

export default BootScreen;