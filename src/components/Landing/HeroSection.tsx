import heroImage from '../../assets/peruvian_cuisine_hero.png';

interface HeroSectionProps {
  onNavigate: (view: 'landing' | 'map') => void;
  scrollToSection: (id: string) => void;
}

export default function HeroSection({ onNavigate, scrollToSection }: HeroSectionProps) {
  return (
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
  );
}
