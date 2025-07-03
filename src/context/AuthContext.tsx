'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';

type User = {
  uid: string;
  email: string | null;
  role: 'admin' | 'client';
};

type AuthContextType = {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        const userEmail = fbUser.email || '';
        // Determine role based on email - this is a temporary measure
        const role = userEmail.toLowerCase() === 'rukoen@gmail.com' ? 'admin' : 'client';
        setUser({
          uid: fbUser.uid,
          email: fbUser.email,
          role: role
        });
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      router.push('/');
      return true;
    } catch (error) {
      console.error("Login failed:", error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  
  const isAuthenticated = !isLoading && !!user;

  return (
    <AuthContext.Provider value={{ user, firebaseUser, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
