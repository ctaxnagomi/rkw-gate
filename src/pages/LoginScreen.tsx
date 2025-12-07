
import React, { useState } from 'react';
import { Github, Mail, ShieldCheck, ArrowLeft, AlertCircle } from 'lucide-react';
import { GatekeeperState } from '../types';
import { signInWithGithub, signInWithGoogle, signInWithPassword } from '../services/authService';

interface LoginScreenProps {
  onStateChange: (state: GatekeeperState) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onStateChange }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Credentials state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleOAuth = async (provider: 'github' | 'google') => {
    setLoading(true);
    setError(null);
    try {
      if (provider === 'github') await signInWithGithub();
      if (provider === 'google') await signInWithGoogle();
      // NOTE: OAuth will redirect the page, so we don't manually change state here usually.
      // The redirect comes back to the app, listener in App.tsx handles the state.
    } catch (e: any) {
      console.error("Auth Error", e);
      setError(e.message || "Authentication Failed");
      setLoading(false);
    }
  };

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError(null);
    try {
      await signInWithPassword(email, password);
      // Success will trigger onAuthStateChange in App.tsx
      // But we can also set state directly if desired, though listener is safer source of truth.
      onStateChange(GatekeeperState.ADMIN);
    } catch (e: any) {
      console.error("Login Error", e);
      setError(e.message || "Invalid Credentials");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-4 animate-fade-in bg-black text-terminal-green">
      <div className="w-full max-w-md border-2 border-terminal-green bg-black/90 shadow-[0_0_50px_rgba(74,246,38,0.1)] p-8 relative">
        <div className="absolute top-0 left-0 bg-terminal-green text-black font-retro px-2 py-0.5 text-xl">
          ADMIN_AUTH_V2.0
        </div>

        <button
          onClick={() => onStateChange(GatekeeperState.ACTIVE)}
          className="absolute top-4 right-4 text-terminal-green/50 hover:text-terminal-green"
          title="Back to Terminal"
          aria-label="Back to Terminal"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="mt-12 space-y-6">
          <div className="text-center font-mono mb-8">
            <ShieldCheck className="w-16 h-16 mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold">SECURE LOGIN</h2>
            <p className="text-xs text-terminal-dim mt-2">RESTRICTED ACCESS AREA</p>
          </div>

          {error && (
            <div className="p-3 border border-red-500 bg-red-900/20 text-red-500 text-xs flex items-center gap-2">
              <AlertCircle size={14} />
              {error.toUpperCase()}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8 font-mono animate-pulse">
              HANDSHAKING WITH AUTH SERVER...
            </div>
          ) : (
            <div className="space-y-4">
              <button
                onClick={() => handleOAuth('github')}
                className="w-full flex items-center justify-center gap-3 p-3 border border-terminal-green/50 hover:bg-terminal-green/10 hover:border-terminal-green transition-all group"
              >
                <Github size={18} />
                <span className="font-mono text-sm">CONTINUE WITH GITHUB</span>
              </button>

              <button
                onClick={() => handleOAuth('google')}
                className="w-full flex items-center justify-center gap-3 p-3 border border-terminal-green/50 hover:bg-terminal-green/10 hover:border-terminal-green transition-all"
              >
                <span className="font-bold text-lg leading-none">G</span>
                <span className="font-mono text-sm">CONTINUE WITH GOOGLE</span>
              </button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-terminal-dim"></span>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-black px-2 text-terminal-dim">OR CREDENTIALS</span>
                </div>
              </div>

              <form onSubmit={handleCredentials} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="EMAIL ADDRESS"
                  className="w-full bg-black border border-terminal-dim p-2 text-sm font-mono focus:border-terminal-green outline-none"
                />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="PASSWORD"
                  className="w-full bg-black border border-terminal-dim p-2 text-sm font-mono focus:border-terminal-green outline-none"
                />
                <button
                  type="submit"
                  className="w-full bg-terminal-green/20 border border-terminal-green text-terminal-green p-2 font-retro hover:bg-terminal-green hover:text-black transition-colors"
                >
                  AUTHENTICATE
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
