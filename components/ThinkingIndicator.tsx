import React, { useEffect, useState } from 'react';

interface ThinkingIndicatorProps {
  thought: string;
}

const ThinkingIndicator: React.FC<ThinkingIndicatorProps> = ({ thought }) => {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    let i = 0;
    setDisplayText('');
    const interval = setInterval(() => {
      setDisplayText((prev) => prev + thought.charAt(i));
      i++;
      if (i >= thought.length) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [thought]);

  return (
    <div className="border-t border-terminal-dim bg-terminal-bg/90 p-2 text-xs font-mono text-terminal-amber/80 h-16 overflow-hidden">
      <div className="flex items-center gap-2 mb-1 opacity-50 uppercase tracking-widest text-[10px]">
        <span className="animate-pulse">●</span> CPU_0 PROCESS
      </div>
      <div className="pl-4 border-l-2 border-terminal-amber/30">
        {displayText}<span className="animate-pulse">_</span>
      </div>
    </div>
  );
};

export default ThinkingIndicator;