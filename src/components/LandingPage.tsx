import { useState, useEffect } from 'react';
import heroImage from '../assets/peruvian_cuisine_hero.png';
import cevicheImage from '../assets/ceviche_carretilla.png';
import anticuchosImage from '../assets/anticuchos_lima.png';
import characterImage from '../assets/ContactoHuarique.png';
import logoImage from '../assets/HuariqueMap.png';
import './LandingPage.css';

interface LandingPageProps {
  onNavigate: (view: 'landing' | 'map') => void;
  isDark: boolean;
  onToggleTheme: () => void;
  user: { nombre: string } | null;
  onAuthClick: () => void;
  onLogout: () => void;
}

export default function LandingPage({ onNavigate, isDark, onToggleTheme, user, onAuthClick, onLogout }: LandingPageProps) {
  // Estado para el menú hamburguesa
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Estado para el menú desplegable del perfil del usuario
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Estados para el buzón de sugerencias
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeSection, setActiveSection] = useState('inicio');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.3 }
    );

    const sections = ['inicio', 'concepto', 'restaurantes', 'sugerencias'];
    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSuggestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nombre && correo && descripcion) {
      console.log('Sugerencia enviada:', { nombre, correo, descripcion });
      setIsSubmitted(true);

      setTimeout(() => {
        setNombre('');
        setCorreo('');
        setDescripcion('');
        setIsSubmitted(false);
      }, 5000);
    }
  };

  const popularRestaurants = [
    {
      id: 1,
      nombre: 'El Ceviche de Pedro',
      tipoComida: 'Marina',
      descripcion: 'Ceviche clásico de carretilla preparado al momento con pesca fresca del día, abundante limón piurano y choclo desgranado.',
      imagen: cevicheImage,
      horario: 'Mar - Dom: 11:00 AM - 4:30 PM',
      ubicacion: 'Chorrillos, Lima',
    },
    {
      id: 2,
      nombre: 'Anticuchos del Puente',
      tipoComida: 'Criolla',
      descripcion: 'Tradicionales brochetas de corazón a la parrilla marinados en ají panca y especias, acompañados de papas doradas y choclo tierno.',
      imagen: anticuchosImage,
      horario: 'Lun - Sáb: 6:00 PM - 11:30 PM',
      ubicacion: 'Barranco, Lima',
    },
    {
      id: 3,
      nombre: 'El Rinconcito Lomeño',
      tipoComida: 'Fusión / Criolla',
      descripcion: 'Especialistas en lomo saltado ahumado al wok con cebolla crujiente, tomates jugosos y papas nativas amarillas fritas al instante.',
      imagen: heroImage,
      horario: 'Lun - Dom: 12:00 PM - 10:00 PM',
      ubicacion: 'Centro de Lima',
    },
  ];

  return (
    <div className="landing-container">
      {/* Navigation Bar */}
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
            <span className={`nav-link ${activeSection === 'restaurantes' ? 'active' : ''}`} onClick={() => scrollToSection('restaurantes')}>Restaurantes</span>
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
                    fontFamily: 'var(--font-sans)'
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
              <span className={`nav-link-mobile ${activeSection === 'restaurantes' ? 'active' : ''}`} onClick={() => { scrollToSection('restaurantes'); setIsMenuOpen(false); }}>
                Restaurantes
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

      {/* Hero Section */}
      <section id="inicio" className="hero-section">
        <div className="section-container hero-container-inner">
          <div className="hero-content">
            <span className="hero-tagline">Orgullo y Tradición Gastronómica</span>
            <h1 className="hero-title">
              Descubre el verdadero sabor peruano
              <span className="hero-flag-phrase">
                <span className="flag-red">unidos</span>{' '}
                <span className="flag-white">por la</span>{' '}
                <span className="flag-red">comida</span>
              </span>
            </h1>
            <p className="hero-desc">
              Encuentra y comparte los "Huariques" más emblemáticos de tu zona.
              Esos rincones ocultos cargados de historia, tradición, sazón y la pasión
              que une a todo el Perú en una sola mesa.
            </p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={() => onNavigate('map')}>
                Explorar Mapa Interactivo
              </button>
              <button className="btn-secondary" onClick={() => scrollToSection('concepto')}>
                Conocer el Proyecto
              </button>
            </div>
          </div>
          <div className="hero-image-wrapper">
            <div className="hero-image-glow"></div>
            <img
              src={heroImage}
              alt="Deliciosa comida peruana: Ceviche y Lomo Saltado"
              className="hero-image"
            />
          </div>
        </div>
      </section>

      {/* Concept / Identity Section (White Themed - Peruvian Flag concept) */}
      <section id="concepto" className="concept-section">
        <div className="section-container">
          {/* Centered Headings */}
          <div style={{ textAlign: 'center', marginBottom: '50px' }}>
            <span className="section-tag" style={{ margin: '0 auto 20px auto' }}>Nuestra Identidad</span>
            <h2 className="section-title" style={{ border: 'none', margin: '0' }}>
              <span className="hero-flag-phrase" style={{ fontSize: 'clamp(35px, 5vw, 55px)', marginTop: '0' }}>
                <span className="flag-red">¿Qué nos</span>{' '}
                <span className="flag-white">une como</span>{' '}
                <span className="flag-red">Peruanos?</span>
              </span>
            </h2>
          </div>

          <div className="concept-layout">
            <div className="concept-left">
              <div className="concept-grid">
                <div className="concept-card">
                  <h3 className="concept-card-title">El Concepto de "Huarique"</h3>
                  <p className="concept-card-desc">
                    Un huarique no es solo un restaurante; es un templo del sabor. Son lugares
                    tradicionales, a menudo discretos y familiares, reconocidos de boca en boca por
                    servir porciones generosas y una sazón inigualable.
                  </p>
                </div>

                <div className="concept-card concept-card-middle">
                  <h3 className="concept-card-title">Identidad Patriótica</h3>
                  <p className="concept-card-desc">
                    La gastronomía es el hilo conductor de nuestra historia. Costa, Sierra y Selva
                    se entrelazan a través de ingredientes autóctonos como el ají amarillo, el limón
                    y el maíz, creando platos que representan nuestra bandera y orgullo.
                  </p>
                </div>

                <div className="concept-card">
                  <h3 className="concept-card-title">Comunidad y Cultura</h3>
                  <p className="concept-card-desc">
                    Este mapa interactivo está diseñado para registrar, valorar y mantener viva la
                    cultura de la carretilla, el huarique marino y la picantería. Un espacio hecho
                    por peruanos, para el mundo.
                  </p>
                </div>
              </div>
            </div>

            <div className="concept-right">
              <img src={logoImage} alt="HuariqueMap Gran Logo" className="concept-logo-large" />
            </div>
          </div>
        </div>
      </section>

      {/* Patriotic Banner */}
      <section className="patriotic-banner">
        <div className="section-container">
          <h2 className="banner-title">La comida que nos une</h2>
          <p className="banner-desc">
            Desde un ceviche al paso en una carretilla hasta el lomo saltado más tradicional del centro histórico,
            cada huarique cuenta una historia de esfuerzo, unión y amor por nuestra tierra.
          </p>
        </div>
      </section>

      {/* Popular Restaurants Section */}
      <section id="restaurantes" className="restaurants-section">
        <div className="section-container">
          <span className="section-tag">Recomendaciones</span>
          <h2 className="section-title">Restaurantes Populares</h2>
          <p className="restaurants-section-desc">
            Una selección de huariques tradicionales muy queridos por la comunidad.
            Explora su sabor único antes de ver su ubicación geoespacial en el mapa.
          </p>

          <div className="restaurants-grid">
            {popularRestaurants.map((res) => (
              <div key={res.id} className="restaurant-card">
                <div className="restaurant-img-wrapper">
                  <img src={res.imagen} alt={res.nombre} className="restaurant-img" />
                </div>
                <div className="restaurant-card-body">
                  <div className="restaurant-card-header">
                    <h3 className="restaurant-card-title">{res.nombre}</h3>
                    <span className="huarique-tag" style={{ margin: 0 }}>{res.tipoComida}</span>
                  </div>
                  <p className="restaurant-card-desc">{res.descripcion}</p>
                  <div className="restaurant-card-footer">
                    <span>Horario: {res.horario}</span>
                    <span>Ubicación: {res.ubicacion}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Suggestions Box Section */}
      <section id="sugerencias" className="suggestions-section">
        <div className="section-container">
          <span className="section-tag">Participa</span>
          <h2 className="section-title">Buzón de Sugerencias</h2>

          <div className="suggestions-container-grid">
            {/* Left Column: Image for suggestion box */}
            <div className="suggestions-image-column">
              <img
                src={characterImage}
                alt="Contacto Huarique"
                className="suggestions-image"
              />
            </div>

            {/* Right Column: Suggestions Card & Form */}
            <div className="suggestions-form-column">
              <div className="suggestions-card">
                <h3 className="suggestions-title">Recomienda un Huarique</h3>
                <p className="suggestions-desc">
                  ¿Conoces algún rincón culinario secreto que merezca estar en el mapa?
                  Escríbenos y ayúdanos a expandir nuestra comunidad de sabor.
                </p>

                {isSubmitted ? (
                  <div className="success-message">
                    ¡Gracias por tu recomendación! Analizaremos el huarique sugerido para agregarlo pronto al mapa interactivo.
                  </div>
                ) : (
                  <form onSubmit={handleSuggestionSubmit}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="nombre">Nombre Completo</label>
                      <input
                        type="text"
                        id="nombre"
                        className="form-input"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        required
                        placeholder="Ej. Juan Pérez"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="correo">Correo Electrónico</label>
                      <input
                        type="email"
                        id="correo"
                        className="form-input"
                        value={correo}
                        onChange={(e) => setCorreo(e.target.value)}
                        required
                        placeholder="Ej. juan@correo.com"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label" htmlFor="descripcion">Detalles del Huarique (Nombre, especialidad, dirección)</label>
                      <textarea
                        id="descripcion"
                        className="form-textarea"
                        value={descripcion}
                        onChange={(e) => setDescripcion(e.target.value)}
                        required
                        placeholder="Ej. Cevichería El Primo en Surquillo, Jr. Dante 420. Recomiendo el ceviche de pota."
                      ></textarea>
                    </div>

                    <button type="submit" className="btn-submit">
                      Enviar Sugerencia
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Improved 3-Column Footer */}
      <footer className="footer">
        <div className="section-container">
          <div className="footer-grid">
            {/* Left Column: Logo and Info */}
            <div className="footer-col">
              <a href="#" className="footer-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={(e) => { e.preventDefault(); scrollToSection('inicio'); }}>
                <img src={logoImage} alt="HuariqueMap Logo" style={{ height: '65px', objectFit: 'contain', marginBottom: '15px' }} />
                Huarique<span>Map</span>
              </a>
              <p className="footer-info-text">
                Conectando a los amantes de la buena comida con los rincones culinarios más emblemáticos
                y tradicionales del Perú. Promovemos el turismo gastronomómico local de forma gratuita.
              </p>
            </div>

            {/* Middle Column: Site Map */}
            <div className="footer-col">
              <h3 className="footer-col-title">Mapa del Sitio</h3>
              <ul className="footer-links">
                <li>
                  <span className="footer-link-item" onClick={() => scrollToSection('inicio')}>
                    Inicio
                  </span>
                </li>
                <li>
                  <span className="footer-link-item" onClick={() => scrollToSection('concepto')}>
                    Nuestra historia
                  </span>
                </li>
                <li>
                  <span className="footer-link-item" onClick={() => scrollToSection('restaurantes')}>
                    Te brindamos
                  </span>
                </li>
              </ul>
            </div>

            {/* Right Column: Contact Details */}
            <div className="footer-col">
              <h3 className="footer-col-title">Contacto</h3>
              <div className="footer-contact-info">
                <div className="footer-contact-item">
                  <span className="footer-contact-label">Línea de Atención</span>
                  <span className="footer-contact-value">+51 999 888 777</span>
                </div>
                <div className="footer-contact-item">
                  <span className="footer-contact-label">Correo de Soporte</span>
                  <span className="footer-contact-value">contacto@huariquemap.pe</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bottom copyright */}
          <div className="footer-bottom">
            <p>© 2026 HuariqueMap. Creado con orgullo en Perú. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
