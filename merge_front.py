import re
import os

map_ts = open('src/components/MapShell.tsx', 'r', encoding='utf-8').read()
juan_ts = open('map_juan.ts', 'r', encoding='utf-8').read()

# 1. Interfaces
map_ts = map_ts.replace(
    "interface PointGeometry {",
    "interface Resena {\n  usuarioId: string;\n  usuarioNombre: string;\n  comentario: string;\n  calificacion: number;\n  fecha: string | Date;\n}\n\ninterface PointGeometry {"
)

map_ts = map_ts.replace(
    "horario: string;\n}",
    "horario: string;\n  creadoPor?: string;\n  votosExiste?: string[];\n  votosNoExiste?: string[];\n  resenas?: Resena[];\n  ratingPromedio?: number;\n  numResenas?: number;\n}"
)

# 2. States
states_to_add = """
  // Estados de Registro Crowdsourcing
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [regNombre, setRegNombre] = useState('');
  const [regDescripcion, setRegDescripcion] = useState('');
  const [regTipoComida, setRegTipoComida] = useState('Marina');
  const [regHorario, setRegHorario] = useState('');
  const [regCoordinates, setRegCoordinates] = useState<[number, number] | null>(null); // [lat, lng]
"""
map_ts = map_ts.replace(
    "const [characterMessage, setCharacterMessage] = useState<string | null>(null);",
    "const [characterMessage, setCharacterMessage] = useState<string | null>(null);\n" + states_to_add
)

# 3. regMarkerRef
map_ts = map_ts.replace(
    "const routingControlRef = useRef<any>(null);",
    "const routingControlRef = useRef<any>(null);\n  const regMarkerRef = useRef<L.Marker | null>(null);"
)

# 4. map.on('click')
click_logic = """
      // Manejar clics en el mapa para el registro
      const handleMapClick = (e: L.LeafletMouseEvent) => {
        if (!isRegisterMode) return;
        const { lat, lng } = e.latlng;
        setRegCoordinates([lat, lng]);
      };

      map.on('click', handleMapClick);

      return () => {
        map.off('click', handleMapClick);
"""
map_ts = map_ts.replace(
    "    return () => {\n      window.removeEventListener('openHuariqueDetail', handleOpenDetailEvent);",
    click_logic + "\n      window.removeEventListener('openHuariqueDetail', handleOpenDetailEvent);"
)
map_ts = map_ts.replace("}, [huariques, onViewDetail]);", "}, [huariques, onViewDetail, isRegisterMode]);")

# 5. marker draggable update
draggable_update = """
  // Dibujar/actualizar el marcador draggable de registro
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isRegisterMode) return;

    if (regMarkerRef.current) {
      regMarkerRef.current.remove();
      regMarkerRef.current = null;
    }

    if (regCoordinates) {
      const [lat, lng] = regCoordinates;

      const regIcon = L.divIcon({
        className: 'custom-marker-container reg-marker-active',
        html: `
          <div class="marker-wrapper reg-wrapper">
            <div class="marker-pulse reg-pulse"></div>
            <div class="marker-pin-head reg-head">
              <div class="marker-pin-dot"></div>
            </div>
            <div class="marker-pin-tip reg-tip"></div>
          </div>
        `,
      });

      const marker = L.marker([lat, lng], { icon: regIcon, draggable: true });
      
      marker.on('dragend', (e) => {
        const m = e.target;
        const position = m.getLatLng();
        setRegCoordinates([position.lat, position.lng]);
      });

      regMarkerRef.current = marker;
      marker.addTo(map);
      map.panTo([lat, lng]);
    }
  }, [regCoordinates, isRegisterMode]);
"""
map_ts = map_ts.replace(
    "// Filtrado de restaurantes",
    draggable_update + "\n  // Filtrado de restaurantes"
)

# 6. Functions from Juan
# We get the exact substring from map_juan.ts
start_idx = juan_ts.find("const handleRegisterSubmit = async")
end_idx = juan_ts.find("return (", start_idx)
functions_str = juan_ts[start_idx:end_idx]

map_ts = map_ts.replace(
    "const selectedHuarique = huariques.find((h) => h._id === selectedId);\n\n  return (",
    functions_str + "\n  const selectedHuarique = huariques.find((h) => h._id === selectedId);\n\n  return ("
)

