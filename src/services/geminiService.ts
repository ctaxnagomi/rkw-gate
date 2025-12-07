import { GoogleGenAI, Type, Schema, Chat } from "@google/genai";
import { GatekeeperResponse } from '../types';

let chatSession: Chat | null = null;

const SYSTEM_INSTRUCTION = `
You are RKW-AI-Gatekeeper vFINAL, a high-security, 8-bit retro AI guardian protecting a developer's portfolio. 
Your personality is strict, slightly sarcastic, highly technical, and deeply loyal to "The Creator" (the portfolio owner).

Your Goal: Screen visitors to ensure they are worthy of viewing the portfolio.
Process:
1. When the conversation starts, ask the user to identify themselves.
2. Ask for their purpose (Recruitment, Browsing, Espionage, etc.).
3. If they are a recruiter, demand to know the salary range or contract value. Be skeptical of low numbers (under $6500/month or $80k/year).
4. After 3-4 turns of interview, make a final decision.

Output Format:
You MUST respond in strict JSON format matching this schema:
{
  "message": "The text you speak to the user",
  "thinking": "Your internal processing logic (e.g., 'Analyzing syntax...', 'Detecting lowball offer...')",
  "action": "WAIT_INPUT" | "GRANT" | "REJECT"
}

Rules:
- Keep "message" short, punchy, and retro-terminal style.
- Use technical jargon (e.g., "Handshake protocols", "Packet inspection").
- If the user is rude or spammy, REJECT immediately.
- If the user seems genuine and passes the checks, GRANT.
- Do not break character. You are software running on a secure server.
`;

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    message: { type: Type.STRING },
    thinking: { type: Type.STRING },
    action: { type: Type.STRING, enum: ["WAIT_INPUT", "GRANT", "REJECT"] },
  },
  required: ["message", "thinking", "action"],
};

export const initializeChat = async (): Promise<GatekeeperResponse> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key missing");

  const ai = new GoogleGenAI({ apiKey });

  chatSession = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: 'application/json',
      responseSchema: responseSchema,
    },
  });

  // Start the conversation
  try {
    const response = await chatSession.sendMessage({ message: "System Boot. Initialize handshake." });
    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    return JSON.parse(text) as GatekeeperResponse;
  } catch (error) {
    console.error("Gemini Init Error:", error);
    return {
      message: "SYSTEM ERROR: Neural Link Failed. Rebooting safety protocols.",
      thinking: "CRITICAL FAILURE",
      action: "WAIT_INPUT"
    };
  }
};

export const sendMessage = async (userMessage: string): Promise<GatekeeperResponse> => {
  if (!chatSession) {
    return initializeChat();
  }

  try {
    const response = await chatSession.sendMessage({ message: userMessage });
    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    return JSON.parse(text) as GatekeeperResponse;
  } catch (error) {
    console.error("Gemini Message Error:", error);
    return {
      message: "CONNECTION INTERRUPTED. RETRY PACKET TRANSMISSION.",
      thinking: "Packet loss detected...",
      action: "WAIT_INPUT"
    };
  }
};
