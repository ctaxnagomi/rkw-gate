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

import { onAuthStateChange, getCurrentSession } from './services/authService';

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
    // Check initial session
    getCurrentSession().then(session => {
      if (session && window.location.hash.includes('access_token')) {
        // If returning from OAuth redirect
        setAppState(GatekeeperState.ADMIN);
      }
    });

    const { data: { subscription } } = onAuthStateChange((session) => {
      // If user logs in successfully, move to ADMIN
      if (session && appState === GatekeeperState.LOGIN) {
        setAppState(GatekeeperState.ADMIN);
      }
      // If user logs out, move to ACTIVE (Terminal)
      if (!session && appState === GatekeeperState.ADMIN) {
        setAppState(GatekeeperState.ACTIVE);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [appState]);

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