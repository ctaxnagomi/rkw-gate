
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  thinking?: string; // Internal monologue for the AI
  timestamp: number;
}

export enum GatekeeperState {
  BOOTING,
  CUSTOMIZING,
  ACTIVE,
  GRANTED,
  REJECTED,
  ERROR,
  LOGIN,
  ADMIN,
  BUILDER
}

export interface GatekeeperResponse {
  message: string;
  thinking: string;
  action: 'WAIT_INPUT' | 'GRANT' | 'REJECT';
  audio?: string; // Base64 audio data for Morse challenges
  offeredSalary?: number; // The accepted offer value
}

export interface AvatarConfig {
  headId: number;
  bodyId: number;
  accessoryId: number;
  color: string;
}

export interface VisitorSessionData {
  offeredSalary?: number;
  avatarConfig?: AvatarConfig;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  question: string;
  answer: string;
  outcome?: string;
  screenshot?: string; // Base64 data URL
}

export interface VisitorStats {
  browsers: number;
  recruiters: number;
  bots: number;
}

export type AuthMode = 'normal' | 'morse';

export interface MorsePair {
  id: string;
  text: string;     // The correct morse code answer (e.g. "-.-.")
  audioData: string; // Base64 wav file
}

export interface AdminConfig {
  botTrapKey: string; // Legacy/Fallback key
  salaryThreshold: number;
  enableScreenshots: boolean;
  authMode: AuthMode;
  useAI: boolean;
  morsePairs: MorsePair[];
}

// Portfolio Builder Types
export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  imageSeed?: number; // Legacy support for random placeholders
  imageUrl?: string;  // Custom image URL
  link?: string;      // Project external link
}

export interface PortfolioConfig {
  hero: {
    visible: boolean;
    title: string;
    subtitle: string;
  };
  projects: {
    visible: boolean;
    title: string;
    items: ProjectItem[];
  };
  about: {
    visible: boolean;
    title: string;
    content: string;
  };
  stats: {
    visible: boolean;
    experience: string;
    projects: string;
    coffee: string;
  };
  github: {
    visible: boolean;
    username: string;
  };
}