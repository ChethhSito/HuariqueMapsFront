import heroImage from '../assets/peruvian_cuisine_hero.png';
import cevicheImage from '../assets/ceviche_carretilla.png';
import anticuchosImage from '../assets/anticuchos_lima.png';
import './LandingPage.css';

interface LandingPageProps {
  onNavigate: (view: 'landing' | 'map') => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
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
        <a href="#" className="nav-logo" onClick={() => scrollToSection('inicio')}>
          🇵🇪 Huarique<span>Map</span>
        </a>
        <div className="nav-links">
          <span className="nav-link" onClick={() => scrollToSection('inicio')}>Inicio</span>
          <span className="nav-link" onClick={() => scrollToSection('concepto')}>Identidad</span>
          <span className="nav-link" onClick={() => scrollToSection('restaurantes')}>Restaurantes</span>
        </div>
        <button className="btn-nav-map" onClick={() => onNavigate('map')}>
          Ver Mapa Interactivo
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
                  <span>⏰ {res.horario}</span>
                  <span>📍 {res.ubicacion}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2026 HuariqueMap. Creado con orgullo en Perú 🇵🇪</p>
        <p>Hecho para celebrar nuestra diversidad gastronómica y conectar sabores <span>❤</span></p>
      </footer>
    </div>
  );
}
