import React, { useState } from 'react';
import loginImage from '../assets/IniciasesionHuarique.png';
import registerImage from '../assets/RegistrateHuariqueR.png';
import { loginUser, registerUser, loginWithGoogle } from '../api/auth';
import { signInWithGoogle } from '../firebase-client';

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
        const res = await loginUser(authEmail, authPassword);
        onAuthSuccess({
          nombre: res.user?.nombre || 'Usuario',
          email: res.user?.email,
          token: res.access_token,
          uid: res.user?.id,
          rol: res.user?.rol || 'USER'
        });
      } else {
        const res = await registerUser(authName, authEmail, authPassword);
        onAuthSuccess({
          nombre: res.user?.nombre || authName,
          email: res.user?.email || authEmail,
          token: res.access_token,
          uid: res.user?.id,
          rol: res.user?.rol || 'USER'
        });
      }
    } catch (err: any) {
      setAuthError(err.message || (isLoginMode ? 'Error al autenticar' : 'Error al registrar usuario'));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      const result = await signInWithGoogle();
      // Intercambiar token de Firebase por token JWT de NestJS
      const res = await loginWithGoogle(result.token);
      onAuthSuccess({
        nombre: res.user?.nombre || result.user.displayName || 'Usuario',
        email: res.user?.email || result.user.email || undefined,
        token: res.access_token,
        uid: res.user?.id || result.user.uid,
        rol: res.user?.rol || 'USER'
      });
    } catch (err: any) {
      console.warn('Error al autenticar con Google en backend, usando sesión local:', err);
      setAuthError(err.message || 'Error al autenticar con Google en el servidor.');
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



            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px' }}>
              <span 
                onClick={() => { setIsLoginMode(!isLoginMode); setAuthError(null); }}
                style={{ color: 'var(--peru-red-bright)', cursor: 'pointer', fontWeight: '600' }}
              >
                {isLoginMode ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión aquí'}
              </span>
            </div>

            <div style={{ textAlign: 'center', marginTop: '20px', marginBottom: '20px', color: 'var(--peru-text)', fontSize: '14px' }}>
              o continúa con
            </div>

            <button 
              onClick={handleGoogleSignIn}
              disabled={authLoading}
              style={{
                width: '100%',
                padding: '12px',
                background: 'white',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                color: '#374151',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                fontFamily: 'Outfit, sans-serif',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: '20px', height: '20px' }} />
              Continuar con Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
