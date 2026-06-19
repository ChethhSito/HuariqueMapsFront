import React, { useState } from 'react';
import loginImage from '../assets/IniciasesionHuarique.png';
import registerImage from '../assets/RegistrateHuariqueR.png';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

interface AuthModalProps {
  show: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ show, onClose, onAuthSuccess }) => {
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  if (!show) return null;

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      if (isLoginMode) {
        const userCredential = await signInWithEmailAndPassword(auth, authEmail, authPassword);
        const firebaseUser = userCredential.user;
        const token = await firebaseUser.getIdToken();
        onAuthSuccess({
          nombre: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario',
          email: firebaseUser.email || undefined,
          token: token,
          uid: firebaseUser.uid
        });
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, authEmail, authPassword);
        const firebaseUser = userCredential.user;
        
        await updateProfile(firebaseUser, {
          displayName: authName
        });

        const token = await firebaseUser.getIdToken();
        onAuthSuccess({
          nombre: authName,
          email: firebaseUser.email || undefined,
          token: token,
          uid: firebaseUser.uid
        });
      }
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || 'Error de autenticación');
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose}>✕</button>

        <div className="auth-modal-image-container">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px', marginTop: '30px' }}>
            <h1 style={{ 
              margin: 0, 
              fontSize: '48px', 
              color: 'var(--peru-text)', 
              fontFamily: 'Pacifico, cursive', 
              fontWeight: 'normal',
              textAlign: 'center'
            }}>
              Huarique <span style={{ color: 'var(--peru-red)' }}>Map</span>
            </h1>
          </div>
          <img 
            key={isLoginMode ? 'login' : 'register'}
            className="fade-in-scale"
            src={isLoginMode ? loginImage : registerImage} 
            alt={isLoginMode ? "Iniciar Sesión" : "Registrarse"} 
          />
        </div>

        <div className="auth-modal-form-container">
          <div style={{ display: 'flex', borderBottom: '1px solid var(--peru-border)', marginBottom: '20px' }}>
            <button
              onClick={() => { setIsLoginMode(false); setAuthError(null); }}
              style={{
                flex: 1,
                padding: '10px',
                background: 'transparent',
                border: 'none',
                borderBottom: !isLoginMode ? '3px solid var(--peru-red)' : 'none',
                fontWeight: !isLoginMode ? 'bold' : 'normal',
                color: !isLoginMode ? 'var(--peru-text-dark)' : 'var(--peru-text)',
                cursor: 'pointer',
                fontFamily: 'Outfit, sans-serif'
              }}
            >
              Registrarse
            </button>
            <button
              onClick={() => { setIsLoginMode(true); setAuthError(null); }}
              style={{
                flex: 1,
                padding: '10px',
                background: 'transparent',
                border: 'none',
                borderBottom: isLoginMode ? '3px solid var(--peru-red)' : 'none',
                fontWeight: isLoginMode ? 'bold' : 'normal',
                color: isLoginMode ? 'var(--peru-text-dark)' : 'var(--peru-text)',
                cursor: 'pointer',
                fontFamily: 'Outfit, sans-serif'
              }}
            >
              Iniciar Sesión
            </button>
          </div>

          <div key={isLoginMode ? 'login-form' : 'register-form'} className="fade-in-slide">
            <h2 style={{ fontSize: '24px', marginBottom: '20px', color: 'var(--peru-red)' }}>
              {isLoginMode ? 'Ingresa a tu cuenta' : 'Crea tu cuenta gratis'}
            </h2>
            
            {authError && (
              <div style={{ padding: '10px', background: '#fee2e2', color: '#b91c1c', borderRadius: '8px', marginBottom: '15px', fontSize: '14px' }}>
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {!isLoginMode && (
                <div className="input-group">
                  <label>Nombre Completo</label>
                  <input 
                    type="text" 
                    placeholder="Ej. Gastón Acurio" 
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    required 
                  />
                </div>
              )}
              
              <div className="input-group">
                <label>Correo Electrónico</label>
                <input 
                  type="email" 
                  placeholder="tucorreo@ejemplo.com" 
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  required 
                />
              </div>

              <div className="input-group">
                <label>Contraseña</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  required 
                />
              </div>

              <button 
                type="submit" 
                className="btn-primary" 
                style={{ width: '100%', marginTop: '10px', display: 'flex', justifyContent: 'center' }}
                disabled={authLoading}
              >
                {authLoading ? 'Cargando...' : (isLoginMode ? 'Iniciar Sesión' : 'Registrarse')}
              </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', margin: '15px 0' }}>
              <hr style={{ flex: 1, border: 'none', borderTop: '1px dashed var(--peru-border)', opacity: 0.3 }} />
              <span style={{ padding: '0 10px', fontSize: '12px', color: 'var(--peru-text)', opacity: 0.6 }}>O también</span>
              <hr style={{ flex: 1, border: 'none', borderTop: '1px dashed var(--peru-border)', opacity: 0.3 }} />
            </div>

            <button 
              type="button" 
              onClick={() => {
                onAuthSuccess({
                  nombre: authName.trim() || (isLoginMode ? "Gastón Acurio" : "Visitante Local"),
                  email: authEmail.trim() || "demo@huariquemap.com",
                  token: "mock-session-token",
                  uid: "mock-uid-" + Date.now(),
                  isLocal: true
                });
              }}
              className="btn-secondary" 
              style={{ 
                width: '100%', 
                display: 'flex', 
                justifyContent: 'center', 
                borderColor: 'var(--peru-red)', 
                color: 'var(--peru-red)',
                padding: '10px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                fontFamily: 'Outfit, sans-serif'
              }}
            >
              Entrar en Modo Demostración (Simulado)
            </button>

            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
              <span 
                onClick={() => { setIsLoginMode(!isLoginMode); setAuthError(null); }}
                style={{ color: 'var(--peru-red-bright)', cursor: 'pointer', fontWeight: '600' }}
              >
                {isLoginMode ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión aquí'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
