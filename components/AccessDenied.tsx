import React from 'react';
import { Lock, RefreshCw } from 'lucide-react';

const AccessDenied: React.FC = () => {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-6">
      <div className="relative">
        <Lock className="w-24 h-24 text-terminal-red animate-pulse" />
        <div className="absolute inset-0 bg-terminal-red blur-xl opacity-20"></div>
      </div>
      
      <h2 className="text-4xl font-retro text-terminal-red tracking-widest">ACCESS DENIED</h2>
      
      <div className="max-w-md border border-terminal-red/30 bg-terminal-red/5 p-4 rounded font-mono text-terminal-red/80 text-sm">
        <p className="mb-4">
          SECURITY PROTOCOL 773:
          Visitor failed the vibe check. Reasons may include:
        </p>
        <ul className="list-disc text-left pl-6 space-y-1 mb-4">
          <li>Insufficient salary range offered</li>
          <li>Suspicious intent detected</li>
          <li>Lack of technical aptitude</li>
          <li>General untrustworthiness</li>
        </ul>
        <p>Your IP has been logged for further review.</p>
      </div>

      <button 
        onClick={() => window.location.reload()}
        className="flex items-center gap-2 px-6 py-3 border border-terminal-red text-terminal-red hover:bg-terminal-red hover:text-black transition-colors font-mono text-sm uppercase tracking-wider"
      >
        <RefreshCw size={16} />
        Retry Connection
      </button>
    </div>
  );
};

export default AccessDenied;