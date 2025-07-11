
'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { functions } from '@/lib/firebase-functions';
import { httpsCallable } from 'firebase/functions';

type User = {
  uid: string;
  email: string | null;
  role: 'admin' | 'client';
  firstName: string;
  lastName: string;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in, get their custom data from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          // *** FIX: Explicitly check for the admin email to assign the correct role ***
          const userRole = firebaseUser.email === 'rukoen@gmail.com' ? 'admin' : userData.role || 'client';
          
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: userRole,
            firstName: userData.firstName || 'User',
            lastName: userData.lastName || '',
          });
        } else {
          // No user document found, could be the primary admin before onboarding existed.
          if (firebaseUser.email === 'rukoen@gmail.com') {
             setUser({
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                role: 'admin',
                firstName: 'Admin',
                lastName: 'User',
             });
          } else {
            console.error("No user document found for UID:", firebaseUser.uid);
            await signOut(auth);
            setUser(null);
          }
        }
      } else {
        // User is signed out
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
      // onAuthStateChanged will handle setting user state and routing.
      return true;
    } catch (error) {
      console.error('Firebase login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    await signOut(auth);
    setUser(null);
    router.push('/login');
    // After logout, onAuthStateChanged will set isLoading to false.
  };
  
  const isAuthenticated = !isLoading && !!user;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
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
