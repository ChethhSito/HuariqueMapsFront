import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import './MapShell.css';
import AddHuariqueForm from './Map/AddHuariqueForm';
import MapSidebarList from './Map/MapSidebarList';
import mapahuariqueImg from '../assets/mapahuarique.png';
import { FALLBACK_HUARIQUES, CATEGORIES } from '../data/constants';

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
  const [huariques, setHuariques] = useState<Huarique[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de filtros y likes
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [likesMap, setLikesMap] = useState<{ [id: string]: number }>({});
  const [characterMessage, setCharacterMessage] = useState<string | null>(null);

  // Estados de Registro Crowdsourcing
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [regNombre, setRegNombre] = useState('');
  const [regDescripcion, setRegDescripcion] = useState('');
  const [regTipoComida, setRegTipoComida] = useState('Marina');
  const [regHorario, setRegHorario] = useState('');
  const [regCoordinates, setRegCoordinates] = useState<[number, number] | null>(null); // [lat, lng]

  const characterMessageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showCharacterMessage = (msg: string) => {
    setCharacterMessage(msg);
    if (characterMessageTimeoutRef.current) {
      clearTimeout(characterMessageTimeoutRef.current);
    }
    characterMessageTimeoutRef.current = setTimeout(() => {
      setCharacterMessage(null);
    }, 4000);
  };

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
  const routingControlRef = useRef<any>(null);
  const regMarkerRef = useRef<L.Marker | null>(null);

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
          <div style="font-size: 11px; margin-top: 6px; display: flex; align-items: center; justify-content: space-between; gap: 4px; color: #64748b;">
            <div>
              <span>❤️ ${likesCount} likes</span>
              ${hasUserLiked ? '<strong style="color: #bd2d2d; font-size: 10px;">(Liked)</strong>' : ''}
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

  // Manejar el toggle de like
  const handleToggleLike = (id: string) => {
    if (!user) {
      onAuthClick();
      return;
    }

    const isLiked = !!myLikesMap[id];
    const newMyLikes = { ...myLikesMap, [id]: !isLiked };
    const newLikes = { ...likesMap, [id]: (likesMap[id] || 0) + (isLiked ? -1 : 1) };

    if (!isLiked) {
      showCharacterMessage("¡Buenazo! Gracias por tu like, causa.");
    } else {
      showCharacterMessage("¡Uy! Le quitaste el like.");
    }

    setMyLikesMap(newMyLikes);
    setLikesMap(newLikes);

    localStorage.setItem('huariques_my_likes_map', JSON.stringify(newMyLikes));
    localStorage.setItem('huariques_likes_map', JSON.stringify(newLikes));
  };

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

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNombre || !regTipoComida || !regCoordinates) {
      alert('Por favor, completa los campos obligatorios y marca la ubicaci├│n exacta en el mapa.');
      return;
    }

    const newHuariqueData = {
      nombre: regNombre,
      descripcion: regDescripcion,
      tipoComida: regTipoComida,
      coordenadas: {
        type: 'Point' as const,
        coordinates: [regCoordinates[1], regCoordinates[0]] // [longitud, latitud]
      },
      horario: regHorario
    };

    if (isConnected && user?.token && !user.isLocal) {
      // Enviar al API backend (NestJS)
      const apiUrl = import.meta.env.VITE_API_URL as string;
      try {
        const response = await fetch(`${apiUrl}/huariques`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify(newHuariqueData)
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || 'Error al registrar el huarique');
        }

        const registeredHuarique = await response.json();
        
        // Agregar valores iniciales por defecto si no vienen
        const fullHuarique: Huarique = {
          ...registeredHuarique,
          votosExiste: registeredHuarique.votosExiste || [],
          votosNoExiste: registeredHuarique.votosNoExiste || [],
          resenas: registeredHuarique.resenas || [],
          ratingPromedio: registeredHuarique.ratingPromedio || 0,
          numResenas: registeredHuarique.numResenas || 0
        };

        const updatedHuariques = [fullHuarique, ...huariques];
        setHuariques(updatedHuariques);
        setSelectedId(fullHuarique._id);
        setIsRegisterMode(false);
        resetRegisterForm();
      } catch (err: any) {
        alert(`Error al registrar en servidor remoto: ${err.message}`);
      }
    } else {
      // Guardado local (modo local/respaldo)
      const localId = `local-${Date.now()}`;
      const userIdentifier = user?.email || user?.nombre || 'usuario_local';
      
      const newLocalHuarique: Huarique = {
        _id: localId,
        ...newHuariqueData,
        creadoPor: user?.nombre || 'Usuario Local',
        votosExiste: [userIdentifier],
        votosNoExiste: [],
        resenas: [],
        ratingPromedio: 0,
        numResenas: 0
      };

      const updatedList = [newLocalHuarique, ...huariques];
      setHuariques(updatedList);
      localStorage.setItem('local_huariques', JSON.stringify(updatedList));
      setSelectedId(localId);
      setIsRegisterMode(false);
      resetRegisterForm();
      alert('┬íHuarique registrado con ├®xito de forma local!');
    }
  };

  const resetRegisterForm = () => {
    setRegNombre('');
    setRegDescripcion('');
    setRegTipoComida('Marina');
    setRegHorario('');
    setRegCoordinates(null);
  };

  // Manejar el Voto de Existencia (Validaci├│n)
  const handleVoteExistence = async (huariqueId: string, existe: boolean) => {
    if (!user) {
      onAuthClick();
      return;
    }

    const userIdentifier = user.email || user.nombre;

    if (isConnected && user.token && !user.isLocal) {
      // Votar en backend
      const apiUrl = import.meta.env.VITE_API_URL as string;
      try {
        const response = await fetch(`${apiUrl}/huariques/${huariqueId}/validar`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify({ existe })
        });

        if (!response.ok) {
          throw new Error('Error al enviar el voto al servidor.');
        }

        const updatedHuarique = await response.json();
        setHuariques(prev => prev.map(h => h._id === huariqueId ? updatedHuarique : h));
      } catch (err: any) {
        alert(`Error al guardar validaci├│n: ${err.message}`);
      }
    } else {
      // Votar de forma local (Offline/Local)
      const updatedList = huariques.map(h => {
        if (h._id !== huariqueId) return h;

        let votosExiste = h.votosExiste || [];
        let votosNoExiste = h.votosNoExiste || [];

        // Limpiar votos anteriores de este usuario
        votosExiste = votosExiste.filter(uid => uid !== userIdentifier);
        votosNoExiste = votosNoExiste.filter(uid => uid !== userIdentifier);

        if (existe) {
          votosExiste.push(userIdentifier);
        } else {
          votosNoExiste.push(userIdentifier);
        }

        return { ...h, votosExiste, votosNoExiste };
      });

      setHuariques(updatedList);
      localStorage.setItem('local_huariques', JSON.stringify(updatedList));
    }
  };

