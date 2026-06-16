import { useState } from 'react';
import heroImage from '../assets/peruvian_cuisine_hero.png';
import cevicheImage from '../assets/ceviche_carretilla.png';
import anticuchosImage from '../assets/anticuchos_lima.png';
import './LandingPage.css';

interface LandingPageProps {
  onNavigate: (view: 'landing' | 'map') => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export default function LandingPage({ onNavigate, isDark, onToggleTheme }: LandingPageProps) {
  // Estados para el buzón de sugerencias
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

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

  const handleAuthAction = () => {
    alert('Funcionalidad de registro e inicio de sesión simulada con el botón Únete.');
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
        <a href="#" className="nav-logo" onClick={() => scrollToSection('inicio')}>
          Huarique<span>Map</span>
        </a>
        <div className="nav-links">
          <span className="nav-link" onClick={() => scrollToSection('inicio')}>Inicio</span>
          <span className="nav-link" onClick={() => scrollToSection('concepto')}>Identidad</span>
          <span className="nav-link" onClick={() => scrollToSection('restaurantes')}>Restaurantes</span>
          <span className="nav-link" onClick={() => scrollToSection('sugerencias')}>Sugerencias</span>
        </div>
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
          
          <button className="btn-join" onClick={handleAuthAction}>
            Únete
          </button>
          <button className="btn-nav-map" onClick={() => onNavigate('map')}>
            Ver Mapa Interactivo
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="inicio" className="hero-section">
        <div className="hero-content">
          <span className="hero-tagline">Orgullo y Tradición Gastronómica</span>
          <h1 className="hero-title">
            Descubre el verdadero sabor peruano
            <span>unidos por la comida</span>
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
      </section>

      {/* Concept / Identity Section (White Themed - Peruvian Flag concept) */}
      <section id="concepto" className="concept-section">
        <span className="section-tag">Nuestra Identidad</span>
        <h2 className="section-title">¿Qué nos une como Peruanos?</h2>
        
        <div className="concept-grid">
          <div className="concept-card">
            <h3 className="concept-card-title">El Concepto de "Huarique"</h3>
            <p className="concept-card-desc">
              Un huarique no es solo un restaurante; es un templo del sabor. Son lugares 
              tradicionales, a menudo discretos y familiares, reconocidos de boca en boca por 
              servir porciones generosas y una sazón inigualable.
            </p>
          </div>

          <div className="concept-card">
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
      </section>

      {/* Patriotic Banner */}
      <section className="patriotic-banner">
        <h2 className="banner-title">La comida que nos une</h2>
        <p className="banner-desc">
          Desde un ceviche al paso en una carretilla hasta el lomo saltado más tradicional del centro histórico, 
          cada huarique cuenta una historia de esfuerzo, unión y amor por nuestra tierra.
        </p>
      </section>

      {/* Popular Restaurants Section */}
      <section id="restaurantes" className="restaurants-section">
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
      </section>

      {/* Suggestions Box Section */}
      <section id="sugerencias" className="suggestions-section">
        <span className="section-tag">Participa</span>
        <h2 className="section-title">Buzón de Sugerencias</h2>
        
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
      </section>

      {/* Improved 3-Column Footer */}
      <footer className="footer">
        <div className="footer-grid">
          {/* Left Column: Logo and Info */}
          <div className="footer-col">
            <a href="#" className="footer-logo" onClick={() => scrollToSection('inicio')}>
              Huarique<span>Map</span>
            </a>
            <p className="footer-info-text">
              Conectando a los amantes de la buena comida con los rincones culinarios más emblemáticos 
              y tradicionales del Perú. Promovemos el turismo gastronómico local de forma gratuita.
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
      </footer>
    </div>
  );
}
