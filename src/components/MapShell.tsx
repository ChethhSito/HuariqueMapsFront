import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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

const FALLBACK_HUARIQUES: Huarique[] = [
  {
    _id: 'fallback-1',
    nombre: 'El Ceviche de Pedro',
    descripcion: 'Ceviche clásico de carretilla preparado al momento con pesca fresca del día, abundante limón piurano y choclo desgranado.',
    tipoComida: 'Marina',
    coordenadas: {
      type: 'Point',
      coordinates: [-77.0305, -12.1611] // Chorrillos
    },
    horario: 'Mar - Dom: 11:00 AM - 4:30 PM'
  },
  {
    _id: 'fallback-2',
    nombre: 'Anticuchos del Puente',
    descripcion: 'Tradicionales brochetas de corazón a la parrilla marinados en ají panca y especias, acompañados de papas doradas y choclo tierno.',
    tipoComida: 'Criolla',
    coordenadas: {
      type: 'Point',
      coordinates: [-77.0222, -12.1495] // Barranco
    },
    horario: 'Lun - Sáb: 6:00 PM - 11:30 PM'
  },
  {
    _id: 'fallback-3',
    nombre: 'El Rinconcito Lomeño',
    descripcion: 'Especialistas en lomo saltado ahumado al wok con cebolla crujiente, tomates jugosos y papas nativas amarillas fritas al instante.',
    tipoComida: 'Fusión / Criolla',
    coordenadas: {
      type: 'Point',
      coordinates: [-77.036886, -12.046374] // Centro de Lima
    },
    horario: 'Lun - Dom: 12:00 PM - 10:00 PM'
  },
  {
    _id: 'fallback-4',
    nombre: 'El Huarique de la Tía Veneno',
    descripcion: 'Las mejores hamburguesas al paso y salchipapas de Lima.',
    tipoComida: 'Comida Rápida / Criolla',
    coordenadas: {
      type: 'Point',
      coordinates: [-77.0358, -12.0825] // Lince
    },
    horario: 'Lun-Sab: 18:00 - 23:00'
  },
  {
    _id: 'fallback-5',
    nombre: 'Cevichería El Arrecife',
    descripcion: 'El ceviche de carretilla más fresco y picante de la zona.',
    tipoComida: 'Marina',
    coordenadas: {
      type: 'Point',
      coordinates: [-77.029891, -12.121147] // Miraflores
    },
    horario: 'Mar-Dom: 11:30 - 16:30'
  }
];

const CATEGORIES = ['Todos', 'Marina', 'Criolla', 'Fusión', 'Comida Rápida', 'Pollerías', 'Chifas', 'Amazónica', 'Picanterías', 'Postres'];

interface MapShellProps {
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;
  user: { nombre: string } | null;
  onAuthClick: () => void;
}

