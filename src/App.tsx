import { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import MapShell from './components/MapShell';
import HuariqueDetail from './components/HuariqueDetail';
import logoImage from './assets/HuariqueMap.png';
import loginImage from './assets/IniciasesionHuarique.png';
import registerImage from './assets/RegistrateHuariqueR.png';
import './App.css';

interface User {
  nombre: string;
  email?: string;
  token?: string | null;
  isLocal?: boolean;
}

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'map' | 'detail'>('landing');
  const [activeDetailHuarique, setActiveDetailHuarique] = useState<any | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // User Dropdown state for Map view
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Auth Modal tabs & state
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Form states
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');

  // Cargar usuario desde localStorage al montar
  useEffect(() => {
    const savedUser = localStorage.getItem('huarique_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error al parsear el usuario guardado', e);
      }
    }
  }, []);

  const navigateTo = (view: 'landing' | 'map' | 'detail') => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewDetail = (huarique: any) => {
    setActiveDetailHuarique(huarique);
    navigateTo('detail');
  };

  const toggleTheme = () => {
    const nextDark = !isDark;

    if (!document.startViewTransition) {
      setIsDark(nextDark);
      if (nextDark) {
        document.documentElement.classList.add('dark-theme');
      } else {
        document.documentElement.classList.remove('dark-theme');
      }
      return;
    }

    document.startViewTransition(() => {
      setIsDark(nextDark);
      if (nextDark) {
        document.documentElement.classList.add('dark-theme');
      } else {
        document.documentElement.classList.remove('dark-theme');
      }
    });
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    const apiUrl = import.meta.env.VITE_API_URL as string;

    if (isLoginMode) {
      // Iniciar Sesión (Login)
      try {
        const response = await fetch(`${apiUrl}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: authEmail, password: authPassword })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Credenciales incorrectas');
        }

        const data = await response.json();
        const loggedUser: User = {
          nombre: data.user.nombre,
          email: data.user.email,
          token: data.access_token,
          isLocal: false
        };
        setUser(loggedUser);
        localStorage.setItem('huarique_user', JSON.stringify(loggedUser));
        setShowAuthModal(false);
        setAuthEmail('');
        setAuthPassword('');
      } catch (err: any) {
        console.warn('Error en login, reintentando de forma local:', err);

        if (err.message && err.message !== 'Failed to fetch' && err.message !== 'Load failed') {
          setAuthError(err.message);
        } else {
          // Servidor apagado: Fallback local
          const mockUser: User = {
            nombre: authEmail.split('@')[0],
            email: authEmail,
            token: null,
            isLocal: true
          };
          setUser(mockUser);
          localStorage.setItem('huarique_user', JSON.stringify(mockUser));
          setShowAuthModal(false);
          setAuthEmail('');
          setAuthPassword('');
          alert('API NestJS no disponible. Sesión iniciada en Modo Local de respaldo.');
        }
      } finally {
        setAuthLoading(false);
      }
    } else {
      // Registrarse (Register)
      try {
        const response = await fetch(`${apiUrl}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ nombre: authName, email: authEmail, password: authPassword })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Error al registrar usuario');
        }

        const data = await response.json();

        // Loguear directamente tras registro
        const loggedUser: User = {
          nombre: data.nombre,
          email: data.email,
          token: null,
          isLocal: false
        };
        setUser(loggedUser);
        localStorage.setItem('huarique_user', JSON.stringify(loggedUser));
        setShowAuthModal(false);
        setAuthName('');
        setAuthEmail('');
        setAuthPassword('');
      } catch (err: any) {
        console.warn('Error en registro, reintentando de forma local:', err);

        if (err.message && err.message !== 'Failed to fetch' && err.message !== 'Load failed') {
          setAuthError(err.message);
        } else {
          // Servidor apagado: Fallback local
          const mockUser: User = {
            nombre: authName.trim(),
            email: authEmail,
            token: null,
            isLocal: true
          };
          setUser(mockUser);
          localStorage.setItem('huarique_user', JSON.stringify(mockUser));
          setShowAuthModal(false);
          setAuthName('');
          setAuthEmail('');
          setAuthPassword('');
          alert('API NestJS no disponible. Registrado en Modo Local de respaldo.');
        }
      } finally {
        setAuthLoading(false);
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('huarique_user');
  };

  const renderAuthModal = () => {
    if (!showAuthModal) return null;
    return (
      <div className="auth-modal-overlay" onClick={() => setShowAuthModal(false)}>
        <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
          <button className="auth-modal-close" onClick={() => setShowAuthModal(false)}>✕</button>

          <div className="auth-modal-image-container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
              <img src={logoImage} alt="Huarique Logo" style={{ height: '40px' }} />
              <h1 style={{ 
                margin: 0, 
                fontSize: '32px', 
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
            {/* Tabs */}
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
            <h3 style={{ fontFamily: 'Outfit, sans-serif', color: 'var(--peru-text-dark)', marginBottom: '15px' }}>
              {isLoginMode ? 'Ingresa a tu cuenta' : 'Crea tu cuenta gratis'}
            </h3>

            {authError && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              padding: '10px',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '15px',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}>
              ⚠️ {authError}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {!isLoginMode && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--form-label-color)' }}>Nombre Completo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Gastón Acurio"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1.5px solid var(--peru-border)',
                    background: 'var(--input-bg)',
                    color: 'var(--input-text)',
                    fontFamily: 'Outfit, sans-serif'
                  }}
                />
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--form-label-color)' }}>Correo Electrónico</label>
              <input
                type="email"
                required
                placeholder="Ej. gaston@huarique.pe"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid var(--peru-border)',
                  background: 'var(--input-bg)',
                  color: 'var(--input-text)',
                  fontFamily: 'Outfit, sans-serif'
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--form-label-color)' }}>Contraseña</label>
              <input
                type="password"
                required
                placeholder="Mínimo 6 caracteres"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1.5px solid var(--peru-border)',
                  background: 'var(--input-bg)',
                  color: 'var(--input-text)',
                  fontFamily: 'Outfit, sans-serif'
                }}
              />
            </div>
            <button
              type="submit"
              disabled={authLoading}
              style={{
                marginTop: '10px',
                padding: '12px',
                background: 'var(--peru-red)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: authLoading ? 'not-allowed' : 'pointer',
                transition: 'background 0.3s',
                fontFamily: 'Outfit, sans-serif',
                opacity: authLoading ? 0.7 : 1
              }}
              onMouseEnter={(e) => { if (!authLoading) e.currentTarget.style.backgroundColor = 'var(--peru-red-dark)'; }}
              onMouseLeave={(e) => { if (!authLoading) e.currentTarget.style.backgroundColor = 'var(--peru-red)'; }}
            >
              {authLoading ? 'Procesando...' : isLoginMode ? 'Iniciar Sesión' : 'Registrarse'}
            </button>
          </form>

          <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '13px' }}>
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

  return (
    <>
      {currentView === 'landing' ? (
        <LandingPage
          onNavigate={navigateTo}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          user={user}
          onAuthClick={() => setShowAuthModal(true)}
          onLogout={handleLogout}
        />
      ) : (
        <div style={{
          background: 'var(--map-bg)',
          height: 'calc(100vh / 0.85)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Componente MapShell con su Navbar Propia */}
          <header style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 24px',
            background: 'var(--peru-bg)',
            borderBottom: '1px solid var(--peru-border)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            zIndex: 1000
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <button
                onClick={() => navigateTo('landing')}
                style={{
                  background: 'var(--peru-white)',
                  border: '1px solid var(--peru-border-btn)',
                  color: 'var(--peru-text-dark)',
                  padding: '8px 18px',
                  borderRadius: '20px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: 'Outfit, sans-serif'
                }}
              >
                <span style={{ color: 'var(--peru-red)', fontSize: '18px' }}>←</span> Volver al Inicio
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <img src={logoImage} alt="Huarique Logo" style={{ height: '32px' }} />
              <h1 style={{ margin: 0, fontSize: '28px', color: 'var(--peru-text)', fontFamily: 'Pacifico, cursive', fontWeight: 'normal' }}>
                Huarique <span style={{ color: 'var(--peru-red)' }}>Map</span>
              </h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <button
                className="btn-theme-toggle"
                onClick={toggleTheme}
                title={isDark ? 'Modo Claro' : 'Modo Oscuro'}
                style={{
                  background: 'var(--peru-white)',
                  border: '1px solid var(--peru-border-btn)',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--peru-text-dark)',
                  cursor: 'pointer'
                }}
              >
                {isDark ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                )}
              </button>

              {user ? (
                <div style={{ position: 'relative' }}>
                  <span
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: 'var(--peru-text)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      userSelect: 'none',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      background: showUserDropdown ? 'rgba(255,255,255,0.1)' : 'transparent'
                    }}
                  >
                    Hola, {user.nombre} ▼
                  </span>

                  {showUserDropdown && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '8px',
                      backgroundColor: 'var(--peru-white)',
                      border: '1.5px solid var(--peru-border)',
                      borderRadius: '8px',
                      padding: '6px 0',
                      minWidth: '130px',
                      zIndex: 1000
                    }}>
                      <button
                        onClick={() => {
                          handleLogout();
                          setShowUserDropdown(false);
                        }}
                        style={{
                          padding: '8px 16px',
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--peru-text)',
                          textAlign: 'left',
                          width: '100%',
                          cursor: 'pointer'
                        }}
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  style={{
                    background: 'var(--peru-red-bright)',
                    border: 'none',
                    color: '#ffffff',
                    padding: '8px 20px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontFamily: 'Outfit, sans-serif'
                  }}
                >
                  Únete
                </button>
              )}
            </div>
          </header>

          {currentView === 'map' ? (
            <MapShell
              isConnected={isConnected}
              setIsConnected={setIsConnected}
              user={user}
              onAuthClick={() => setShowAuthModal(true)}
              onViewDetail={handleViewDetail}
            />
          ) : (
            activeDetailHuarique && (
              <HuariqueDetail
                huarique={activeDetailHuarique}
                onBack={() => navigateTo('map')}
                likesCount={15} // En el futuro se puede pasar el contador real de likes
                user={user}
                onAuthClick={() => setShowAuthModal(true)}
              />
            )
          )}
        </div>
      )}
      {renderAuthModal()}
    </>
  );
}

export default App;
