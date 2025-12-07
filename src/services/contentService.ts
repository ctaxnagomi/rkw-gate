
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
export const getPortfolioConfig = async (specificUserId?: string): Promise<PortfolioConfig> => {
  try {
    let query = supabase
      .from(TABLE)
      .select('config_json, user_id')
      .order('updated_at', { ascending: false })
      .limit(1);

    // If a specific user is requested (e.g. the logged in editor), filter by it.
    // Otherwise it fetches the latest global config (Visitor Mode for single-tenant sites).
    if (specificUserId) {
      query = query.eq('user_id', specificUserId);
    }

    const { data, error } = await query.single();

    if (error || !data) {
      // If no data found for this user, return default.
      // This is expected for a new user logging in for the first time.
      return DEFAULT_PORTFOLIO;
    }

    return data.config_json as PortfolioConfig;

  } catch (e) {
    console.error("Failed to fetch portfolio config", e);
    return DEFAULT_PORTFOLIO;
  }
};

export const savePortfolioConfig = async (config: PortfolioConfig) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("Must be logged in to save configuration.");
    }

    // Insert new row with user_id to keep ownership
    const { error } = await supabase
      .from(TABLE)
      .insert([
        {
          config_json: config,
          user_id: user.id
        }
      ]);

    if (error) {
      console.error("Supabase Save Error", error);
      alert("Failed to save to Database: " + error.message);
    }
  } catch (e) {
    console.error("Failed to save portfolio config", e);
    alert(e instanceof Error ? e.message : "Unknown error saving config");
  }
};