import MapShell from './MapShell';
import heroImage from '../assets/peruvian_cuisine_hero.png';
import './LandingPage.css';

export default function LandingPage() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <a href="#" className="nav-logo">
          🇵🇪 Huarique<span>Map</span>
        </a>
        <div className="nav-links">
          <span className="nav-link" onClick={() => scrollToSection('inicio')}>Inicio</span>
          <span className="nav-link" onClick={() => scrollToSection('concepto')}>Identidad</span>
          <span className="nav-link" onClick={() => scrollToSection('explorador')}>El Mapa</span>
        </div>
        <button className="btn-nav-map" onClick={() => scrollToSection('explorador')}>
          Explorar Mapa
        </button>
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
            <button className="btn-primary" onClick={() => scrollToSection('explorador')}>
              Ver Mapa de Huariques
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

      {/* Concept / Identity Section */}
      <section id="concepto" className="concept-section">
        <span className="section-tag">Nuestra Identidad</span>
        <h2 className="section-title">¿Qué nos une como Peruanos?</h2>
        
        <div className="concept-grid">
          <div className="concept-card">
            <span className="concept-icon">🍲</span>
            <h3 className="concept-card-title">El Concepto de "Huarique"</h3>
            <p className="concept-card-desc">
              Un huarique no es solo un restaurante; es un templo del sabor. Son lugares 
              tradicionales, a menudo discretos y familiares, reconocidos de boca en boca por 
              servir porciones generosas y una sazón inigualable.
            </p>
          </div>

          <div className="concept-card">
            <span className="concept-icon">❤️</span>
            <h3 className="concept-card-title">Identidad Patriótica</h3>
            <p className="concept-card-desc">
              La gastronomía es el hilo conductor de nuestra historia. Costa, Sierra y Selva 
              se entrelazan a través de ingredientes autóctonos como el ají amarillo, el limón 
              y el maíz, creando platos que representan nuestra bandera y orgullo.
            </p>
          </div>

          <div className="concept-card">
            <span className="concept-icon">🤝</span>
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

      {/* Interactive Map Explorer Section */}
      <section id="explorador" className="map-section">
        <span className="section-tag">Explorador Interactivo</span>
        <h2 className="section-title">Localiza tu Siguiente Huarique</h2>
        <p className="map-section-desc">
          Explora la distribución de restaurantes y huariques en tiempo real. 
          Haz clic en los marcadores interactivos para ver las especialidades de cada rincón.
        </p>
        
        {/* Render our custom MapShell inside the section */}
        <MapShell />
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2026 HuariqueMap. Creado con orgullo en Perú 🇵🇪</p>
        <p>Hecho para celebrar nuestra diversidad gastronómica y conectar sabores <span>❤</span></p>
      </footer>
    </div>
  );
}
