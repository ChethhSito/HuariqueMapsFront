import { useEffect, useRef } from 'react';
import { useMapData } from '../hooks/useMapData';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import './MapShell.css';
import AddHuariqueForm from '../components/Map/AddHuariqueForm';
import MapSidebarList from '../components/Map/MapSidebarList';
import mapahuariqueImg from '../assets/mapahuarique.png';
import { CATEGORIES } from '../data/constants';
import HuariqueDetailOverlay from '../components/Map/HuariqueDetailOverlay';

interface Resena {
  usuarioId: string;
  usuarioNombre: string;
  comentario: string;
  calificacion: number;
  fecha: string | Date;
}

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
  creadoPor?: string;
  votosExiste?: string[];
  votosNoExiste?: string[];
  resenas?: Resena[];
  ratingPromedio?: number;
  numResenas?: number;
}


interface MapShellProps {
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;
  user: { nombre: string; email?: string; token?: string | null; isLocal?: boolean } | null;
  onAuthClick: () => void;
  onViewDetail?: (huarique: Huarique) => void;
}

export default function MapShell({ isConnected, setIsConnected, user, onAuthClick, onViewDetail }: MapShellProps) {
  const {
    huariques,
    selectedId, setSelectedId,
    loading, error,
    selectedCategory, setSelectedCategory,
    likesMap,
    myLikesMap,
    characterMessage, showCharacterMessage,
    isRegisterMode, setIsRegisterMode,
    regNombre, setRegNombre,
    regDescripcion, setRegDescripcion,
    regTipoComida, setRegTipoComida,
    regHorario, setRegHorario,
    regCoordinates, setRegCoordinates,
    handleToggleLike,
    handleVoteExistence,
    handleRegisterSubmit,
    filteredHuariques,
    selectedHuarique
  } = useMapData(isConnected, setIsConnected, user, onAuthClick);

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

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const routingControlRef = useRef<any>(null);
  const regMarkerRef = useRef<L.Marker | null>(null);

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

    const handleOpenDetailEvent = (e: any) => {
      const hId = e.detail;
      const hq = huariques.find(h => h._id === hId);
      if (hq && onViewDetail) {
        onViewDetail(hq);
      }
    };
    window.addEventListener('openHuariqueDetail', handleOpenDetailEvent);


      // Manejar clics en el mapa para el registro
      const handleMapClick = (e: L.LeafletMouseEvent) => {
        if (!isRegisterMode) return;
        const { lat, lng } = e.latlng;
        setRegCoordinates([lat, lng]);
      };

      map.on('click', handleMapClick);

      return () => {
        map.off('click', handleMapClick);

      window.removeEventListener('openHuariqueDetail', handleOpenDetailEvent);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersGroupRef.current = null;
      }
    };
  }, [huariques, onViewDetail, isRegisterMode]);

  
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
          <strong style="color: var(--map-text-dark, #110906); font-size: 14px; display: block; margin-bottom: 2px;">${h.nombre}</strong>
          <span style="font-size: 11px; color: var(--peru-red, #bd2d2d); font-weight: 600; display: block;">${h.tipoComida}</span>
          <div style="font-size: 11px; margin-top: 6px; display: flex; align-items: center; justify-content: space-between; gap: 4px; color: var(--map-text, #64748b);">
            <div>
              <span>❤️ ${likesCount} likes</span>
              ${hasUserLiked ? '<strong style="color: var(--peru-red, #bd2d2d); font-size: 10px;">(Liked)</strong>' : ''}
            </div>
            <button 
              onclick="window.dispatchEvent(new CustomEvent('openHuariqueDetail', { detail: '${h._id}' }))"
              style="background: var(--peru-red, #bd2d2d); color: white; border: none; border-radius: 50%; width: 18px; height: 18px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-weight: bold; font-family: Outfit; font-size: 10px;"
              title="Más información"
            >!</button>
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

  const handleGuideMe = (targetHuarique: Huarique) => {
    if (!mapInstanceRef.current) return;
    
    showCharacterMessage("¡Trazando ruta rápida en el mapa!");

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          const [targetLng, targetLat] = targetHuarique.coordenadas.coordinates;

          // Limpiar ruta anterior si existe
          if (routingControlRef.current) {
            mapInstanceRef.current?.removeControl(routingControlRef.current);
          }

          // Crear nueva ruta usando L.Routing
          routingControlRef.current = (L as any).Routing.control({
            waypoints: [
              L.latLng(userLat, userLng),
              L.latLng(targetLat, targetLng)
            ],
            routeWhileDragging: false,
            addWaypoints: false,
            draggableWaypoints: false,
            language: 'es',
            showAlternatives: false,
            fitSelectedRoutes: true,
            show: false, // Ocultar el panel de instrucciones para que no tape el mapa
            createMarker: function(i: number, waypoint: any) {
              if (i === 0) {
                 return L.marker(waypoint.latLng, { draggable: false }).bindPopup('Tu ubicación actual');
              } else {
                 return null; // No crear marcador extra para el destino porque ya hay uno
              }
            }
          }).addTo(mapInstanceRef.current);
        },
        (error) => {
          console.error("Error obteniendo ubicación: ", error);
          alert("No se pudo obtener tu ubicación. Por favor, permite el acceso a tu ubicación en el navegador.");
        }
      );
    } else {
      alert("Tu navegador no soporta geolocalización.");
    }
  };

  return (
    <div className="dashboard-container">
      {/* Main Content Area */}
      <div className="dashboard-content">
        {/* Sidebar */}
        <aside className="sidebar">
          {isRegisterMode ? (
            <AddHuariqueForm
              setIsRegisterMode={setIsRegisterMode}
              handleRegisterSubmit={handleRegisterSubmit}
              regNombre={regNombre}
              setRegNombre={setRegNombre}
              regDescripcion={regDescripcion}
              setRegDescripcion={setRegDescripcion}
              regTipoComida={regTipoComida}
              setRegTipoComida={setRegTipoComida}
              CATEGORIES={CATEGORIES}
              regHorario={regHorario}
              setRegHorario={setRegHorario}
              regCoordinates={regCoordinates}
            />
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
              </div>

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

          <MapSidebarList
            filteredHuariques={filteredHuariques}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            handleToggleLike={handleToggleLike}
            myLikesMap={myLikesMap}
            likesMap={likesMap}
            user={user}
          />
            </>
          )}
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
          {selectedHuarique && !isRegisterMode && (
            <HuariqueDetailOverlay
              selectedHuarique={selectedHuarique}
              user={user}
              handleVoteExistence={handleVoteExistence}
              myLikesMap={myLikesMap}
              likesMap={likesMap}
              handleToggleLike={handleToggleLike}
              onViewDetail={onViewDetail}
              handleGuideMe={handleGuideMe}
              showCharacterMessage={showCharacterMessage}
            />
          )}

          {/* Coordinates indicator at bottom-right with large image next to it */}
          {selectedHuarique && selectedHuarique.coordenadas && !isRegisterMode && (
            <div style={{ position: 'absolute', bottom: '15px', right: '15px', zIndex: 1010, display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
              
              <div style={{ position: 'relative' }}>
                {characterMessage && (
                  <div key={characterMessage} className="fade-in" style={{
                    position: 'absolute',
                    bottom: '100%',
                    right: '0',
                    transform: 'translateY(-10px)',
                    background: 'white',
                    border: '2px solid var(--peru-red-bright, #bd2d2d)',
                    borderRadius: '12px',
                    borderBottomRightRadius: '0',
                    padding: '10px 14px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'var(--map-text-dark, #110906)',
                    width: 'max-content',
                    maxWidth: '180px',
                    textAlign: 'center',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                    zIndex: 1011,
                    fontFamily: "'Outfit', sans-serif"
                  }}>
                    {characterMessage}
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: '15px',
                      width: '0',
                      height: '0',
                      borderLeft: '8px solid transparent',
                      borderRight: '8px solid transparent',
                      borderTop: '10px solid var(--peru-red-bright, #bd2d2d)'
                    }} />
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: '17px',
                      width: '0',
                      height: '0',
                      borderLeft: '6px solid transparent',
                      borderRight: '6px solid transparent',
                      borderTop: '8px solid white'
                    }} />
                  </div>
                )}
                <img src={mapahuariqueImg} alt="Mapa Huarique" style={{ height: '140px', width: 'auto', marginBottom: '-5px', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.2))' }} />
              </div>

              <div className="map-center-coordinates" style={{ position: 'relative', bottom: 'auto', right: 'auto' }}>
                Ubicación: {selectedHuarique.coordenadas.coordinates[1].toFixed(6)}° N, {selectedHuarique.coordenadas.coordinates[0].toFixed(6)}° W
              </div>
            </div>
          )}
        
          {/* Coordinates indicator at bottom-right */}
          {isRegisterMode && (
            <div className="map-center-coordinates register-help-banner" style={{ zIndex: 1010 }}>
              {regCoordinates 
                ? '📍 Ubicación seleccionada. Arrastra el pin rojo si necesitas reajustarlo.' 
                : '👈 Haz clic en cualquier lugar del mapa para fijar el huarique.'
              }
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