const selectedHuarique = huariques.find((h) => h._id === selectedId);

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

              {/* 1. Sistema de Validación de Existencia */}
              <div className="validation-container" style={{ background: 'rgba(100, 116, 139, 0.03)', borderRadius: '8px', padding: '12px', marginBottom: '16px', border: '1px solid var(--map-border)' }}>
                <div className="validation-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="validation-title" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--peru-text-dark)' }}>Comunidad: ¿Sigue existiendo?</span>
                  {(() => {
                    const totalVotes = (selectedHuarique.votosExiste?.length || 0) + (selectedHuarique.votosNoExiste?.length || 0);
                    const yesVotes = selectedHuarique.votosExiste?.length || 0;
                    const percentage = totalVotes === 0 ? 0 : Math.round((yesVotes / totalVotes) * 100);
                    
                    let badgeColor = '#94a3b8'; // gray
                    let badgeText = 'Sin votos';
                    if (totalVotes > 0) {
                      if (percentage >= 70) { badgeColor = '#059669'; badgeText = 'Verificado'; } // dark green
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
                        <div className="validation-bar" style={{ height: '100%', borderRadius: '3px', transition: 'width 0.4s ease', width: `${percentage}%`, background: percentage >= 50 || totalVotes === 0 ? '#059669' : '#ef4444' }}></div>
                      </div>
                      <div className="validation-info-row" style={{ fontSize: '11px', color: '#64748b', textAlign: 'right', marginBottom: '10px', fontWeight: 500 }}>
                        {yesVotes} confirman • {noVotes} niegan
                      </div>
                    </>
                  );
                })()}

                <div className="validation-buttons" style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    className={`val-btn val-btn-yes ${(selectedHuarique.votosExiste || []).includes(user?.email || user?.nombre || '') ? 'active' : ''}`}
                    onClick={() => handleVoteExistence(selectedHuarique._id, true)}
                    style={{ flex: 1, padding: '8px 10px', borderRadius: '8px', border: '1px solid #059669', background: (selectedHuarique.votosExiste || []).includes(user?.email || user?.nombre || '') ? '#059669' : 'transparent', color: (selectedHuarique.votosExiste || []).includes(user?.email || user?.nombre || '') ? '#fff' : '#059669', cursor: 'pointer', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s' }}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                    Sí existe
                  </button>
                  <button 
                    className={`val-btn val-btn-no ${(selectedHuarique.votosNoExiste || []).includes(user?.email || user?.nombre || '') ? 'active' : ''}`}
                    onClick={() => handleVoteExistence(selectedHuarique._id, false)}
                    style={{ flex: 1, padding: '8px 10px', borderRadius: '8px', border: '1px solid #ef4444', background: (selectedHuarique.votosNoExiste || []).includes(user?.email || user?.nombre || '') ? '#ef4444' : 'transparent', color: (selectedHuarique.votosNoExiste || []).includes(user?.email || user?.nombre || '') ? '#fff' : '#ef4444', cursor: 'pointer', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s' }}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path></svg>
                    Ya cerró
                  </button>
                </div>
              </div>




              {/* Acción rápida: Likes y Detalles */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button
                  className={`like-button ${myLikesMap[selectedHuarique._id] ? 'liked' : ''}`}
                  onClick={() => handleToggleLike(selectedHuarique._id)}
                  style={{ flex: 1, marginTop: 0 }}
                >
                  <svg className="heart-icon" viewBox="0 0 24 24" width="16" height="16">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  <span>
                    {myLikesMap[selectedHuarique._id] ? '¡Te gusta!' : 'Me Gusta'} ({likesMap[selectedHuarique._id] || 0})
                  </span>
                </button>

                <button
                  className="guide-button"
                  style={{ flex: 1, marginTop: 0, background: '#ea580c', color: 'white', border: 'none', animation: 'none' }}
                  onClick={() => onViewDetail && onViewDetail(selectedHuarique)}
                  title="Ver toda la información y comentarios de este Huarique"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" style={{ fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                  Más información
                </button>
              </div>

              {/* Guíame al lugar Button */}
              <button
                className="guide-button"
                onClick={() => handleGuideMe(selectedHuarique)}
                title="Ver rutas en este mapa"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" style={{ fill: 'currentColor' }}>
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                Ver rutas
              </button>

              {/* Google Maps Button for Buses and Navigation */}
              <button
                className="guide-button"
                style={{ marginTop: '8px', background: '#f8fafc', borderColor: '#cbd5e1', color: '#334155' }}
                onClick={() => {
                  showCharacterMessage("¡Abriendo Google Maps, fíjate qué bus tomar!");
                  const [lng, lat] = selectedHuarique.coordenadas.coordinates;
                  window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=transit`, '_blank');
                }}
                title="Abrir en Google Maps para ver buses e indicaciones paso a paso"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" style={{ fill: 'currentColor' }}>
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" />
                </svg>
                Navegar y ver buses (G. Maps)
              </button>
            </div>
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
