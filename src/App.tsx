import { useState } from 'react';
import LandingPage from './pages/LandingPage';
import { useAuth } from './context/AuthContext';
import MapShell from './pages/MapShell';
import HuariqueDetail from './components/HuariqueDetail';
import logoImage from './assets/HuariqueMap.png';
import AuthModal from './components/AuthModal';
import './App.css';


function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'map' | 'detail'>('landing');
  const [activeDetailHuarique, setActiveDetailHuarique] = useState<any | null>(null);
  const [isDark, setIsDark] = useState(false);
  const { user, login, logout } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // User Dropdown state for Map view
  const [showUserDropdown, setShowUserDropdown] = useState(false);

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

  const handleAuthSuccess = (userData: any) => {
    login(userData);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    logout();
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
      <AuthModal show={showAuthModal} onClose={() => setShowAuthModal(false)} onAuthSuccess={handleAuthSuccess} />
    </>
  );
}

export default App;
