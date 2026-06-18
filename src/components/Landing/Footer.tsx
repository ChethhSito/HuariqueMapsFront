import logoImage from '../../assets/HuariqueMap.png';

interface FooterProps {
  scrollToSection: (id: string) => void;
}

export default function Footer({ scrollToSection }: FooterProps) {
  return (
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
      </div>
    </footer>
  );
}
