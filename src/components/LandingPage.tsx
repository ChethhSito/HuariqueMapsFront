import { useState, useEffect } from 'react';
import heroImage from '../assets/peruvian_cuisine_hero.png';
import cevicheImage from '../assets/ceviche_carretilla.png';
import anticuchosImage from '../assets/anticuchos_lima.png';
import characterImage from '../assets/ContactoHuarique.png';
import logoImage from '../assets/HuariqueMap.png';
import './LandingPage.css';
import LandingNavbar from './Landing/LandingNavbar';
import HeroSection from './Landing/HeroSection';
import ConceptSection from './Landing/ConceptSection';
import UsoSection from './Landing/UsoSection';

interface LandingPageProps {
  onNavigate: (view: 'landing' | 'map') => void;
  isDark: boolean;
  onToggleTheme: () => void;
  user: { nombre: string } | null;
  onAuthClick: () => void;
  onLogout: () => void;
}

export default function LandingPage({ onNavigate, isDark, onToggleTheme, user, onAuthClick, onLogout }: LandingPageProps) {
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

    const sections = ['inicio', 'concepto', 'uso', 'restaurantes', 'sugerencias'];
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
      <LandingNavbar
        activeSection={activeSection}
        scrollToSection={scrollToSection}
        isDark={isDark}
        onToggleTheme={onToggleTheme}
        user={user}
        onAuthClick={onAuthClick}
        onLogout={onLogout}
        onNavigate={onNavigate}
      />

      <HeroSection
        onNavigate={onNavigate}
        scrollToSection={scrollToSection}
      />

      <ConceptSection />

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
      <UsoSection />

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
