
'use client';

import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignout,
  setPersistence,
  browserSessionPersistence,
  browserLocalPersistence
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
import { useRouter } from 'next/navigation';

// Define the User type for your application
export interface User {
  uid: string;
  email: string | null;
  role: 'admin' | 'client';
  firstName: string;
  lastName: string;
  companyName?: string;
}

// Define the AuthContext state
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string, rememberMe?: boolean) => Promise<boolean>;
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
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                const role = userData.role === 'admin' ? 'admin' : 'client';
                
                setUser({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    role: role,
                    firstName: userData.firstName || 'User',
                    lastName: userData.lastName || '',
                    companyName: userData.companyName || '',
                });
            } else {
                console.warn('No user document found for UID:', firebaseUser.uid);
                await firebaseSignout(auth);
                setUser(null);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
            await firebaseSignout(auth);
            setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  const login = async (email: string, pass: string, rememberMe = false) => {
    setLoading(true);
    try {
        const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
        await setPersistence(auth, persistence);
        await signInWithEmailAndPassword(auth, email, pass);
        // onAuthStateChanged will handle setting the user state.
        return true;
    } catch (error: any) {
        console.error("Login failed:", error.message);
        setLoading(false);
        return false;
    }
  }

  const logout = async () => {
    await firebaseSignout(auth);
    setUser(null); // Clear local user state
    router.push('/login'); // Redirect to login page
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