# 7. Sidebar conditional for Register Mode
sidebar_original = """<aside className="sidebar">
          <h2 className="sidebar-title">Huariques Registrados</h2>"""
sidebar_new = """<aside className="sidebar">
          {isRegisterMode ? (
            <div className="registration-container">
              <div className="registration-header-row">
                <h3 className="registration-title">Nuevo Huarique</h3>
                <button className="registration-close-btn" onClick={() => setIsRegisterMode(false)}>✕</button>
              </div>

              <form onSubmit={handleRegisterSubmit} className="registration-form">
                <div className="form-group">
                  <label className="form-label">Nombre del Huarique *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. El Tío Lucho"
                    value={regNombre}
                    onChange={(e) => setRegNombre(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Descripción</label>
                  <textarea
                    placeholder="Cuéntanos qué lo hace tan especial..."
                    value={regDescripcion}
                    onChange={(e) => setRegDescripcion(e.target.value)}
                    className="form-textarea"
                    rows={3}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Tipo de Comida *</label>
                    <select
                      value={regTipoComida}
                      onChange={(e) => setRegTipoComida(e.target.value)}
                      className="form-select"
                    >
                      {CATEGORIES.filter(cat => cat !== 'Todos').map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Horario</label>
                    <input
                      type="text"
                      placeholder="Ej. Lun-Sab: 12-5pm"
                      value={regHorario}
                      onChange={(e) => setRegHorario(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Ubicación Geográfica *</label>
                  <div className={`coordinates-status-box ${regCoordinates ? 'success' : 'pending'}`}>
                    {regCoordinates ? (
                      <div className="coords-display">
                        <span>Lat: {regCoordinates[0].toFixed(6)}</span>
                        <span>Lng: {regCoordinates[1].toFixed(6)}</span>
                      </div>
                    ) : (
                      <div className="coords-helper">
                        <span className="pulse-icon">📍</span>
                        <span>Haz clic en el mapa para marcar el huarique</span>
                      </div>
                    )}
                  </div>
                  {regCoordinates && (
                    <small style={{ color: 'var(--peru-text)', display: 'block', marginTop: '4px' }}>
                      (Puedes arrastrar el marcador rojo en el mapa para ajustar)
                    </small>
                  )}
                </div>

                <button type="submit" className="form-submit-btn">
                  Registrar Huarique
                </button>
              </form>
            </div>
          ) : (
            <>
              <div className="sidebar-header-row">
                <h2 className="sidebar-title">Huariques Registrados</h2>
                <button
                  className="add-huarique-btn"
                  onClick={() => {
                    if (!user) {
                      onAuthClick();
                    } else {
                      setIsRegisterMode(true);
                    }
                  }}
                  title="Registrar nuevo huarique colaborativo"
                >
                  + Registrar
                </button>
              </div>"""

map_ts = map_ts.replace(sidebar_original, sidebar_new)

# Close sidebar
map_ts = map_ts.replace("</ul>\n        </aside>", "</ul>\n            </>\n          )}\n        </aside>")


# 8. Detail Overlay fixes
map_ts = map_ts.replace("{selectedHuarique && (", "{selectedHuarique && !isRegisterMode && (")

map_ts = map_ts.replace(
"""          {/* Coordinates indicator at bottom-right with large image next to it */}
          {selectedHuarique && selectedHuarique.coordenadas && (
            <div style={{ position: 'absolute', bottom: '15px', right: '15px', zIndex: 1010, display: 'flex', alignItems: 'flex-end', gap: '8px' }}>""",
"""          {/* Coordinates indicator at bottom-right with large image next to it */}
          {selectedHuarique && selectedHuarique.coordenadas && !isRegisterMode && (
            <div style={{ position: 'absolute', bottom: '15px', right: '15px', zIndex: 1010, display: 'flex', alignItems: 'flex-end', gap: '8px' }}>"""
)

