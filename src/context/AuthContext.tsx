'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type User = {
  uid: string;
  email: string | null;
  role: 'admin' | 'client';
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

  useEffect(() => {
    // On initial load, check localStorage for a logged in user.
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      localStorage.removeItem('user');
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    let loggedInUser: User | null = null;
    if (email.toLowerCase() === 'rukoen@gmail.com' && pass === '50700Koen*') {
      loggedInUser = { uid: 'admin-user', email, role: 'admin' };
    } else if (email.toLowerCase() === 'ruanakoen@gmail.com' && pass === '50700Frikkie*') {
      loggedInUser = { uid: 'client-user', email, role: 'client' };
    }
    
    if (loggedInUser) {
      setUser(loggedInUser);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      router.push('/');
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    router.push('/login');
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
