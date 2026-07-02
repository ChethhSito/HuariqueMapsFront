import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { auth } from '../config/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { loginWithGoogle } from '../api/auth';

export interface User {
  nombre: string;
  email?: string;
  token?: string | null;
  uid?: string;
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
    // 1. Check if there is a regular backend session
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
        // Solo intercambiar si no hay una sesión activa de backend almacenada
        if (!localStorage.getItem('user_session')) {
          try {
            const firebaseToken = await firebaseUser.getIdToken();
            const res = await loginWithGoogle(firebaseToken);
            const userData = {
              nombre: res.user?.nombre || firebaseUser.displayName || 'Usuario',
              email: res.user?.email || firebaseUser.email || undefined,
              token: res.access_token,
              uid: res.user?.id || firebaseUser.uid,
              rol: res.user?.rol || 'USER'
            };
            setUser(userData);
            localStorage.setItem('user_session', JSON.stringify(userData));
          } catch (err) {
            console.error('Error al intercambiar token de Firebase con NestJS:', err);
          }
        }
      } else {
        if (!localStorage.getItem('user_session')) {
          setUser(null);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const login = (userData: User) => {
    localStorage.setItem('user_session', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
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
