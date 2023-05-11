import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import React, { createContext, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

// Firebase v9+: pull from .env
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

interface AuthContextValue {
  userId: string | null;
  signedIn: boolean;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  handleLogout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>(
  {} as AuthContextValue
);

interface Props {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: Props) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const app = initializeApp(firebaseConfig);

  const auth = getAuth(app);

  useEffect(() => {
    if (location.hostname === 'localhost') {
      connectAuthEmulator(auth, 'http://localhost:9099', {
        disableWarnings: true,
      });
    }

    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        setUserId(authUser.uid);
        setSignedIn(true);
        setLoading(false);
      } else {
        const localUserId = localStorage.getItem('localUserId');
        if (localUserId) {
          setUserId(localUserId);
        } else {
          const id = uuidv4();
          localStorage.setItem('localUserId', id);
          setUserId(id);
        }
        setSignedIn(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  // sign in with a Google popup
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      if (result) {
        // RUN THE FUNCTION TO LINK THE LOCAL ACCOUNT TO THE FIREBASE ACCOUNT
        // THEN WIPE THE LOCAL ACCOUNT
        const event = new CustomEvent('mergeAccounts', {
          detail: { localUserId: userId, remoteUserId: result.user.uid },
        });
        window.dispatchEvent(event);
        // localStorage.removeItem('localUserId');
        setUserId(result.user.uid);
        setSignedIn(true);
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        userId,
        signedIn,
        loading,
        signInWithGoogle,
        handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
