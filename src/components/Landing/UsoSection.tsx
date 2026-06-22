import usoHuariqueImg from '../../assets/usoHuarique.png';

export default function UsoSection() {
  return (
    <section id="uso" className="uso-section" style={{ backgroundColor: 'var(--peru-white)', padding: '80px 0' }}>
      <div className="section-container">
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <span className="section-tag" style={{ margin: '0 auto 20px auto' }}>¿Cómo funciona?</span>
          <h2 className="section-title" style={{ border: 'none', margin: '0' }}>Tu guía para usar HuariqueMap</h2>
        </div>
        
        <div className="uso-layout" style={{ display: 'flex', gap: '30px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
          
          {/* Left Column (Steps 1, 2) */}
          <div className="uso-column" style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: '50px' }}>
            {/* Step 1 */}
            <div className="uso-step" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexDirection: 'row-reverse', textAlign: 'right' }}>
              <div className="step-icon-wrapper" style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--peru-red-light)', color: 'var(--peru-red-bright)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--peru-text-dark)', marginBottom: '4px' }}>1. Explora el mapa</h3>
                <p style={{ fontSize: '15px', color: 'var(--peru-text)', lineHeight: '1.5', margin: 0 }}>Navega y encuentra los huariques mejor calificados cerca de ti de forma rápida e intuitiva.</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="uso-step" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', flexDirection: 'row-reverse', textAlign: 'right' }}>
              <div className="step-icon-wrapper" style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--peru-text-dark)', marginBottom: '4px' }}>2. Conoce los detalles</h3>
                <p style={{ fontSize: '15px', color: 'var(--peru-text)', lineHeight: '1.5', margin: 0 }}>Descubre horarios, platos estrella, ubicación exacta y las reseñas de otros comensales.</p>
              </div>
            </div>
          </div>

          {/* Center Image */}
          <div className="uso-image-container" style={{ flex: '0 1 350px', display: 'flex', justifyContent: 'center', padding: '0 20px' }}>
            <img src={usoHuariqueImg} alt="Uso de HuariqueMap" style={{ width: '100%', maxWidth: '100%', objectFit: 'contain', filter: 'drop-shadow(0 20px 25px rgba(0,0,0,0.15))' }} />
          </div>

          {/* Right Column (Steps 3, 4, 5) */}
          <div className="uso-column" style={{ flex: '1 1 280px', display: 'flex', flexDirection: 'column', gap: '50px' }}>
            {/* Step 3 */}
            <div className="uso-step" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div className="step-icon-wrapper" style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--peru-text-dark)', marginBottom: '4px' }}>3. Únete a la comunidad</h3>
                <p style={{ fontSize: '15px', color: 'var(--peru-text)', lineHeight: '1.5', margin: 0 }}>Crea tu cuenta para guardar tus lugares favoritos, dejar comentarios y dar likes.</p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="uso-step" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div className="step-icon-wrapper" style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--peru-text-dark)', marginBottom: '4px' }}>4. Valida su existencia</h3>
                <p style={{ fontSize: '15px', color: 'var(--peru-text)', lineHeight: '1.5', margin: 0 }}>Ayuda a mantener el mapa actualizado confirmando si un huarique sigue operando o ya cerró.</p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="uso-step" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div className="step-icon-wrapper" style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--peru-red-light)', color: 'var(--peru-red-bright)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--peru-text-dark)', marginBottom: '4px' }}>5. Registra nuevos puntos</h3>
                <p style={{ fontSize: '15px', color: 'var(--peru-text)', lineHeight: '1.5', margin: 0 }}>¿Conoces una joya oculta? Haz clic en el mapa y agrégala para que todos puedan disfrutarla.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
