import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { auth } from '../config/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';

export interface User {
  nombre: string;
  email?: string;
  token?: string | null;
  uid?: string;
  isLocal?: boolean;
  rol?: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // 1. Check if there is a mock session first
    const savedMockUser = localStorage.getItem('mock_user_session');
    if (savedMockUser) {
      try {
        setUser(JSON.parse(savedMockUser));
        return;
      } catch (e) {
        localStorage.removeItem('mock_user_session');
      }
    }

    // 2. Check if there is a regular backend session
    const savedUser = localStorage.getItem('user_session');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        return;
      } catch (e) {
        localStorage.removeItem('user_session');
      }
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        const userData = {
          nombre: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario',
          email: firebaseUser.email || undefined,
          token: token,
          uid: firebaseUser.uid
        };
        setUser(userData);
        localStorage.setItem('user_session', JSON.stringify(userData));
      } else {
        if (!localStorage.getItem('mock_user_session') && !localStorage.getItem('user_session')) {
          setUser(null);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const login = (userData: User) => {
    if (userData.isLocal) {
      localStorage.setItem('mock_user_session', JSON.stringify(userData));
    } else {
      localStorage.setItem('user_session', JSON.stringify(userData));
    }
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('mock_user_session');
    localStorage.removeItem('user_session');
    firebaseSignOut(auth).then(() => {
      setUser(null);
      window.location.reload();
    }).catch(() => {
      setUser(null);
      window.location.reload();
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
