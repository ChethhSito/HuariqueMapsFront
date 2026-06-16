import { useState } from 'react';
import LandingPage from './components/LandingPage';
import MapShell from './components/MapShell';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'map'>('landing');
  const [isDark, setIsDark] = useState(false);

  const navigateTo = (view: 'landing' | 'map') => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  };

  return (
    <>
      {currentView === 'landing' ? (
        <LandingPage 
          onNavigate={navigateTo} 
          isDark={isDark} 
          onToggleTheme={toggleTheme} 
        />
      ) : (
        <div style={{ 
          background: 'var(--map-bg)', 
          minHeight: '100vh', 
          padding: '20px 3%',
          transition: 'background 0.3s ease'
        }}>
          <header style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '30px' 
          }}>
            <button 
              onClick={() => navigateTo('landing')}
              style={{
                background: 'var(--peru-white)',
                border: '1.5px solid var(--peru-border-btn)',
                color: 'var(--peru-text-dark)',
                padding: '10px 22px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                fontFamily: 'Outfit, sans-serif'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--peru-red-bright)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--peru-white)';
                e.currentTarget.style.color = 'var(--peru-text-dark)';
              }}
            >
              ← Volver al Inicio
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
              <button 
                onClick={toggleTheme}
                className="btn-theme-toggle"
                style={{
                  border: '1.5px solid var(--peru-border-btn)',
                  padding: '10px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--peru-white)',
                  color: 'var(--peru-text-dark)',
                  transition: 'all 0.3s ease'
                }}
              >
                {isDark ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                  </svg>
                )}
              </button>
              
              <span style={{ 
                fontFamily: 'Pacifico, cursive', 
                fontSize: '26px', 
                color: 'var(--peru-text-dark)',
                transition: 'color 0.3s ease'
              }}>
                Huarique<span style={{ color: 'var(--peru-red-bright)' }}>Map</span>
              </span>
            </div>
          </header>
          <MapShell />
        </div>
      )}
    </>
  );
}

export default App;
