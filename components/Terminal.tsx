
import React, { useState, useEffect, useRef } from 'react';
import { Send, Cpu, Globe, Users, Bot, ShieldAlert, Lock, Volume2 } from 'lucide-react';
import { Message, GatekeeperState, AvatarConfig, VisitorStats, VisitorSessionData } from '../types';
import { initializeLogic, processLogicMessage } from '../services/logicService';
import { initializeChat, sendMessage as sendGeminiMessage } from '../services/geminiService';
import { logAttempt } from '../services/auditService';
import { getStats } from '../services/statsService';
import { getConfig } from '../services/configService';
import ThinkingIndicator from './ThinkingIndicator';
import PixelAvatar from './PixelAvatar';

interface TerminalProps {
  onStateChange: (state: GatekeeperState) => void;
  userAvatar: AvatarConfig;
  onSessionUpdate: (data: VisitorSessionData) => void;
}

const GATEKEEPER_AVATAR: AvatarConfig = {
  headId: 0,
  bodyId: 1,
  accessoryId: 1,
  color: '#4af626' // Terminal Green
};

const Terminal: React.FC<TerminalProps> = ({ onStateChange, userAvatar, onSessionUpdate }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentThought, setCurrentThought] = useState<string>("Initializing secure connection...");
  const [stats, setStats] = useState<VisitorStats>({ browsers: 0, recruiters: 0, bots: 0 });
  const [currentAudio, setCurrentAudio] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentAudio]);

  useEffect(() => {
    // Initial stats load
    getStats().then(setStats);

    // Initial boot sequence interaction
    const boot = async () => {
      setIsTyping(true);
      try {
        const config = await getConfig();
        let response;
        if (config.useAI) {
          try {
            response = await initializeChat();
          } catch (e) {
            console.error("AI Boot Failed, falling back to logic", e);
            response = await initializeLogic();
          }
        } else {
          response = await initializeLogic();
        }

        setMessages([{
          role: 'assistant',
          content: response.message,
          thinking: response.thinking,
          timestamp: Date.now()
        }]);
        setCurrentThought(response.thinking);
      } catch (e) {
        console.error(e);
      } finally {
        setIsTyping(false);
        inputRef.current?.focus();
      }
    };
    boot();

    // Poll for stats changes
    const interval = setInterval(() => {
      getStats().then(setStats);
    }, 2000);
    return () => clearInterval(interval);

  }, []);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const userText = inputValue;
    setInputValue('');
    setCurrentAudio(null); // Clear previous audio on new input

    // Add user message
    setMessages(prev => [...prev, {
      role: 'user',
      content: userText,
      timestamp: Date.now()
    }]);

    setIsTyping(true);
    setCurrentThought("Processing logic gates...");

    try {
      // 1. Get previous system question for logging context
      const lastSystemMessage = [...messages].reverse().find(m => m.role === 'assistant');
      const questionContext = lastSystemMessage ? lastSystemMessage.content : "INITIAL_GREETING";

      // 2. Process logic
      const config = await getConfig();
      let response;

      if (config.useAI) {
        try {
          response = await sendGeminiMessage(userText);
        } catch (e) {
          console.error("AI Message Failed", e);
          response = await processLogicMessage(userText);
        }
      } else {
        response = await processLogicMessage(userText);
      }

      if (!response) throw new Error("No response");

      setCurrentThought(response.thinking);

      // Update stats immediately after logic might have changed them
      getStats().then(setStats);

      // 3. Log the attempt securely (Audit)
      logAttempt(questionContext, userText, response.action);

      // Simulate typing delay for effect
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.message,
          thinking: response.thinking,
          timestamp: Date.now()
        }]);

        // Handle Audio
        if (response.audio) {
          setCurrentAudio(response.audio);
          // Auto-play attempt
          setTimeout(() => {
            audioRef.current?.play().catch(e => console.log("Auto-play blocked", e));
          }, 100);
        }

        setIsTyping(false);

        if (response.action === 'GRANT') {
          // If a salary was offered, pass it up, along with avatar config
          onSessionUpdate({
            offeredSalary: response.offeredSalary,
            avatarConfig: userAvatar
          });

          setTimeout(() => onStateChange(GatekeeperState.GRANTED), 1500);
        } else if (response.action === 'REJECT') {
          setTimeout(() => onStateChange(GatekeeperState.REJECTED), 1500);
        } else {
          setTimeout(() => inputRef.current?.focus(), 100);
        }
      }, 600);

    } catch (error) {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: 'system',
        content: "FATAL ERROR: Logic core corrupted.",
        timestamp: Date.now()
      }]);
    }
  };

  return (
    <div className="flex h-full w-full max-w-5xl mx-auto gap-4">

      {/* Network Traffic Sidebar (Left) */}
      <div className="hidden md:flex flex-col w-64 border border-terminal-dim bg-black/80 p-4 font-mono text-xs">
        <div className="flex items-center gap-2 mb-6 border-b border-terminal-dim pb-2">
          <Globe className="w-4 h-4 text-terminal-green animate-pulse" />
          <span className="text-terminal-green font-bold">NETWORK TRAFFIC</span>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-terminal-green/70 uppercase">
              <Users className="w-3 h-3" />
              <span>Browsers</span>
            </div>
            <div className="text-2xl text-terminal-green font-retro border border-terminal-green/20 bg-terminal-green/5 p-2 text-right">
              {stats.browsers.toString().padStart(4, '0')}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-terminal-amber/70 uppercase">
              <ShieldAlert className="w-3 h-3" />
              <span>Recruiters</span>
            </div>
            <div className="text-2xl text-terminal-amber font-retro border border-terminal-amber/20 bg-terminal-amber/5 p-2 text-right">
              {stats.recruiters.toString().padStart(4, '0')}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-terminal-red/70 uppercase">
              <Bot className="w-3 h-3" />
              <span>Crawler Bots</span>
            </div>
            <div className="text-2xl text-terminal-red font-retro border border-terminal-red/20 bg-terminal-red/5 p-2 text-right animate-pulse">
              {stats.bots.toString().padStart(4, '0')}
            </div>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-terminal-dim text-[10px] text-terminal-dim">
          <p>SERVER: US-EAST-1</p>
          <p>UPTIME: 99.9%</p>
          <p>PROTOCOL: HTTPS/SECURE</p>
        </div>
      </div>

      {/* Main Terminal Area */}
      <div className="flex-1 flex flex-col border border-terminal-dim bg-black/80 shadow-[0_0_50px_rgba(74,246,38,0.1)] relative">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-terminal-dim bg-terminal-dim/20 backdrop-blur">
          <div className="flex items-center gap-3">
            <div
              onClick={() => onStateChange(GatekeeperState.LOGIN)}
              className="relative cursor-pointer group hover:opacity-80 transition-opacity"
              title="Admin Access"
            >
              <Cpu className="w-6 h-6 text-terminal-green animate-pulse group-hover:text-terminal-amber" />
              <div className="absolute inset-0 bg-terminal-green blur-md opacity-20 group-hover:bg-terminal-amber"></div>
              <Lock className="w-3 h-3 absolute -top-1 -right-1 text-terminal-dim opacity-0 group-hover:opacity-100" />
            </div>
            <div>
              <h1 className="font-retro text-2xl leading-none tracking-wider text-terminal-green">RKW-GATEKEEPER</h1>
              <p className="text-[10px] text-terminal-green/50 font-mono tracking-widest">vLOGIC // SENTRY_ACTIVE</p>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-2 w-2 rounded-full bg-terminal-green animate-blink"></div>
            <div className="h-2 w-2 rounded-full bg-terminal-green/50"></div>
            <div className="h-2 w-2 rounded-full bg-terminal-green/20"></div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 font-mono text-sm relative" onClick={() => inputRef.current?.focus()}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

              {/* Avatar */}
              <div className="flex-shrink-0 mt-1">
                {msg.role === 'assistant' && (
                  <div className="border border-terminal-green/30 p-1 bg-black">
                    <PixelAvatar config={GATEKEEPER_AVATAR} size={32} />
                  </div>
                )}
                {msg.role === 'user' && (
                  <div className="border border-terminal-amber/30 p-1 bg-black">
                    <PixelAvatar config={userAvatar} size={32} />
                  </div>
                )}
                {msg.role === 'system' && (
                  <div className="w-8 h-8 flex items-center justify-center border border-terminal-red/30 text-terminal-red">
                    !
                  </div>
                )}
              </div>

              {/* Message Bubble */}
              <div className={`flex-1 max-w-[80%] ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className="text-[10px] opacity-40 mb-1 flex items-center gap-2 uppercase tracking-widest">
                  <span className={msg.role === 'user' ? 'ml-auto' : ''}>
                    {msg.role === 'assistant' ? 'GATEKEEPER' : (msg.role === 'user' ? 'VISITOR' : 'SYSTEM')}
                  </span>
                  <span>//</span>
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                </div>

                <div className={`p-3 border ${msg.role === 'user' ? 'border-terminal-amber/20 bg-terminal-amber/5 text-terminal-amber' :
                  msg.role === 'system' ? 'border-terminal-red/50 text-terminal-red' :
                    'border-terminal-green/20 bg-terminal-green/5 text-terminal-green'
                  }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {/* Audio Player Container */}
          {currentAudio && !isTyping && (
            <div className="flex flex-row items-center gap-4 ml-14 max-w-[80%] p-4 border border-terminal-green/30 bg-terminal-green/10 animate-fade-in">
              <Volume2 className="w-6 h-6 text-terminal-green animate-pulse" />
              <div className="flex-1">
                <div className="text-[10px] text-terminal-green/70 mb-1">INCOMING TRANSMISSION: morse.wav</div>
                <audio ref={audioRef} controls src={currentAudio} className="w-full h-8 opacity-70 hover:opacity-100" />
              </div>
            </div>
          )}

          {isTyping && (
            <div className="flex items-start gap-4">
              <div className="border border-terminal-green/30 p-1 bg-black opacity-50">
                <PixelAvatar config={GATEKEEPER_AVATAR} size={32} />
              </div>
              <div className="flex items-center gap-1 text-terminal-green text-xs mt-3 animate-pulse">
                <span>COMPUTING</span>
                <span className="w-1 h-3 bg-terminal-green inline-block"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Thinking Line */}
        <ThinkingIndicator thought={currentThought} />

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-terminal-dim bg-black">
          <div className="flex items-center gap-2 text-terminal-green/80">
            <span className="font-retro text-xl animate-pulse">{'>'}</span>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isTyping}
              className="flex-1 bg-transparent border-none outline-none font-mono text-lg text-terminal-green placeholder-terminal-green/30 focus:ring-0"
              placeholder={isTyping ? "WAITING FOR RESPONSE..." : "ENTER COMMAND..."}
              autoFocus
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className="text-terminal-green hover:text-terminal-amber disabled:opacity-30 transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Terminal;
