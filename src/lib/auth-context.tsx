'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, isConfigured } from '@/lib/firebase';

// ─── Types ───────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isFirebaseConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

// ─── Context ─────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: false,
  isFirebaseConfigured: false,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

// ─── Provider ────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isConfigured);

  useEffect(() => {
    if (!isConfigured || !auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function signInWithGoogle() {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');
    await signInWithPopup(auth, provider);
  }

  async function signOut() {
    if (!auth) return;
    await firebaseSignOut(auth);
  }

  return (
    <AuthContext.Provider value={{ user, loading, isFirebaseConfigured: isConfigured, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
