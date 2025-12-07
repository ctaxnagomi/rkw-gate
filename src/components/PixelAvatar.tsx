import React from 'react';
import { AvatarConfig } from '../types';

// Simple 24x24 pixel grid paths
const HEADS = [
  // 0: Classic Bot
  <path d="M6 6h12v10h-2v2h-8v-2h-2z M8 10h2v2h-2z M14 10h2v2h-2z M9 14h6v2h-6z" fill="currentColor" />,
  // 1: Humanoid Helm
  <path d="M8 4h8v4h2v8h-2v2h-8v-2h-2v-8h2z M10 10h4v2h-4z" fill="currentColor" />,
  // 2: Alien
  <path d="M4 2h16v6h-2v8h-2v2h-8v-2h-2v-8h-2z M6 6h4v4h-4z M14 6h4v4h-4z" fill="currentColor" />
];

const BODIES = [
  // 0: Basic Tech
  <path d="M8 18h8v6h-8z M4 18h4v2h-4z M16 18h4v2h-4z" fill="currentColor" />,
  // 1: Heavy Armor
  <path d="M4 18h16v2h-2v4h-12v-4h-2z M8 20h8v2h-8z" fill="currentColor" />,
  // 2: Robe
  <path d="M6 18h12v6h-12z M4 18h2v6h-2z M18 18h2v6h-2z M10 20h4v4h-4z" fill="currentColor" />
];

const ACCESSORIES = [
  // 0: None
  null,
  // 1: Antenna
  <path d="M11 2h2v4h-2z M10 3h1v1h-1z M13 3h1v1h-1z" fill="currentColor" />,
  // 2: Cape (Behind)
  <path d="M2 18h4v6h-4z M18 18h4v6h-4z" fill="currentColor" opacity="0.5" />,
  // 3: Visor
  <rect x="7" y="9" width="10" height="2" fill="currentColor" opacity="0.8" />
];

export const AVATAR_OPTIONS = {
  heads: HEADS.length,
  bodies: BODIES.length,
  accessories: ACCESSORIES.length,
  colors: [
    { name: 'Terminal Green', value: '#4af626' },
    { name: 'Amber', value: '#ffb000' },
    { name: 'Cyber Blue', value: '#00f0ff' },
    { name: 'Neon Purple', value: '#b026ff' },
    { name: 'Warning Red', value: '#ff3333' }
  ]
};

interface PixelAvatarProps {
  config: AvatarConfig;
  size?: number;
  className?: string;
}

const PixelAvatar: React.FC<PixelAvatarProps> = ({ config, size = 48, className = "" }) => {
  return (
    <div 
      className={`relative inline-block ${className}`} 
      style={{ width: size, height: size, color: config.color }}
    >
      <svg 
        viewBox="0 0 24 24" 
        className="w-full h-full pixelated" 
        style={{ imageRendering: 'pixelated' }}
        shapeRendering="crispEdges"
      >
        {/* Render Accessory if it needs to be behind (like cape) */}
        {ACCESSORIES[config.accessoryId]}
        
        {/* Body shifted down to align with head */}
        {BODIES[config.bodyId]}
        
        {/* Head */}
        {HEADS[config.headId]}
        
      </svg>
    </div>
  );
};

export default PixelAvatar;