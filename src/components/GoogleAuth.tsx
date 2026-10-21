import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { signInWithPopup, signInWithRedirect, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { DataMigrator } from './DataMigrator';

export function GoogleAuth({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [guestMode, setGuestMode] = useState<boolean>(() => {
    return localStorage.getItem('vastu_guest_mode') === 'true';
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Safety timeout: Never leave user stuck on loading screen longer than 2.5 seconds
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
      clearTimeout(timer);
    }, (err) => {
      console.warn("Auth initialization note:", err);
      setLoading(false);
      clearTimeout(timer);
    });

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  const login = async () => {
    setErrorMessage(null);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      setGuestMode(false);
      localStorage.removeItem('vastu_guest_mode');
    } catch (error: any) {
      console.warn("signInWithPopup failed", error);
      if (error?.code === 'auth/unauthorized-domain') {
        setErrorMessage("Notice: This domain is not yet in your Firebase Authorized Domains list. You can click 'Continue as Guest / Offline' below to start mapping immediately, or add your GitHub domain in Firebase Console > Authentication > Settings.");
      } else {
        try {
          await signInWithRedirect(auth, provider);
        } catch (redirectErr: any) {
          setErrorMessage(redirectErr?.message || "Sign in failed. You can continue as a Guest below.");
        }
      }
    }
  };

  const handleContinueAsGuest = () => {
    setGuestMode(true);
    localStorage.setItem('vastu_guest_mode', 'true');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-100 text-stone-600 gap-3">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="font-medium animate-pulse text-sm">Loading your Vastu workspace...</p>
      </div>
    );
  }

  if (!user && !guestMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100 p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-stone-200 p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Vastu AI Shastra Guide</h1>
            <p className="text-stone-500 mt-2 text-sm leading-relaxed">
              Sign in with Google to sync your households and 16-zone reports to the cloud, or proceed as Guest.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 text-left leading-relaxed">
              {errorMessage}
            </div>
          )}

          <div className="space-y-3">
            <button 
              onClick={login} 
              className="w-full bg-stone-900 text-white font-medium py-3.5 rounded-xl hover:bg-stone-800 transition-colors shadow-lg cursor-pointer"
            >
              Sign In with Google
            </button>
            <button 
              onClick={handleContinueAsGuest} 
              className="w-full bg-stone-100 text-stone-700 font-medium py-3 rounded-xl hover:bg-stone-200 transition-colors cursor-pointer text-sm border border-stone-200"
            >
              Continue as Guest / Offline
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <DataMigrator>{children}</DataMigrator>;
}
