
'use client';

import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

import { auth, db } from '@/lib/firebase';

// Define the User type for your application
export interface User {
  uid: string;
  email: string | null;
  role: 'admin' | 'client';
  firstName: string;
  lastName: string;
  companyId?: string; // Add companyId to the user type
}

// Define the AuthContext state
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

// Create the context with a default undefined value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const isAuthenticated = !!user;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // If a Firebase user is authenticated
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          
          // Determine the user's role based on the 'isAdmin' field in Firestore
          const role = userData.isAdmin === true || userData.role === 'admin' ? 'admin' : 'client';

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: role,
            firstName: userData.firstName || 'User',
            lastName: userData.lastName || '',
            companyId: userData.companyId, // Set companyId from Firestore
          });
        } else {
          console.error(
            'No user document found for UID:',
            firebaseUser.uid,
            "This user will not have access to protected resources."
          );
          await firebaseSignOut(auth);
          setUser(null);
        }
      } else {
        // User is signed out
        setUser(null);
      }
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);
  
  const login = async (email: string, pass: string) => {
    setLoading(true);
    try {
        await signInWithEmailAndPassword(auth, email, pass);
        // onAuthStateChanged will handle setting the user state
        return true;
    } catch (error) {
        console.error("Login failed:", error);
        setLoading(false);
        return false;
    }
  }

  const logout = async () => {
    await firebaseSignOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
