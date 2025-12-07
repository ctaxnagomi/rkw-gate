
import { GatekeeperResponse } from '../types';
import { incrementStat } from './statsService';
import { getConfig } from './configService';

interface SessionState {
  stage: 'INIT' | 'BOT_CHECK' | 'PURPOSE' | 'SALARY' | 'VIBE' | 'DONE';
  username: string;
  challengeAnswer?: string;
}

// Initial State
let session: SessionState = {
  stage: 'INIT',
  username: 'Unknown'
};

export const resetLogicSession = () => {
  session = {
    stage: 'INIT',
    username: 'Unknown'
  };
};

export const initializeLogic = async (): Promise<GatekeeperResponse> => {
  resetLogicSession();
  return {
    message: "SYSTEM BOOT COMPLETE. UNKNOWN ENTITY DETECTED. IDENTIFY YOURSELF. ENTER NAME OR HANDLE.",
    thinking: "Scanning biometrics...",
    action: "WAIT_INPUT"
  };
};

export const processLogicMessage = async (input: string): Promise<GatekeeperResponse> => {
  const normalizedInput = input.trim().toLowerCase();
  const config = await getConfig(); // Load dynamic config

  // STAGE 1: INITIALIZATION (Identity)
  if (session.stage === 'INIT') {
    session.username = input.trim().substring(0, 20); // Cap name length

    // AUTH BRANCHING
    if (config.authMode === 'morse') {
      session.stage = 'BOT_CHECK';

      // Select random Morse challenge
      const pairs = config.morsePairs;
      if (!pairs || pairs.length === 0) {
        // Fallback if config is broken
        return {
          message: "SECURITY CONFIG ERROR. NO MORSE DATA FOUND. CONTACT ADMIN.",
          thinking: "System configuration invalid.",
          action: "REJECT"
        };
      }

      const randomPair = pairs[Math.floor(Math.random() * pairs.length)];
      session.challengeAnswer = randomPair.text.trim();

      return {
        message: `IDENTITY "${session.username.toUpperCase()}" LOGGED. SECURITY LEVEL 5. DECODE THE FOLLOWING AUDIO TRANSMISSION INTO TEXT.`,
        thinking: "Initiating Morse Code challenge...",
        action: "WAIT_INPUT",
        audio: randomPair.audioData
      };
    } else {
      // Normal Mode: Skip Bot Check
      session.stage = 'PURPOSE';
      return {
        message: `IDENTITY "${session.username.toUpperCase()}" LOGGED. STATE YOUR INTENT. ARE YOU HERE FOR: [1] RECRUITMENT/BUSINESS, [2] BROWSING/INSPECTION?`,
        thinking: "Standard protocol initiated. Bot check bypassed.",
        action: "WAIT_INPUT"
      };
    }
  }

  // STAGE 2: BOT CHECK (Morse Code)
  if (session.stage === 'BOT_CHECK') {
    const rawInput = input.trim();
    const correctAnswer = session.challengeAnswer || "";

    // Validate Morse Code Match
    if (rawInput === correctAnswer) {
      // Passed
      session.stage = 'PURPOSE';
      return {
        message: "DECRYPTION SUCCESSFUL. BIOLOGICAL ORIGIN CONFIRMED. STATE YOUR INTENT. ARE YOU HERE FOR: [1] RECRUITMENT/BUSINESS, [2] BROWSING/INSPECTION?",
        thinking: "Validation successful. Proceeding...",
        action: "WAIT_INPUT"
      };
    } else {
      // Failed
      incrementStat('bots');
      session.stage = 'DONE';
      return {
        message: "INCORRECT DECRYPTION. AUTOMATED SCRIPT DETECTED. TERMINATING.",
        thinking: `Mismatch. Expected '${correctAnswer}', got '${rawInput}'`,
        action: "REJECT"
      };
    }
  }

  // STAGE 3: PURPOSE CHECK
  if (session.stage === 'PURPOSE') {
    // Recruitment keywords
    if (/1|recruitment|hiring|business|job|offer|work/.test(normalizedInput)) {
      session.stage = 'SALARY';
      return {
        message: "RECRUITMENT PROTOCOL INITIATED. MANDATORY FIELD: ENTER MONTHLY BUDGET/SALARY IN USD (NUMBERS ONLY).",
        thinking: "Loading commercial filtering algorithms...",
        action: "WAIT_INPUT"
      };
    }
    // Browsing keywords
    else if (/2|browsing|visiting|looking|just looking|visitor/.test(normalizedInput)) {
      session.stage = 'VIBE';
      return {
        message: "VISITOR PROTOCOL. DO YOU VOW TO OBSERVE WITHOUT CAUSING SYSTEM INSTABILITY? [YES/NO]",
        thinking: "Analyzing threat potential...",
        action: "WAIT_INPUT"
      };
    }
    // Invalid
    else {
      return {
        message: "INVALID INPUT. SELECT [1] FOR BUSINESS OR [2] FOR BROWSING.",
        thinking: "Input syntax error. Retrying...",
        action: "WAIT_INPUT"
      };
    }
  }

  // STAGE 4A: THE SALARY TRAP
  if (session.stage === 'SALARY') {
    // Extract first number found
    const match = normalizedInput.match(/(\d+)/);

    if (!match) {
      return {
        message: "DATA CORRUPTION. NUMERIC VALUE REQUIRED FOR FINANCIAL AUDIT.",
        thinking: "Parsing error: NaN detected.",
        action: "WAIT_INPUT"
      };
    }

    const value = parseInt(match[0], 10);
    const THRESHOLD = config.salaryThreshold; // Use dynamic threshold

    if (value < THRESHOLD) {
      session.stage = 'DONE';
      return {
        message: `OFFER REJECTED. DETECTED VALUE $${value} IS BELOW MARKET STANDARD ($${THRESHOLD}). TERMINATING CONNECTION.`,
        thinking: "Lowball offer detected. Blocking...",
        action: "REJECT"
      };
    } else {
      incrementStat('recruiters');
      session.stage = 'DONE';
      return {
        message: `VALUATION ACCEPTABLE ($${value}). YOU MAY PROCEED TO THE PORTFOLIO.`,
        thinking: "Value aligned. Opening gates...",
        action: "GRANT",
        offeredSalary: value
      };
    }
  }

  // STAGE 4B: THE VIBE CHECK
  if (session.stage === 'VIBE') {
    if (/yes|y|sure|ok|affirmative/.test(normalizedInput)) {
      incrementStat('browsers');
      session.stage = 'DONE';
      return {
        message: "VOW ACCEPTED. ACCESS GRANTED. WELCOME TO THE MAINFRAME.",
        thinking: "Threat level: LOW.",
        action: "GRANT"
      };
    } else if (/no|n|nah|nope|negative/.test(normalizedInput)) {
      session.stage = 'DONE';
      return {
        message: "HONESTY NOTED, BUT THREAT DETECTED. ACCESS DENIED.",
        thinking: "Threat level: CRITICAL.",
        action: "REJECT"
      };
    } else {
      return {
        message: "AMBIGUOUS RESPONSE. REPLY [YES] or [NO].",
        thinking: "Analyzing sentiment...",
        action: "WAIT_INPUT"
      };
    }
  }

  // FALLBACK
  return {
    message: "SYSTEM ERROR. STATE UNKNOWN. REBOOTING...",
    thinking: "Kernel panic...",
    action: "WAIT_INPUT"
  };
};