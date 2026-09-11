import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { DataMigrator } from './DataMigrator';

export function GoogleAuth({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider).catch(console.error);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-stone-100 text-stone-600">Loading your secure workspace...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100 p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-stone-200 p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Secure Cloud Access</h1>
            <p className="text-stone-500 mt-2">Sign in to sync your Vastu profiles and analysis history across all your devices.</p>
          </div>
          <button onClick={login} className="w-full bg-stone-900 text-white font-medium py-4 rounded-xl hover:bg-stone-800 transition-colors shadow-lg">
            Sign In with Google
          </button>
        </div>
      </div>
    );
  }

  return <DataMigrator>{children}</DataMigrator>;
}
