
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Lock, Save, AlertTriangle, Settings, LayoutTemplate, Shield, Plus, Trash2, Play, Upload } from 'lucide-react';
import { GatekeeperState, AdminConfig, MorsePair } from '../types';
import { getConfig, saveConfig } from '../services/configService';
import { signOut } from '../services/authService';

interface AdminPanelProps {
  onStateChange: (state: GatekeeperState) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onStateChange }) => {
  const [config, setConfig] = useState<AdminConfig | null>(null);
  const [saved, setSaved] = useState(false);
  const audioPreviewRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    getConfig().then(setConfig);
  }, []);

  if (!config) return <div className="text-terminal-green p-4">LOADING CONFIG...</div>;

  const handleSave = () => {
    saveConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addMorsePair = () => {
    const newPair: MorsePair = {
      id: crypto.randomUUID(),
      text: "",
      audioData: ""
    };
    setConfig({
      ...config,
      morsePairs: [...config.morsePairs, newPair]
    });
  };

  const removeMorsePair = (id: string) => {
    setConfig({
      ...config,
      morsePairs: config.morsePairs.filter(p => p.id !== id)
    });
  };

  const updateMorsePair = (id: string, field: keyof MorsePair, value: string) => {
    setConfig({
      ...config,
      morsePairs: config.morsePairs.map(p =>
        p.id === id ? { ...p, [field]: value } : p
      )
    });
  };

  const handleFileUpload = (id: string, file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      updateMorsePair(id, 'audioData', base64String);
    };
    reader.readAsDataURL(file);
  };

  const playAudio = (audioData: string) => {
    if (audioPreviewRef.current) {
      audioPreviewRef.current.src = audioData;
      audioPreviewRef.current.play();
    }
  };

  return (
    <div className="h-full w-full bg-black text-terminal-green p-4 md:p-8 overflow-y-auto font-mono">
      <div className="max-w-4xl mx-auto border border-terminal-dim bg-terminal-dim/5 p-6 shadow-[0_0_30px_rgba(74,246,38,0.05)]">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 border-b border-terminal-dim pb-4">
          <div className="flex items-center gap-3">
            <Settings className="w-8 h-8 animate-spin-slow" />
            <div>
              <h1 className="text-2xl font-retro tracking-widest">SYSTEM_CONFIGURATION</h1>
              <p className="text-xs text-terminal-dim">ROOT ACCESS GRANTED</p>
            </div>
          </div>


          // ... inside the component
          <button
            onClick={() => { signOut(); onStateChange(GatekeeperState.ACTIVE); }}
            className="flex items-center gap-2 text-sm hover:text-terminal-amber transition-colors"
          >
            <ArrowLeft size={16} />
            LOGOUT / TERMINAL
          </button>
        </div>

        {/* Builder Quick Launch */}
        <div className="mb-8 p-6 border border-terminal-green bg-terminal-green/5 flex items-center justify-between group hover:bg-terminal-green/10 transition-colors cursor-pointer" onClick={() => onStateChange(GatekeeperState.BUILDER)}>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-black border border-terminal-green rounded-full">
              <LayoutTemplate className="w-6 h-6 text-terminal-green" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-terminal-green">PROFILE BUILDER</h2>
              <p className="text-sm text-terminal-dim">Customize the portfolio landing page layout.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-terminal-green font-bold group-hover:translate-x-2 transition-transform">
            LAUNCH EDITOR <span className="text-xl">→</span>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">

          {/* Editable Configuration */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold border-l-4 border-terminal-green pl-3">PARAMETER SETTINGS</h2>

            <div className="space-y-4 bg-black/50 p-4 border border-terminal-dim">

              <div className="space-y-2 pt-2">
                <label className="text-sm uppercase tracking-wider text-terminal-green/80">
                  Salary Reject Threshold (USD)
                </label>
                <input
                  type="number"
                  value={config.salaryThreshold}
                  onChange={(e) => setConfig({ ...config, salaryThreshold: parseInt(e.target.value) || 0 })}
                  className="w-full bg-black border border-terminal-green/50 p-2 font-mono focus:outline-none focus:border-terminal-green"
                />
                <p className="text-[10px] text-terminal-dim">
                  Offers below this monthly amount are automatically rejected.
                </p>
              </div>

              <div className="pt-4 border-t border-terminal-dim mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-terminal-green">AI CORE (GEMINI)</span>
                  <button
                    onClick={() => setConfig({ ...config, useAI: !config.useAI })}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${config.useAI ? 'bg-terminal-green' : 'bg-terminal-dim'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-black shadow-md transform transition-transform ${config.useAI ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
                <p className="text-[10px] text-terminal-dim mt-1">
                  {config.useAI ? 'Running on Google Gemini 1.5 Pro. API Key Required.' : 'Running on Logic Service (Scripted). Offline Safe.'}
                </p>
              </div>

              <div className="pt-6">
                <button
                  onClick={handleSave}
                  className="w-full flex items-center justify-center gap-2 bg-terminal-green text-black py-3 font-bold hover:bg-terminal-green/90 transition-all"
                >
                  <Save size={18} />
                  {saved ? 'CONFIGURATION SAVED' : 'SAVE CHANGES'}
                </button>
              </div>

            </div>
          </div>

          {/* Security Protocols (Auth Mode) */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold border-l-4 border-terminal-amber pl-3 text-terminal-amber">SECURITY PROTOCOLS</h2>

            <div className="space-y-4 bg-black/50 p-4 border border-terminal-dim">

              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">AUTHENTICATION MODE</span>
                <div className="flex bg-black border border-terminal-dim rounded p-1">
                  <button
                    onClick={() => setConfig({ ...config, authMode: 'normal' })}
                    className={`px-3 py-1 text-xs ${config.authMode === 'normal' ? 'bg-terminal-green text-black' : 'text-terminal-dim'}`}
                  >
                    NORMAL
                  </button>
                  <button
                    onClick={() => setConfig({ ...config, authMode: 'morse' })}
                    className={`px-3 py-1 text-xs ${config.authMode === 'morse' ? 'bg-terminal-green text-black' : 'text-terminal-dim'}`}
                  >
                    MORSE
                  </button>
                </div>
              </div>

              {config.authMode === 'normal' && (
                <div className="p-3 bg-terminal-green/10 border border-terminal-green/30 text-xs text-terminal-green">
                  <p>Standard flow enabled. Bot checks are skipped. Visitors go directly to Purpose & Salary negotiation.</p>
                </div>
              )}

              {config.authMode === 'morse' && (
                <div className="space-y-4">
                  <div className="p-3 bg-terminal-amber/10 border border-terminal-amber/30 text-xs text-terminal-amber">
                    <p className="flex items-center gap-2">
                      <Shield size={14} />
                      Enhanced Verification Active.
                    </p>
                    <p className="mt-1 opacity-70">
                      Visitors must decode a random Audio Signal to prove humanity.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-terminal-dim">
                      <span>MORSE DATABASE ({config.morsePairs.length}/10 Min)</span>
                      {config.morsePairs.length < 10 && <span className="text-terminal-red">Under Minimum</span>}
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-2 pr-2 scrollbar-thin">
                      {config.morsePairs.map((pair, idx) => (
                        <div key={pair.id} className="p-3 border border-terminal-dim bg-black/50 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-terminal-dim font-bold">#{idx + 1}</span>
                            <input
                              type="text"
                              value={pair.text}
                              placeholder="Enter Morse (e.g. -.-.)"
                              onChange={(e) => updateMorsePair(pair.id, 'text', e.target.value)}
                              className="flex-1 bg-black border border-terminal-dim p-1 text-xs focus:border-terminal-green outline-none"
                            />
                            <button
                              onClick={() => removeMorsePair(pair.id)}
                              className="text-red-500 hover:text-red-400"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="flex-1 cursor-pointer bg-black border border-terminal-dim border-dashed p-1 text-center hover:border-terminal-green text-[10px] text-terminal-dim">
                              {pair.audioData ? "Change .WAV" : "Upload .WAV"}
                              <input
                                type="file"
                                accept=".wav,audio/wav"
                                className="hidden"
                                onChange={(e) => e.target.files && handleFileUpload(pair.id, e.target.files[0])}
                              />
                            </label>

                            {pair.audioData ? (
                              <button
                                onClick={() => playAudio(pair.audioData)}
                                className="p-1.5 bg-terminal-green text-black rounded-sm hover:bg-terminal-green/80"
                                title="Validate Audio"
                              >
                                <Play size={10} />
                              </button>
                            ) : (
                              <div className="p-1.5 opacity-30 bg-terminal-dim text-black rounded-sm">
                                <Upload size={10} />
                              </div>
                            )}

                            {/* Status Indicator */}
                            <div className={`w-2 h-2 rounded-full ${pair.text && pair.audioData ? 'bg-terminal-green' : 'bg-terminal-red animate-pulse'}`} title={pair.text && pair.audioData ? 'Ready' : 'Incomplete'}></div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={addMorsePair}
                      className="w-full py-2 border border-dashed border-terminal-dim text-terminal-dim hover:text-terminal-green hover:border-terminal-green text-xs flex items-center justify-center gap-2 transition-colors"
                    >
                      <Plus size={12} /> Add Verification Pair
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* Locked Questions Panel (Now minimized as Security Protocol takes precedence) */}
        <div className="mt-8 opacity-50 hover:opacity-100 transition-opacity">
          <div className="text-xs text-terminal-dim uppercase mb-2">Immutable Core Logic</div>
          <div className="p-4 border border-terminal-dim/30 bg-terminal-dim/5 text-xs font-mono text-terminal-dim flex items-center gap-4">
            <Lock size={12} />
            <span>Identity Check</span>
            <span className="text-terminal-dim/50">→</span>
            <span>Purpose Filter</span>
            <span className="text-terminal-dim/50">→</span>
            <span>Salary Negotiation</span>
            <span className="text-terminal-dim/50">→</span>
            <span>Vibe Check</span>
          </div>
        </div>

        {/* Hidden Audio Element for Previews */}
        <audio ref={audioPreviewRef} className="hidden" />

      </div>
    </div>
  );
};

export default AdminPanel;
