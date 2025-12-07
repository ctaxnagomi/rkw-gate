import React, { useState, useEffect } from 'react';
import { GatekeeperState, AvatarConfig, VisitorSessionData } from './types';
import BootScreen from './components/BootScreen';
import AvatarCreator from './components/AvatarCreator';
import Terminal from './components/Terminal';
import Scanlines from './components/Scanlines';
import AccessGranted from './components/AccessGranted';
import AccessDenied from './components/AccessDenied';
import LoginScreen from './components/LoginScreen';
import AdminPanel from './components/AdminPanel';
import ProfileBuilder from './components/ProfileBuilder';

import { onAuthStateChange } from './services/authService';
import { supabase } from './services/supabaseClient';

const App: React.FC = () => {
  const [appState, setAppState] = useState<GatekeeperState>(GatekeeperState.BOOTING);

  // Load initial avatar from storage or default
  const [userAvatar, setUserAvatar] = useState<AvatarConfig>(() => {
    try {
      const saved = localStorage.getItem('gatekeeper_avatar_v1');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Failed to load avatar", e);
    }
    return {
      headId: 0,
      bodyId: 0,
      accessoryId: 0,
      color: '#4af626'
    };
  });

  const [sessionData, setSessionData] = useState<VisitorSessionData>({});

  // Helper to verify API Key presence visually if needed, but logic handles it
  const hasKey = !!process.env.API_KEY;

  useEffect(() => {
    // 1. Handle OAuth Redirect immediately on mount
    const checkRedirect = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      // If returning from provider (hash contains tokens) OR just have a valid active session
      // AND we are in the default booting state, we might want to restore Admin if that was the intent.
      // However, usually we only force Admin if we are SURE they were logging in (Redirect).

      const isRedirect = window.location.hash.includes('access_token') || window.location.hash.includes('type=recovery');

      if (session) {
        if (isRedirect) {
          // Definitely coming from login -> Go to Admin
          setAppState(GatekeeperState.ADMIN);
          // Optional: Clear hash to clean URL? 
          // window.history.replaceState(null, '', window.location.pathname);
        }
      }
    };

    checkRedirect();

    // 2. Listen for Auth Changes continuously
    const { data: { subscription } } = onAuthStateChange((session) => {
      if (session) {
        // If user is effectively "Logging In" (was in Login screen, or Booting up)
        setAppState((prev) => {
          if (prev === GatekeeperState.LOGIN || prev === GatekeeperState.BOOTING) {
            return GatekeeperState.ADMIN;
          }
          return prev; // Stay in current state if already active (e.g. don't kick user out of Builder)
        });
      } else {
        // Logged out
        setAppState((prev) => {
          // Only redirect to Active if they were in a protected route
          if (prev === GatekeeperState.ADMIN || prev === GatekeeperState.BUILDER) {
            return GatekeeperState.ACTIVE;
          }
          return prev;
        });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []); // Run once on mount (dependency array empty to avoid churn)

  // Also checking session specifically when entering LOGIN state could be useful, 
  // but the listener above handles the transition if the session is already there.

  if (!hasKey) {
    return (
      <div className="h-screen w-full bg-black text-red-500 font-mono flex items-center justify-center p-4">
        <div className="border border-red-500 p-8 max-w-lg text-center">
          <h1 className="text-2xl font-bold mb-4">SYSTEM ERROR: MISSING API KEY</h1>
          <p>The Gatekeeper requires a Neural Link (API Key) to function.</p>
          <p className="mt-4 text-xs opacity-50">Please verify process.env.API_KEY is set.</p>
        </div>
      </div>
    );
  }

  const handleAvatarComplete = (config: AvatarConfig) => {
    setUserAvatar(config);
    // Persist avatar setting
    localStorage.setItem('gatekeeper_avatar_v1', JSON.stringify(config));
    setAppState(GatekeeperState.ACTIVE);
  };

  const handleSessionUpdate = (data: VisitorSessionData) => {
    setSessionData(prev => ({ ...prev, ...data }));
  };

  return (
    <div className="relative w-full h-screen bg-terminal-bg overflow-hidden text-terminal-green selection:bg-terminal-green selection:text-black">
      <Scanlines />

      {appState === GatekeeperState.BOOTING && (
        <BootScreen onComplete={() => setAppState(GatekeeperState.CUSTOMIZING)} />
      )}

      {appState === GatekeeperState.CUSTOMIZING && (
        <AvatarCreator initialConfig={userAvatar} onComplete={handleAvatarComplete} />
      )}

      {appState === GatekeeperState.ACTIVE && (
        <div className="h-full flex items-center justify-center p-4 md:p-8 animate-fade-in">
          <Terminal
            onStateChange={setAppState}
            userAvatar={userAvatar}
            onSessionUpdate={handleSessionUpdate}
          />
        </div>
      )}

      {appState === GatekeeperState.LOGIN && (
        <LoginScreen onStateChange={setAppState} />
      )}

      {appState === GatekeeperState.ADMIN && (
        <AdminPanel onStateChange={setAppState} />
      )}

      {appState === GatekeeperState.BUILDER && (
        <ProfileBuilder onStateChange={setAppState} />
      )}

      {appState === GatekeeperState.GRANTED && (
        <div className="absolute inset-0 z-20">
          <AccessGranted sessionData={sessionData} />
        </div>
      )}

      {appState === GatekeeperState.REJECTED && (
        <div className="h-full flex items-center justify-center animate-glitch">
          <AccessDenied />
        </div>
      )}
    </div>
  );
};

export default App;