export default function MapShell({ isConnected, setIsConnected, user, onAuthClick }: MapShellProps) {
  const [huariques, setHuariques] = useState<Huarique[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de filtros y likes
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [likesMap, setLikesMap] = useState<{ [id: string]: number }>({});

  const filterBarRef = useRef<HTMLDivElement>(null);

  const scrollFilterBar = (direction: 'left' | 'right') => {
    if (filterBarRef.current) {
      const scrollAmount = 150;
      filterBarRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };
  const [myLikesMap, setMyLikesMap] = useState<{ [id: string]: boolean }>({});

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  // Cargar huariques desde API o datos de respaldo
  useEffect(() => {
    const fetchHuariques = async () => {
      const apiUrl = import.meta.env.VITE_API_URL as string;
      try {
        setLoading(true);
        const response = await fetch(`${apiUrl}/huariques`);
        if (!response.ok) {
          throw new Error(`Error en el servidor: ${response.statusText}`);
        }
        const data = await response.json();
        if (data && data.length > 0) {
          setHuariques(data);
          setIsConnected(true);
          setError(null);
          setSelectedId(data[0]._id);
        } else {
          setHuariques(FALLBACK_HUARIQUES);
          setIsConnected(true);
          setError(null);
          setSelectedId(FALLBACK_HUARIQUES[0]._id);
        }
      } catch (err: any) {
        console.warn('Error conectando al API, usando huariques de respaldo:', err);
        setHuariques(FALLBACK_HUARIQUES);
        setError('Sin conexión al backend NestJS. Mostrando huariques de respaldo.');
        setIsConnected(false);
        setSelectedId(FALLBACK_HUARIQUES[0]._id);
      } finally {
        setLoading(false);
      }
    };

    fetchHuariques();
  }, [setIsConnected]);

  // Inicializar estado de Likes con localStorage o por defecto
  useEffect(() => {
    if (huariques.length === 0) return;

    const savedLikes = localStorage.getItem('huariques_likes_map');
    const savedMyLikes = localStorage.getItem('huariques_my_likes_map');

    let parsedLikes: { [id: string]: number } = {};
    let parsedMyLikes: { [id: string]: boolean } = {};

    if (savedLikes) {
      try { parsedLikes = JSON.parse(savedLikes); } catch (e) { }
    }
    if (savedMyLikes) {
      try { parsedMyLikes = JSON.parse(savedMyLikes); } catch (e) { }
    }

    const updatedLikesMap = { ...parsedLikes };

    huariques.forEach((h) => {
      if (updatedLikesMap[h._id] === undefined) {
        if (h._id === 'fallback-1') updatedLikesMap[h._id] = 34;
        else if (h._id === 'fallback-2') updatedLikesMap[h._id] = 48;
        else if (h._id === 'fallback-3') updatedLikesMap[h._id] = 57;
        else if (h._id === 'fallback-4') updatedLikesMap[h._id] = 120;
        else if (h._id === 'fallback-5') updatedLikesMap[h._id] = 22;
        else updatedLikesMap[h._id] = 15;
      }
    });

    setLikesMap(updatedLikesMap);
    setMyLikesMap(parsedMyLikes);
  }, [huariques]);

  // Inicializar mapa Leaflet
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Centrar inicialmente en Lima
    const map = L.map(mapContainerRef.current, {
      zoomControl: false
    }).setView([-12.08, -77.03], 12);

    // Añadir control de zoom arriba a la izquierda
    L.control.zoom({ position: 'topleft' }).addTo(map);

    // Añadir capa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Crear grupo para los marcadores
    const markersGroup = L.layerGroup().addTo(map);
    markersGroupRef.current = markersGroup;
    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersGroupRef.current = null;
      }
    };
  }, []);

  // Filtrado de restaurantes
  const filteredHuariques = huariques.filter((h) => {
    if (selectedCategory === 'Todos') return true;
    return h.tipoComida.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  // Auto-seleccionar primer elemento filtrado si el actual queda excluido
  useEffect(() => {
    if (filteredHuariques.length > 0) {
      const exists = filteredHuariques.some(h => h._id === selectedId);
      if (!exists) {
        setSelectedId(filteredHuariques[0]._id);
      }
    } else {
      setSelectedId(null);
    }
  }, [selectedCategory, filteredHuariques, selectedId]);

  // Actualizar marcadores cuando cambian los huariques filtrados, los likes o el ID seleccionado
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    // Limpiar marcadores anteriores
    markersGroupRef.current.clearLayers();

    filteredHuariques.forEach((h) => {
      if (!h.coordenadas || !h.coordenadas.coordinates || h.coordenadas.coordinates.length < 2) return;

      const [lng, lat] = h.coordenadas.coordinates;
      const isActive = selectedId === h._id;
      const likesCount = likesMap[h._id] || 0;
      const hasUserLiked = !!myLikesMap[h._id];

      // Crear icono personalizado tipo pin
      const customIcon = L.divIcon({
        className: `custom-marker-container ${isActive ? 'active-marker' : ''}`,
        html: `
          <div class="marker-wrapper">
            ${isActive ? '<div class="marker-pulse"></div>' : ''}
            <div class="marker-pin-head">
              <div class="marker-pin-dot"></div>
            </div>
            <div class="marker-pin-tip"></div>
          </div>
        `,
        iconSize: [30, 42],
        iconAnchor: [15, 42],
        popupAnchor: [0, -35]
      });

      // Crear marcador
      const marker = L.marker([lat, lng], { icon: customIcon });

      // Añadir popup de Leaflet
      marker.bindPopup(`
        <div class="leaflet-popup-content-inner" style="font-family: 'Outfit', sans-serif; min-width: 140px;">
          <strong style="color: #110906; font-size: 14px; display: block; margin-bottom: 2px;">${h.nombre}</strong>
          <span style="font-size: 11px; color: #bd2d2d; font-weight: 600; display: block;">${h.tipoComida}</span>
          <div style="font-size: 11px; margin-top: 6px; display: flex; align-items: center; gap: 4px; color: #64748b;">
            <span>❤️ ${likesCount} likes</span>
            ${hasUserLiked ? '<strong style="color: #bd2d2d; font-size: 10px;">(Liked)</strong>' : ''}
          </div>
        </div>
      `, {
        closeButton: false,
        offset: L.point(0, -5)
      });

      // Evento de clic en el marcador
      marker.on('click', () => {
        setSelectedId(h._id);
      });

      // Añadir al grupo de marcadores
      markersGroupRef.current?.addLayer(marker);

      // Si es el activo, abrir su popup
      if (isActive) {
        setTimeout(() => {
          marker.openPopup();
        }, 150);
      }
    });
  }, [filteredHuariques, selectedId, likesMap, myLikesMap]);

  // Centrar el mapa con animación suave al seleccionar un huarique
  useEffect(() => {
    if (!selectedId || !mapInstanceRef.current) return;
    const selected = huariques.find((h) => h._id === selectedId);
    if (selected && selected.coordenadas && selected.coordenadas.coordinates.length >= 2) {
      const [lng, lat] = selected.coordenadas.coordinates;

      mapInstanceRef.current.flyTo([lat, lng], 14, {
        animate: true,
        duration: 1.0
      });
    }
  }, [selectedId, huariques]);

  // Manejar el toggle de like
  const handleToggleLike = (id: string) => {
    if (!user) {
      onAuthClick();
      return;
    }

    const isLiked = !!myLikesMap[id];
    const newMyLikes = { ...myLikesMap, [id]: !isLiked };
    const newLikes = { ...likesMap, [id]: (likesMap[id] || 0) + (isLiked ? -1 : 1) };

    setMyLikesMap(newMyLikes);
    setLikesMap(newLikes);

    localStorage.setItem('huariques_my_likes_map', JSON.stringify(newMyLikes));
    localStorage.setItem('huariques_likes_map', JSON.stringify(newLikes));
  };

  const selectedHuarique = huariques.find((h) => h._id === selectedId);

  return (
    <div className="dashboard-container">
      {/* Main Content Area */}
      <div className="dashboard-content">
        {/* Sidebar */}
        <aside className="sidebar">
          <h2 className="sidebar-title">Huariques Registrados</h2>

          {/* Category Filter Bar with Scroll Arrows */}
          <div className="filter-bar-wrapper">
            <button
              className="scroll-arrow left"
              onClick={() => scrollFilterBar('left')}
              title="Deslizar izquierda"
            >
              ‹
            </button>
            <div className="filter-bar" ref={filterBarRef}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
            <button
              className="scroll-arrow right"
              onClick={() => scrollFilterBar('right')}
              title="Deslizar derecha"
            >
              ›
            </button>
          </div>

          {loading && <div className="no-data-msg">Cargando huariques desde la base de datos...</div>}

          {!loading && error && (
            <div className="no-data-msg" style={{ color: '#f87171', padding: '12px 20px', borderBottom: '1px solid var(--map-border)' }}>
              <small style={{ display: 'block', color: 'var(--peru-text)' }}>
                {error}
              </small>
            </div>
          )}

          {!loading && filteredHuariques.length === 0 && (
            <div className="no-data-msg">No se encontraron huariques de este tipo.</div>
          )}

          <ul className="huariques-list">
            {filteredHuariques.map((h) => (
              <li
                key={h._id}
                className={`huarique-item ${selectedId === h._id ? 'active' : ''}`}
                onClick={() => setSelectedId(h._id)}
              >
                <div className="huarique-item-header">
                  <h3 className="huarique-name">{h.nombre}</h3>
                  <span className="huarique-likes-badge" onClick={(e) => {
                    e.stopPropagation();
                    handleToggleLike(h._id);
                  }} style={{ cursor: 'pointer' }} title={user ? 'Dar Me gusta' : 'Inicia sesión para dar like'}>
                    {myLikesMap[h._id] ? '❤️' : '🤍'} {likesMap[h._id] || 0}
                  </span>
                </div>
                <span className="huarique-tag">{h.tipoComida}</span>
                <p className="huarique-desc">{h.descripcion}</p>
                <div className="huarique-meta">
                  <span>Horario: {h.horario || 'No especificado'}</span>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        {/* Real Leaflet Map Viewport */}
        <section className="map-shell">
          <div id="map-container" ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />

          {/* Simulated grid info overlay */}
          <div className="map-grid-overlay" style={{ zIndex: 1010 }}>
            <div>GPS ENGINE: ACTIVE</div>
            <div>MAP: OPENSTREETMAP</div>
            <div>STATUS: {isConnected ? 'LIVE API' : 'LOCAL FALLBACK'}</div>
          </div>

          {/* Detailed Overlay Card for selected Huarique */}
          {selectedHuarique && (
            <div className="detail-overlay" style={{ zIndex: 1010 }}>
              <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                <span>{selectedHuarique.nombre}</span>
              </h3>
              <span className="huarique-tag" style={{ marginBottom: '12px' }}>{selectedHuarique.tipoComida}</span>
              <p>{selectedHuarique.descripcion}</p>

              <div className="detail-row">
                <span className="detail-label">Horario:</span>
                <span>{selectedHuarique.horario || 'No especificado'}</span>
              </div>



              {/* Heart Likes Interactive Button */}
              <button
                className={`like-button ${myLikesMap[selectedHuarique._id] ? 'liked' : ''}`}
                onClick={() => handleToggleLike(selectedHuarique._id)}
              >
                <svg className="heart-icon" viewBox="0 0 24 24" width="16" height="16">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <span>
                  {myLikesMap[selectedHuarique._id] ? '¡Te gusta!' : 'Dar Me Gusta'} ({likesMap[selectedHuarique._id] || 0})
                </span>
              </button>
            </div>
          )}

          {/* Coordinates indicator at bottom-right */}
          {selectedHuarique && selectedHuarique.coordenadas && (
            <div className="map-center-coordinates" style={{ zIndex: 1010 }}>
              Ubicación: {selectedHuarique.coordenadas.coordinates[1].toFixed(6)}° N, {selectedHuarique.coordenadas.coordinates[0].toFixed(6)}° W
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
