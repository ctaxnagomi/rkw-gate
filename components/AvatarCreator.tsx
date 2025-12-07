import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Save } from 'lucide-react';
import { AvatarConfig } from '../types';
import PixelAvatar, { AVATAR_OPTIONS } from './PixelAvatar';

interface AvatarCreatorProps {
  initialConfig?: AvatarConfig;
  onComplete: (config: AvatarConfig) => void;
}

const AvatarCreator: React.FC<AvatarCreatorProps> = ({ initialConfig, onComplete }) => {
  const [config, setConfig] = useState<AvatarConfig>(initialConfig || {
    headId: 0,
    bodyId: 0,
    accessoryId: 0,
    color: AVATAR_OPTIONS.colors[0].value
  });

  const cycle = (key: keyof AvatarConfig, direction: 1 | -1) => {
    setConfig(prev => {
      let max = 0;
      if (key === 'headId') max = AVATAR_OPTIONS.heads;
      if (key === 'bodyId') max = AVATAR_OPTIONS.bodies;
      if (key === 'accessoryId') max = AVATAR_OPTIONS.accessories;
      if (key === 'color') max = AVATAR_OPTIONS.colors.length;

      let nextVal: any;
      if (key === 'color') {
        const currentIndex = AVATAR_OPTIONS.colors.findIndex(c => c.value === prev.color);
        let nextIndex = (currentIndex + direction + max) % max;
        nextVal = AVATAR_OPTIONS.colors[nextIndex].value;
      } else {
        const currentVal = prev[key] as number;
        nextVal = (currentVal + direction + max) % max;
      }

      return { ...prev, [key]: nextVal };
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-4 animate-fade-in">
      <div className="w-full max-w-md border-2 border-terminal-dim bg-black/90 shadow-[0_0_30px_rgba(74,246,38,0.1)] p-6 relative">
        <div className="absolute top-0 left-0 bg-terminal-dim text-black font-retro px-2 py-0.5 text-lg">
          IDENTITY_CONFIG
        </div>

        <div className="mt-8 flex flex-col items-center gap-8">
          
          {/* Preview Box */}
          <div className="relative w-48 h-48 border border-terminal-green/30 bg-terminal-dim/10 flex items-center justify-center">
            <div className="absolute inset-0 border-t border-terminal-green/20 animate-scanline pointer-events-none"></div>
            <PixelAvatar config={config} size={128} />
          </div>

          {/* Controls */}
          <div className="w-full space-y-4 font-mono text-sm">
            
            {/* Head Selector */}
            <div className="flex items-center justify-between group">
              <span className="text-terminal-green/70">HEAD_MODULE</span>
              <div className="flex items-center gap-2">
                <button onClick={() => cycle('headId', -1)} className="hover:text-terminal-amber"><ChevronLeft /></button>
                <span className="w-8 text-center text-terminal-green">{config.headId + 1}</span>
                <button onClick={() => cycle('headId', 1)} className="hover:text-terminal-amber"><ChevronRight /></button>
              </div>
            </div>

            {/* Body Selector */}
            <div className="flex items-center justify-between group">
              <span className="text-terminal-green/70">CHASSIS</span>
              <div className="flex items-center gap-2">
                <button onClick={() => cycle('bodyId', -1)} className="hover:text-terminal-amber"><ChevronLeft /></button>
                <span className="w-8 text-center text-terminal-green">{config.bodyId + 1}</span>
                <button onClick={() => cycle('bodyId', 1)} className="hover:text-terminal-amber"><ChevronRight /></button>
              </div>
            </div>

            {/* Accessory Selector */}
            <div className="flex items-center justify-between group">
              <span className="text-terminal-green/70">ADD_ON</span>
              <div className="flex items-center gap-2">
                <button onClick={() => cycle('accessoryId', -1)} className="hover:text-terminal-amber"><ChevronLeft /></button>
                <span className="w-8 text-center text-terminal-green">{config.accessoryId}</span>
                <button onClick={() => cycle('accessoryId', 1)} className="hover:text-terminal-amber"><ChevronRight /></button>
              </div>
            </div>

             {/* Color Selector */}
             <div className="flex items-center justify-between group">
              <span className="text-terminal-green/70">SIGNATURE</span>
              <div className="flex items-center gap-2">
                <button onClick={() => cycle('color', -1)} className="hover:text-terminal-amber"><ChevronLeft /></button>
                <div className="w-8 h-4 border border-terminal-dim" style={{ backgroundColor: config.color }}></div>
                <button onClick={() => cycle('color', 1)} className="hover:text-terminal-amber"><ChevronRight /></button>
              </div>
            </div>

          </div>

          <button 
            onClick={() => onComplete(config)}
            className="w-full py-3 mt-4 border border-terminal-green text-terminal-green hover:bg-terminal-green hover:text-black transition-colors font-retro text-xl flex items-center justify-center gap-2 uppercase"
          >
            <Save size={18} />
            Initialize Identity
          </button>

        </div>
      </div>
    </div>
  );
};

export default AvatarCreator;