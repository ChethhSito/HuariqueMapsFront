import logoImage from '../../assets/HuariqueMap.png';

export default function ConceptSection() {
  return (
    <>
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
    </>
  );
}
