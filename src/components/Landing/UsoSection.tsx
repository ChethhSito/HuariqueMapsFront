import usoHuariqueImg from '../../assets/usoHuarique.png';
import './UsoSection.css';

export default function UsoSection() {
  const steps = [
    {
      id: 1,
      title: '1. Explora el mapa',
      desc: 'Navega y encuentra los huariques mejor calificados cerca de ti de forma rápida e intuitiva.',
      bg: 'var(--peru-red-light, rgba(189, 45, 45, 0.08))',
      color: 'var(--peru-red-bright, #bd2d2d)',
      icon: (
        <svg className="timeline-icon-svg" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      )
    },
    {
      id: 2,
      title: '2. Conoce los detalles',
      desc: 'Descubre horarios, platos estrella, ubicación exacta y las reseñas de otros comensales.',
      bg: 'rgba(245, 158, 11, 0.15)',
      color: '#f59e0b',
      icon: (
        <svg className="timeline-icon-svg" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      )
    },
    {
      id: 3,
      title: '3. Únete a la comunidad',
      desc: 'Crea tu cuenta para guardar tus lugares favoritos, dejar comentarios y dar likes.',
      bg: 'rgba(59, 130, 246, 0.15)',
      color: '#3b82f6',
      icon: (
        <svg className="timeline-icon-svg" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      )
    },
    {
      id: 4,
      title: '4. Valida su existencia',
      desc: 'Ayuda a mantener el mapa actualizado confirmando si un huarique sigue operando o ya cerró.',
      bg: 'rgba(16, 185, 129, 0.15)',
      color: '#059669',
      icon: (
        <svg className="timeline-icon-svg" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      )
    },
    {
      id: 5,
      title: '5. Registra nuevos puntos',
      desc: '¿Conoces una joya oculta? Haz clic en el mapa y agrégala para que todos puedan disfrutarla.',
      bg: 'var(--peru-red-light, rgba(189, 45, 45, 0.08))',
      color: 'var(--peru-red-bright, #bd2d2d)',
      icon: (
        <svg className="timeline-icon-svg" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3"></circle>
        </svg>
      )
    }
  ];

  return (
    <section id="uso" className="uso-section">
      <div className="section-container">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span className="section-tag" style={{ margin: '0 auto 20px auto' }}>¿Cómo funciona?</span>
          <h2 className="section-title" style={{ border: 'none', margin: '0' }}>Tu guía para usar HuariqueMap</h2>
        </div>

        <div className="uso-layout-timeline">
          {/* Timeline side */}
          <div className="timeline-side-wrapper" style={{ flex: '1 1 500px', maxWidth: '650px', position: 'relative' }}>
            <div className="timeline-line-left"></div>
            {steps.map((step) => (
              <div key={step.id} className="timeline-item-left">
                <div 
                  className="timeline-icon-circle-left"
                  style={{ 
                    backgroundColor: step.bg,
                    borderColor: step.color,
                    color: step.color
                  }}
                >
                  {step.icon}
                </div>
                <div className="timeline-content-box">
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Image side */}
          <div className="uso-image-side" style={{ flex: '0 1 320px', display: 'flex', justifyContent: 'center', padding: '0 20px' }}>
            <img src={usoHuariqueImg} alt="Uso de HuariqueMap" style={{ width: '100%', maxWidth: '320px', objectFit: 'contain', filter: 'drop-shadow(0 20px 25px rgba(0,0,0,0.15))' }} />
          </div>
        </div>
      </div>
    </section>
  );
}