# 9. Validation bar inside Detail overlay
val_bar = """
              {/* 1. Sistema de Validación de Existencia */}
              <div className="validation-container" style={{ background: 'rgba(100, 116, 139, 0.03)', borderRadius: '8px', padding: '12px', marginBottom: '16px', border: '1px solid var(--map-border)' }}>
                <div className="validation-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="validation-title" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--map-text-dark)' }}>Comunidad: ¿Sigue existiendo?</span>
                  {(() => {
                    const totalVotes = (selectedHuarique.votosExiste?.length || 0) + (selectedHuarique.votosNoExiste?.length || 0);
                    const yesVotes = selectedHuarique.votosExiste?.length || 0;
                    const percentage = totalVotes === 0 ? 0 : Math.round((yesVotes / totalVotes) * 100);
                    
                    let badgeColor = '#94a3b8'; // gray
                    let badgeText = 'Sin votos';
                    if (totalVotes > 0) {
                      if (percentage >= 70) { badgeColor = '#10b981'; badgeText = 'Verificado'; } // green
                      else if (percentage >= 40) { badgeColor = '#f59e0b'; badgeText = 'Dudoso'; } // yellow
                      else { badgeColor = '#ef4444'; badgeText = 'Reportado Cerrado'; } // red
                    }

                    return (
                      <span className="validation-badge" style={{ fontSize: '10px', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold', background: badgeColor }}>
                        {badgeText}
                      </span>
                    );
                  })()}
                </div>

                {(() => {
                  const totalVotes = (selectedHuarique.votosExiste?.length || 0) + (selectedHuarique.votosNoExiste?.length || 0);
                  const yesVotes = selectedHuarique.votosExiste?.length || 0;
                  const noVotes = selectedHuarique.votosNoExiste?.length || 0;
                  const percentage = totalVotes === 0 ? 0 : (yesVotes / totalVotes) * 100;
                  
                  return (
                    <>
                      <div className="validation-bar-container" style={{ height: '6px', background: 'var(--peru-border-btn)', borderRadius: '3px', overflow: 'hidden', marginBottom: '6px' }}>
                        <div className="validation-bar" style={{ height: '100%', borderRadius: '3px', transition: 'width 0.4s ease', width: `${percentage}%`, background: percentage >= 50 || totalVotes === 0 ? '#10b981' : '#ef4444' }}></div>
                      </div>
                      <div className="validation-info-row" style={{ fontSize: '10px', color: '#64748b', textAlign: 'right', marginBottom: '10px' }}>
                        {yesVotes} confirman • {noVotes} niegan
                      </div>
                    </>
                  );
                })()}

                <div className="validation-buttons" style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className={`val-btn val-btn-yes ${(selectedHuarique.votosExiste || []).includes(user?.email || user?.nombre || '') ? 'active' : ''}`}
                    onClick={() => handleVoteExistence(selectedHuarique._id, true)}
                    style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--peru-border-btn)', background: 'var(--peru-white)', cursor: 'pointer', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    👍 Sí existe
                  </button>
                  <button 
                    className={`val-btn val-btn-no ${(selectedHuarique.votosNoExiste || []).includes(user?.email || user?.nombre || '') ? 'active' : ''}`}
                    onClick={() => handleVoteExistence(selectedHuarique._id, false)}
                    style={{ flex: 1, padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--peru-border-btn)', background: 'var(--peru-white)', cursor: 'pointer', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    👎 Ya cerró
                  </button>
                </div>
              </div>
"""

map_ts = map_ts.replace(
    "              <div className=\"detail-row\">\n                <span className=\"detail-label\">Horario:</span>\n                <span>{selectedHuarique.horario || 'No especificado'}</span>\n              </div>",
    "              <div className=\"detail-row\">\n                <span className=\"detail-label\">Horario:</span>\n                <span>{selectedHuarique.horario || 'No especificado'}</span>\n              </div>\n" + val_bar
)

# 10. Register Banner
reg_banner = """
          {/* Coordinates indicator at bottom-right */}
          {isRegisterMode && (
            <div className="map-center-coordinates register-help-banner" style={{ zIndex: 1010 }}>
              {regCoordinates 
                ? '📍 Ubicación seleccionada. Arrastra el pin rojo si necesitas reajustarlo.' 
                : '👈 Haz clic en cualquier lugar del mapa para fijar el huarique.'
              }
            </div>
          )}
"""

map_ts = map_ts.replace("</section>", reg_banner + "        </section>")

open('src/components/MapShell.tsx', 'w', encoding='utf-8').write(map_ts)
print("Done!")
