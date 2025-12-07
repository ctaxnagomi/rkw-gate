
import { PortfolioConfig } from '../types';
import { supabase } from './supabaseClient';

const TABLE = 'portfolio_config';

const DEFAULT_PORTFOLIO: PortfolioConfig = {
  hero: {
    visible: true,
    title: "Portfolio_Main",
    subtitle: "Senior Full-Stack Engineer & AI Specialist. Building the future with React, Node.js, and Generative AI."
  },
  projects: {
    visible: true,
    title: "Selected Projects",
    items: [
      {
        id: '1',
        title: "Project_Alpha",
        description: "High-performance distributed system built with Go and gRPC. Handles 10k requests/sec.",
        tags: ["Go", "gRPC", "K8s"],
        imageSeed: 51,
        link: "https://github.com"
      },
      {
        id: '2',
        title: "Neural_Net_Viz",
        description: "Interactive 3D visualization of neural networks using Three.js and WebGL.",
        tags: ["Three.js", "React", "WebGL"],
        imageSeed: 52,
        link: "#"
      },
      {
        id: '3',
        title: "Crypto_Sentry",
        description: "Real-time anomaly detection for blockchain transactions using custom ML models.",
        tags: ["Python", "TensorFlow", "Solidity"],
        imageSeed: 53,
        link: "#"
      },
      {
        id: '4',
        title: "Gatekeeper_OS",
        description: "Retro-styled AI security interface for portfolio protection (Self-Recursive).",
        tags: ["React", "Gemini", "Tailwind"],
        imageSeed: 54,
        link: "#"
      }
    ]
  },
  about: {
    visible: true,
    title: "Engineering Philosophy",
    content: "I believe in shipping code that is robust, scalable, and meticulously tested. My workflow integrates automated pipelines, rigorous error tracking via Sentry, and cutting-edge AI assistance to deliver value faster without compromising quality."
  },
  stats: {
    visible: true,
    experience: "8 Years",
    projects: "42+",
    coffee: "∞"
  },
  github: {
    visible: true,
    username: "torvalds" // Default placeholder
  }
};

// Async now required for DB Ops, but we might init with defaults
export const getPortfolioConfig = async (): Promise<PortfolioConfig> => {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('config_json')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      // If no data, return default
      return DEFAULT_PORTFOLIO;
    }

    // Safety: config_json is typed as JSONB in SQL, returned as object/any here.
    // We assume it matches the shape. Simple validation could go here.
    return data.config_json as PortfolioConfig;

  } catch (e) {
    console.error("Failed to fetch portfolio config", e);
    return DEFAULT_PORTFOLIO;
  }
};

export const savePortfolioConfig = async (config: PortfolioConfig) => {
  try {
    // Insert new row to keep history (or update existing if you prefer)
    // Here we insert a new version every save for simplicity/history
    const { error } = await supabase
      .from(TABLE)
      .insert([
        { config_json: config }
      ]);

    if (error) {
      console.error("Supabase Save Error", error);
      alert("Failed to save to Database: " + error.message);
    } else {
      // Optional: Cache locally?
      // localStorage.setItem(PORTFOLIO_KEY, JSON.stringify(config)); 
    }
  } catch (e) {
    console.error("Failed to save portfolio config", e);
  }
};