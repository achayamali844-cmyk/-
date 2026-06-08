import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './lib/firebase';
import Login from './pages/Login';
import MainApp from './pages/MainApp';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (u) {
        setUser(u);
      } else {
        // Automatically provide a default guest academic user to bypass the login screen
        setUser({
          uid: 'guest-academic',
          email: 'guest@example.com',
          displayName: 'Guest Academic',
          isGuest: true
        });
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-transparent text-white font-mono">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-2 border-white/20 border-t-white/80 animate-spin" />
            <span className="text-sm tracking-widest text-[#86868b] uppercase">Loading</span>
        </div>
    </div>
  );

  return (
    <Routes>
      <Route path="/" element={!user ? <Login /> : <Navigate to="/app" />} />
      <Route path="/app/*" element={user ? <MainApp /> : <Navigate to="/" />} />
    </Routes>
  );
}
