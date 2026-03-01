import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  // Initialize Firebase Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || 'Creator',
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
        });
      } else {
        setUser(null);
      }
      if (initializing) setInitializing(false);
    });

    return unsubscribe; // Cleanup subscription on unmount
  }, [initializing]);

  // Handle Google Sign-in with Firebase Popup (Web Native)
  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      throw error;
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign out error', error);
    }
  };

  const resetUser = async () => {
    await logOut();
  };

  const value = useMemo(
    () => ({
      user,
      initializing,
      signInWithGoogle,
      logOut,
      resetUser
    }),
    [user, initializing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
