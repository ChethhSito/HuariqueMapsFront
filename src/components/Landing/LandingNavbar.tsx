import { useState } from 'react';
import logoImage from '../../assets/HuariqueMap.png';

interface LandingNavbarProps {
  activeSection: string;
  scrollToSection: (id: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  user: any;
  onAuthClick: () => void;
  onLogout: () => void;
  onNavigate: (view: 'landing' | 'map' | 'admin') => void;
}

export default function LandingNavbar({
  activeSection,
  scrollToSection,
  isDark,
  onToggleTheme,
  user,
  onAuthClick,
  onLogout,
  onNavigate
}: LandingNavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
      <nav className="navbar">
        <div className="navbar-container">
          <a href="#" className="nav-logo" onClick={(e) => { e.preventDefault(); scrollToSection('inicio'); setIsMenuOpen(false); }}>
            <img src={logoImage} alt="HuariqueMap Logo" style={{ height: '60px', objectFit: 'contain' }} />
            Huarique<span>Map</span>
          </a>

          {/* Hamburger Toggle Button for mobile and tablets */}
          <button
            className="btn-hamburger"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {isMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </>
              )}
            </svg>
          </button>

          {/* Desktop links */}
          <div className="nav-links">
            <span className={`nav-link ${activeSection === 'concepto' ? 'active' : ''}`} onClick={() => scrollToSection('concepto')}>Identidad</span>
            <span className={`nav-link ${activeSection === 'uso' ? 'active' : ''}`} onClick={() => scrollToSection('uso')}>¿Cómo funciona?</span>
            <span className={`nav-link ${activeSection === 'restaurantes' ? 'active' : ''}`} onClick={() => scrollToSection('restaurantes')}>Huariques Populares</span>
            <span className={`nav-link ${activeSection === 'sugerencias' ? 'active' : ''}`} onClick={() => scrollToSection('sugerencias')}>Sugerencias</span>
          </div>

          {/* Desktop auth */}
          <div className="navbar-auth">
            <button
              className="btn-theme-toggle"
              onClick={onToggleTheme}
              title={isDark ? 'Modo Claro' : 'Modo Oscuro'}
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
                    padding: '8px 14px',
                    borderRadius: '8px',
                    background: showUserDropdown ? 'var(--peru-red-light)' : 'transparent',
                    transition: 'all 0.2s',
                    fontFamily: 'var(--font-sans)',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => { if (!showUserDropdown) e.currentTarget.style.background = 'var(--peru-red-light)'; }}
                  onMouseLeave={(e) => { if (!showUserDropdown) e.currentTarget.style.background = 'transparent'; }}
                >
                  Hola, {user.nombre} <span style={{ fontSize: '10px' }}>▼</span>
                </span>

                {showUserDropdown && (
                  <>
                    {/* Backdrop to close dropdown */}
                    <div
                      onClick={() => setShowUserDropdown(false)}
                      style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 999,
                        background: 'transparent'
                      }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '8px',
                      backgroundColor: 'var(--peru-white)',
                      border: '1.5px solid var(--peru-border)',
                      borderRadius: '8px',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                      padding: '6px 0',
                      minWidth: '130px',
                      zIndex: 1000,
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      {user?.rol === 'ADMIN' && (
                        <button
                          onClick={() => {
                            onNavigate('admin');
                            setShowUserDropdown(false);
                          }}
                          style={{
                            padding: '8px 16px',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--peru-red-bright)',
                            fontWeight: 'bold',
                            textAlign: 'left',
                            fontSize: '13px',
                            cursor: 'pointer',
                            fontFamily: 'var(--font-sans)',
                            width: '100%',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--peru-red-light)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                        >
                          Panel Admin
                        </button>
                      )}
                      <button
                        onClick={() => {
                          onLogout();
                          setShowUserDropdown(false);
                        }}
                        style={{
                          padding: '8px 16px',
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--peru-text)',
                          textAlign: 'left',
                          fontSize: '13px',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-sans)',
                          width: '100%',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--peru-red-light)';
                          e.currentTarget.style.color = 'var(--peru-red-bright)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--peru-text)';
                        }}
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <button className="btn-join" onClick={onAuthClick}>
                Únete
              </button>
            )}

            <button className="btn-nav-map" onClick={() => onNavigate('map')}>
              Ver Mapa Interactivo
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation Menu Drawer */}
        {isMenuOpen && (
          <div className="nav-menu-mobile">
            <div className="section-container" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <span className={`nav-link-mobile ${activeSection === 'inicio' ? 'active' : ''}`} onClick={() => { scrollToSection('inicio'); setIsMenuOpen(false); }}>
                Inicio
              </span>
              <span className={`nav-link-mobile ${activeSection === 'concepto' ? 'active' : ''}`} onClick={() => { scrollToSection('concepto'); setIsMenuOpen(false); }}>
                Identidad
              </span>
              <span className={`nav-link-mobile ${activeSection === 'uso' ? 'active' : ''}`} onClick={() => { scrollToSection('uso'); setIsMenuOpen(false); }}>
                ¿Cómo funciona?
              </span>
              <span className={`nav-link-mobile ${activeSection === 'restaurantes' ? 'active' : ''}`} onClick={() => { scrollToSection('restaurantes'); setIsMenuOpen(false); }}>
                Huariques Populares
              </span>
              <span className={`nav-link-mobile ${activeSection === 'sugerencias' ? 'active' : ''}`} onClick={() => { scrollToSection('sugerencias'); setIsMenuOpen(false); }}>
                Sugerencias
              </span>
              <div className="navbar-auth-mobile">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '10px 0' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--peru-text-dark)' }}>Tema</span>
                  <button
                    className="btn-theme-toggle"
                    onClick={onToggleTheme}
                    title={isDark ? 'Modo Claro' : 'Modo Oscuro'}
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
                </div>
                <div className="mobile-auth-buttons">
                  {user ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', marginBottom: '10px' }}>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--peru-text-dark)', textAlign: 'center', fontFamily: 'var(--font-sans)' }}>
                        Hola, {user.nombre}
                      </span>
                      <button
                        className="btn-join-2"
                        style={{
                          backgroundColor: 'transparent',
                          border: '1.5px solid var(--peru-red-bright)',
                          color: 'var(--peru-red-bright)'
                        }}
                        onClick={() => { onLogout(); setIsMenuOpen(false); }}
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  ) : (
                    <button className="btn-join-2" onClick={() => { onAuthClick(); setIsMenuOpen(false); }}>
                      Únete
                    </button>
                  )}
                  <button className="btn-nav-map-2" onClick={() => { onNavigate('map'); setIsMenuOpen(false); }}>
                    Ver Mapa Interactivo
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
  );
}
