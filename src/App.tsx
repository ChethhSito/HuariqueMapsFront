import { useState } from 'react';
import LandingPage from './components/LandingPage';
import MapShell from './components/MapShell';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'map'>('landing');

  const navigateTo = (view: 'landing' | 'map') => {
    setCurrentView(view);
    // Desplazarse al inicio de la página al cambiar de vista
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {currentView === 'landing' ? (
        <LandingPage onNavigate={navigateTo} />
      ) : (
        <div style={{ background: '#0b0f19', minHeight: '100vh', padding: '20px 3%' }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <button 
              onClick={() => navigateTo('landing')}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#e2e8f0',
                padding: '10px 22px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s',
                fontFamily: 'Outfit, sans-serif'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#c8272f';
                e.currentTarget.style.borderColor = '#d42932';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              ← Volver al Inicio
            </button>
            <span style={{ fontFamily: 'Pacifico, cursive', fontSize: '26px', color: '#ffffff' }}>
              🇵🇪 Huarique<span style={{ color: '#d42932' }}>Map</span>
            </span>
          </header>
          <MapShell />
        </div>
      )}
    </>
  );
}

export default App;
