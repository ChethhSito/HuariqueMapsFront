import characterImage from '../../assets/ContactoHuarique.png';

interface SuggestionsSectionProps {
  isSubmitted: boolean;
  nombre: string;
  setNombre: (value: string) => void;
  correo: string;
  setCorreo: (value: string) => void;
  descripcion: string;
  setDescripcion: (value: string) => void;
  handleSuggestionSubmit: (e: React.FormEvent) => void;
}

export default function SuggestionsSection({
  isSubmitted,
  nombre,
  setNombre,
  correo,
  setCorreo,
  descripcion,
  setDescripcion,
  handleSuggestionSubmit
}: SuggestionsSectionProps) {
  return (
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
  );
}
