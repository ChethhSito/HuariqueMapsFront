import { useEffect, useState } from 'react';
import './MapShell.css';

interface PointGeometry {
  type: 'Point';
  coordinates: number[]; // [longitud, latitud]
}

interface Huarique {
  _id: string;
  nombre: string;
  descripcion: string;
  tipoComida: string;
  coordenadas: PointGeometry;
  horario: string;
}

export default function MapShell() {
  const [huariques, setHuariques] = useState<Huarique[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Límites geográficos de Lima para mapear a porcentajes en la pantalla
  const minLng = -77.10;
  const maxLng = -77.00;
  const minLat = -12.16;
  const maxLat = -12.00;

  useEffect(() => {
    const fetchHuariques = async () => {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      try {
        setLoading(true);
        const response = await fetch(`${apiUrl}/huariques`);
        if (!response.ok) {
          throw new Error(`Error en el servidor: ${response.statusText}`);
        }
        const data = await response.json();
        setHuariques(data);
        setIsConnected(true);
        setError(null);
        if (data.length > 0) {
          setSelectedId(data[0]._id);
        }
      } catch (err: any) {
        console.error('Error fetching huariques:', err);
        setError('No se pudo conectar al backend de NestJS.');
        setIsConnected(false);
      } finally {
        setLoading(false);
      }
    };

    fetchHuariques();
  }, []);

  // Función para proyectar coordenadas geográficas reales en la cuadrícula CSS del mapa ficticio
  const getCoordinatesPercent = (coordinates: number[]) => {
    if (!coordinates || coordinates.length < 2) {
      return { left: '50%', top: '50%' };
    }
    const [lng, lat] = coordinates;
    
    // Proporciones
    const leftPercent = ((lng - minLng) / (maxLng - minLng)) * 100;
    // La latitud es invertida en CSS (top: 0 es el límite norte)
    const topPercent = 100 - ((lat - minLat) / (maxLat - minLat)) * 100;

    // Asegurar que queden dentro de los márgenes visuales del mapa (10% - 90%)
    const clampedLeft = Math.max(10, Math.min(90, leftPercent));
    const clampedTop = Math.max(10, Math.min(90, topPercent));

    return {
      left: `${clampedLeft}%`,
      top: `${clampedTop}%`,
    };
  };

  const selectedHuarique = huariques.find((h) => h._id === selectedId);

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="brand">
          <h1 className="brand-title">HuariqueMap Explorer</h1>
        </div>
        <div className="status-badge">
          <div className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></div>
          <span>
            {isConnected ? 'NestJS API Conectado' : 'Sin Conexión API (Servidor Apagado)'}
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="dashboard-content">
        {/* Sidebar */}
        <aside className="sidebar">
          <h2 className="sidebar-title">Huariques Registrados</h2>
          {loading && <div className="no-data-msg">Cargando huariques desde la base de datos...</div>}
          
          {!loading && error && (
            <div className="no-data-msg" style={{ color: '#f87171' }}>
              Error: {error}
              <br />
              <small style={{ display: 'block', marginTop: '8px', color: '#94a3b8' }}>
                Asegúrate de que el backend de NestJS esté corriendo en el puerto 3000.
              </small>
            </div>
          )}

          {!loading && !error && huariques.length === 0 && (
            <div className="no-data-msg">No se encontraron huariques registrados.</div>
          )}

          <ul className="huariques-list">
            {huariques.map((h) => (
              <li
                key={h._id}
                className={`huarique-item ${selectedId === h._id ? 'active' : ''}`}
                onClick={() => setSelectedId(h._id)}
              >
                <h3 className="huarique-name">{h.nombre}</h3>
                <span className="huarique-tag">{h.tipoComida}</span>
                <p className="huarique-desc">{h.descripcion}</p>
                <div className="huarique-meta">
                  <span>Horario: {h.horario || 'No especificado'}</span>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        {/* Mock Map Viewport */}
        <section className="map-shell">
          <div className="map-placeholder-title">Visualizador del Mapa Interactivo</div>
          
          {/* Simulated grid info overlay */}
          <div className="map-grid-overlay">
            <div>GRID STATE: DRAFT</div>
            <div>RENDER: CANVAS_CSS_SHAPE</div>
            <div>ZOOM: 12.4x</div>
          </div>

          {/* SVG Map contour visual simulation */}
          <svg className="map-vector-graphic" viewBox="0 0 100 100">
            <path d="M10,20 Q30,10 50,25 T90,30 T80,70 T40,80 Z" />
            <path d="M20,40 Q40,30 60,45 T80,60" />
            <path d="M5,70 Q25,85 55,65 T95,80" />
          </svg>

          {/* Map Pins representing Huariques */}
          {huariques.map((h) => {
            const position = getCoordinatesPercent(h.coordenadas?.coordinates);
            const isActive = selectedId === h._id;
            return (
              <div
                key={h._id}
                className={`map-pin ${isActive ? 'active' : ''}`}
                style={{ left: position.left, top: position.top }}
                onClick={() => setSelectedId(h._id)}
              >
                {isActive && <div className="pin-pulse"></div>}
                <div className="pin-marker" title={h.nombre}></div>
              </div>
            );
          })}

          {/* Detailed Overlay Card for selected Huarique */}
          {selectedHuarique && (
            <div className="detail-overlay">
              <h3>{selectedHuarique.nombre}</h3>
              <span className="huarique-tag">{selectedHuarique.tipoComida}</span>
              <p>{selectedHuarique.descripcion}</p>
              
              <div className="detail-row">
                <span className="detail-label">Horario:</span>
                <span>{selectedHuarique.horario || 'No especificado'}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">GeoJSON:</span>
                <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#a5b4fc' }}>
                  [{selectedHuarique.coordenadas?.coordinates?.join(', ')}]
                </span>
              </div>
            </div>
          )}

          {/* Coordinates indicator at bottom-right */}
          {selectedHuarique && selectedHuarique.coordenadas && (
            <div className="map-center-coordinates">
              GPS: {selectedHuarique.coordenadas.coordinates[1].toFixed(6)}° N, {selectedHuarique.coordenadas.coordinates[0].toFixed(6)}° W
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
