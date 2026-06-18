import { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './MapShell.css';

interface PointGeometry {
  type: 'Point';
  coordinates: number[]; // [longitud, latitud]
}

interface Resena {
  usuarioId: string;
  usuarioNombre: string;
  comentario: string;
  calificacion: number;
  fecha: string | Date;
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
    horario: 'Mar - Dom: 11:00 AM - 4:30 PM',
    votosExiste: ['correo1@gmail.com', 'correo2@gmail.com', 'gaston@huarique.pe'],
    votosNoExiste: [],
    resenas: [
      { usuarioId: 'correo1@gmail.com', usuarioNombre: 'Sandra P.', comentario: 'El ceviche de carretilla más fresco y picante de la zona. Se agota rápido.', calificacion: 5, fecha: '2026-06-16T12:00:00Z' },
      { usuarioId: 'correo2@gmail.com', usuarioNombre: 'Carlos M.', comentario: 'Buenísimo y generoso, aunque la cola avanza lento.', calificacion: 4, fecha: '2026-06-18T14:30:00Z' }
    ],
    ratingPromedio: 4.5,
    numResenas: 2
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
    horario: 'Lun - Sáb: 6:00 PM - 11:30 PM',
    votosExiste: ['correo1@gmail.com', 'correo3@gmail.com'],
    votosNoExiste: ['correo4@gmail.com'],
    resenas: [
      { usuarioId: 'correo1@gmail.com', usuarioNombre: 'Sandra P.', comentario: 'El sabor del carbón es perfecto y el ají carretillero pica riquísimo.', calificacion: 5, fecha: '2026-06-15T19:00:00Z' }
    ],
    ratingPromedio: 5.0,
    numResenas: 1
  },
  {
    _id: 'fallback-3',
    nombre: 'El Rinconcito Lomeño',
    descripcion: 'Especialistas en lomo saltado ahumado al wok con cebolla crujiente, tomates jugosos y papas nativas amarillas fritas al instante.',
    tipoComida: 'Fusión',
    coordenadas: {
      type: 'Point',
      coordinates: [-77.036886, -12.046374] // Centro de Lima
    },
    horario: 'Lun - Dom: 12:00 PM - 10:00 PM',
    votosExiste: ['gaston@huarique.pe'],
    votosNoExiste: [],
    resenas: [
      { usuarioId: 'gaston@huarique.pe', usuarioNombre: 'Gastón Acurio', comentario: 'Espectacular flambeado en wok. El jugo es perfecto para mojar las papas.', calificacion: 5, fecha: '2026-06-14T13:00:00Z' }
    ],
    ratingPromedio: 5.0,
    numResenas: 1
  },
  {
    _id: 'fallback-4',
    nombre: 'El Huarique de la Tía Veneno',
    descripcion: 'Las mejores hamburguesas al paso y salchipapas de Lima.',
    tipoComida: 'Comida Rápida',
    coordenadas: {
      type: 'Point',
      coordinates: [-77.0358, -12.0825] // Lince
    },
    horario: 'Lun-Sab: 18:00 - 23:00',
    votosExiste: ['correo1@gmail.com', 'correo2@gmail.com', 'correo3@gmail.com', 'correo4@gmail.com'],
    votosNoExiste: [],
    resenas: [
      { usuarioId: 'correo3@gmail.com', usuarioNombre: 'Miguel T.', comentario: 'Clásica hamburguesa de la tía. Un salvavidas de madrugada.', calificacion: 4, fecha: '2026-06-10T23:30:00Z' }
    ],
    ratingPromedio: 4.0,
    numResenas: 1
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
    horario: 'Mar-Dom: 11:30 - 16:30',
    votosExiste: [],
    votosNoExiste: [],
    resenas: [],
    ratingPromedio: 0,
    numResenas: 0
  }
];

const CATEGORIES = ['Todos', 'Marina', 'Criolla', 'Fusión', 'Comida Rápida', 'Pollerías', 'Chifas', 'Amazónica', 'Picanterías', 'Postres'];

interface User {
  nombre: string;
  email?: string;
  token?: string | null;
  isLocal?: boolean;
}

interface MapShellProps {
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;
  user: User | null;
  onAuthClick: () => void;
}

export default function MapShell({ isConnected, setIsConnected, user, onAuthClick }: MapShellProps) {
  const [huariques, setHuariques] = useState<Huarique[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de filtros
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');

  // Estados de Registro Crowdsourcing
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [regNombre, setRegNombre] = useState('');
  const [regDescripcion, setRegDescripcion] = useState('');
  const [regTipoComida, setRegTipoComida] = useState('Marina');
  const [regHorario, setRegHorario] = useState('');
  const [regCoordinates, setRegCoordinates] = useState<[number, number] | null>(null); // [lat, lng]

  // Estados de Reseñas
  const [newReviewRating, setNewReviewRating] = useState<number>(5);
  const [newReviewComment, setNewReviewComment] = useState<string>('');

  const filterBarRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const regMarkerRef = useRef<L.Marker | null>(null);

  const scrollFilterBar = (direction: 'left' | 'right') => {
    if (filterBarRef.current) {
      const scrollAmount = 150;
      filterBarRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Cargar huariques desde API o localStorage o datos de respaldo
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
        
        // Cargar huariques locales guardados (para persistir crowdsourcing local)
        const localData = localStorage.getItem('local_huariques');
        let combinedData = data;
        if (localData) {
          try {
            const parsedLocals = JSON.parse(localData);
            // Evitar duplicados por ID si la API ya los tiene
            const apiIds = new Set(data.map((h: any) => h._id));
            const uniqueLocals = parsedLocals.filter((h: any) => !apiIds.has(h._id));
            combinedData = [...uniqueLocals, ...data];
          } catch (e) {
            console.error('Error al parsear huariques locales:', e);
          }
        }

        if (combinedData && combinedData.length > 0) {
          setHuariques(combinedData);
          setIsConnected(true);
          setError(null);
          setSelectedId(combinedData[0]._id);
        } else {
          setHuariques(FALLBACK_HUARIQUES);
          setIsConnected(true);
          setError(null);
          setSelectedId(FALLBACK_HUARIQUES[0]._id);
        }
      } catch (err: any) {
        console.warn('Error conectando al API, usando huariques locales/respaldo:', err);
        const localData = localStorage.getItem('local_huariques');
        if (localData) {
          try {
            setHuariques(JSON.parse(localData));
            setSelectedId(JSON.parse(localData)[0]?._id);
          } catch (e) {
            setHuariques(FALLBACK_HUARIQUES);
            setSelectedId(FALLBACK_HUARIQUES[0]._id);
          }
        } else {
          setHuariques(FALLBACK_HUARIQUES);
          setSelectedId(FALLBACK_HUARIQUES[0]._id);
        }
        setError('Sin conexión al backend NestJS. Mostrando huariques de respaldo locales.');
        setIsConnected(false);
      } finally {
        setLoading(false);
      }
    };

    fetchHuariques();
  }, [setIsConnected]);

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

  // Escuchar clics en el mapa en modo registro
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (!isRegisterMode) {
      if (regMarkerRef.current) {
        regMarkerRef.current.remove();
        regMarkerRef.current = null;
      }
      setRegCoordinates(null);
      return;
    }

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      setRegCoordinates([lat, lng]);
    };

    map.on('click', handleMapClick);

    return () => {
      map.off('click', handleMapClick);
    };
  }, [isRegisterMode]);

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
        iconSize: [30, 42],
        iconAnchor: [15, 42]
      });

      const marker = L.marker([lat, lng], { icon: regIcon, draggable: true }).addTo(map);
      
      marker.on('dragend', () => {
        const position = marker.getLatLng();
        setRegCoordinates([position.lat, position.lng]);
      });

      regMarkerRef.current = marker;
      map.panTo([lat, lng]);
    }
  }, [regCoordinates, isRegisterMode]);

  // Resetear estados de reseña al cambiar de huarique seleccionado
  useEffect(() => {
    setNewReviewRating(5);
    setNewReviewComment('');
  }, [selectedId]);

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

  // Actualizar marcadores cuando cambian los huariques filtrados o la selección
  useEffect(() => {
    if (!mapInstanceRef.current || !markersGroupRef.current) return;

    // Limpiar marcadores anteriores
    markersGroupRef.current.clearLayers();

    filteredHuariques.forEach((h) => {
      if (!h.coordenadas || !h.coordenadas.coordinates || h.coordenadas.coordinates.length < 2) return;

      const [lng, lat] = h.coordenadas.coordinates;
      const isActive = selectedId === h._id;
      const rating = h.ratingPromedio || 0;
      const totalReviews = h.numResenas || 0;

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
        <div class="leaflet-popup-content-inner" style="font-family: 'Outfit', sans-serif; min-width: 155px;">
          <strong style="color: #110906; font-size: 14px; display: block; margin-bottom: 2px;">${h.nombre}</strong>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 11px; color: #bd2d2d; font-weight: 600;">${h.tipoComida}</span>
            <span style="font-size: 11px; color: #eab308; font-weight: 600;">★ ${rating > 0 ? rating.toFixed(1) : 'S/R'}</span>
          </div>
          <div style="font-size: 11px; display: flex; align-items: center; gap: 4px; color: #64748b;">
            <span>💬 ${totalReviews} reseñas comunitarias</span>
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
  }, [filteredHuariques, selectedId]);

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

  // Manejar Registro de nuevo huarique
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regNombre || !regTipoComida || !regCoordinates) {
      alert('Por favor, completa los campos obligatorios y marca la ubicación exacta en el mapa.');
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
      alert('¡Huarique registrado con éxito de forma local!');
    }
  };

  const resetRegisterForm = () => {
    setRegNombre('');
    setRegDescripcion('');
    setRegTipoComida('Marina');
    setRegHorario('');
    setRegCoordinates(null);
  };

  // Manejar el Voto de Existencia (Validación)
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
        alert(`Error al guardar validación: ${err.message}`);
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

  // Manejar el Envío de Reseña
  const handleAddReviewSubmit = async (e: React.FormEvent, huariqueId: string) => {
    e.preventDefault();
    if (!newReviewComment.trim()) return;

    if (isConnected && user?.token && !user.isLocal) {
      // Enviar reseña a API
      const apiUrl = import.meta.env.VITE_API_URL as string;
      try {
        const response = await fetch(`${apiUrl}/huariques/${huariqueId}/resenas`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify({
            comentario: newReviewComment,
            calificacion: newReviewRating
          })
        });

        if (!response.ok) {
          throw new Error('Error al guardar la reseña en el servidor.');
        }

        const updatedHuarique = await response.json();
        setHuariques(prev => prev.map(h => h._id === huariqueId ? updatedHuarique : h));
        setNewReviewComment('');
        setNewReviewRating(5);
      } catch (err: any) {
        alert(`Error al guardar reseña: ${err.message}`);
      }
    } else {
      // Guardar reseña localmente
      const userIdentifier = user?.email || user?.nombre || 'local_user';
      const userDisplayName = user?.nombre || 'Usuario Local';

      const updatedList = huariques.map(h => {
        if (h._id !== huariqueId) return h;

        const resenas = h.resenas || [];
        const nuevaRes: Resena = {
          usuarioId: userIdentifier,
          usuarioNombre: userDisplayName,
          comentario: newReviewComment,
          calificacion: newReviewRating,
          fecha: new Date().toISOString()
        };

        const updatedResenas = [...resenas, nuevaRes];
        const totalCalificacion = updatedResenas.reduce((sum, r) => sum + r.calificacion, 0);
        const numResenas = updatedResenas.length;
        const ratingPromedio = Math.round((totalCalificacion / numResenas) * 10) / 10;

        return {
          ...h,
          resenas: updatedResenas,
          numResenas,
          ratingPromedio
        };
      });

      setHuariques(updatedList);
      localStorage.setItem('local_huariques', JSON.stringify(updatedList));
      setNewReviewComment('');
      setNewReviewRating(5);
      alert('¡Reseña guardada localmente!');
    }
  };

  // Helper para renderizar estrellas fijas
  const renderStars = (rating: number) => {
    const stars = [];
    const rounded = Math.round(rating);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star-icon ${i <= rounded ? 'filled' : 'empty'}`}>
          ★
        </span>
      );
    }
    return stars;
  };

  const selectedHuarique = huariques.find((h) => h._id === selectedId);

  // Calcular métricas de validación
  const votosExisteCount = selectedHuarique?.votosExiste?.length || 0;
  const votosNoExisteCount = selectedHuarique?.votosNoExiste?.length || 0;
  const votosTotales = votosExisteCount + votosNoExisteCount;
  const existenciaPercent = votosTotales > 0 ? Math.round((votosExisteCount / votosTotales) * 100) : 100;

  const currentUserId = user ? (user.email || user.nombre) : null;
  const haVotadoExiste = currentUserId && selectedHuarique?.votosExiste ? selectedHuarique.votosExiste.includes(currentUserId) : false;
  const haVotadoNoExiste = currentUserId && selectedHuarique?.votosNoExiste ? selectedHuarique.votosNoExiste.includes(currentUserId) : false;

  return (
    <div className="dashboard-container">
      {/* Main Content Area */}
      <div className="dashboard-content">
        {/* Sidebar */}
        <aside className="sidebar">
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

              <ul className="huariques-list">
                {filteredHuariques.map((h) => (
                  <li
                    key={h._id}
                    className={`huarique-item ${selectedId === h._id ? 'active' : ''}`}
                    onClick={() => setSelectedId(h._id)}
                  >
                    <div className="huarique-item-header">
                      <h3 className="huarique-name">{h.nombre}</h3>
                    </div>
                    <div className="huarique-tags-row">
                      <span className="huarique-tag">{h.tipoComida}</span>
                      {h.ratingPromedio !== undefined && h.ratingPromedio > 0 ? (
                        <span className="huarique-rating-badge">★ {h.ratingPromedio.toFixed(1)} ({h.numResenas || 0})</span>
                      ) : (
                        <span className="huarique-rating-badge" style={{ background: 'rgba(100, 116, 139, 0.08)', color: '#64748b', borderColor: 'transparent' }}>Sin reseñas</span>
                      )}
                    </div>
                    <p className="huarique-desc">{h.descripcion}</p>
                    <div className="huarique-meta">
                      <span>Horario: {h.horario || 'No especificado'}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </aside>

        {/* Real Leaflet Map Viewport */}
        <section className="map-shell">
          <div id="map-container" ref={mapContainerRef} style={{ width: '100%', height: '100%', zIndex: 1 }} />

          

          {/* Detailed Overlay Card for selected Huarique */}
          {selectedHuarique && !isRegisterMode && (
            <div className="detail-overlay" style={{ zIndex: 1010 }}>
              <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                <span>{selectedHuarique.nombre}</span>
              </h3>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                <span className="huarique-tag">{selectedHuarique.tipoComida}</span>
                {selectedHuarique.ratingPromedio !== undefined && selectedHuarique.ratingPromedio > 0 && (
                  <span className="huarique-rating-badge">★ {selectedHuarique.ratingPromedio.toFixed(1)} ({selectedHuarique.numResenas} reseñas)</span>
                )}
                {selectedHuarique.creadoPor && (
                  <span className="huarique-creator-badge">Colaborador: {selectedHuarique.creadoPor}</span>
                )}
              </div>
              <p className="huarique-detail-desc">{selectedHuarique.descripcion}</p>

              <div className="detail-row" style={{ marginBottom: '16px' }}>
                <span className="detail-label">Horario:</span>
                <span>{selectedHuarique.horario || 'No especificado'}</span>
              </div>

              {/* 1. Sistema de Validación de Existencia de la Comunidad */}
              <div className="validation-container">
                <div className="validation-header">
                  <span className="validation-title">¿Este huarique existe y atiende?</span>
                  <span className="validation-badge" style={{ backgroundColor: existenciaPercent >= 70 ? '#10b981' : '#f59e0b' }}>
                    {existenciaPercent >= 70 ? 'Verificado' : 'Bajo revisión'}
                  </span>
                </div>
                <div className="validation-bar-container">
                  <div 
                    className="validation-bar" 
                    style={{ 
                      width: `${existenciaPercent}%`,
                      backgroundColor: existenciaPercent >= 75 ? '#10b981' : existenciaPercent >= 45 ? '#f59e0b' : '#ef4444' 
                    }} 
                  />
                </div>
                <div className="validation-info-row">
                  <span>{existenciaPercent}% de confirmación ({votosTotales} votos)</span>
                </div>
                <div className="validation-buttons">
                  <button 
                    onClick={() => handleVoteExistence(selectedHuarique._id, true)} 
                    className={`val-btn val-btn-yes ${haVotadoExiste ? 'active' : ''}`}
                    title="Confirmar que el huarique existe"
                  >
                    👍 Sí existe ({votosExisteCount})
                  </button>
                  <button 
                    onClick={() => handleVoteExistence(selectedHuarique._id, false)} 
                    className={`val-btn val-btn-no ${haVotadoNoExiste ? 'active' : ''}`}
                    title="Reportar que el huarique no existe o cerró"
                  >
                    👎 No existe ({votosNoExisteCount})
                  </button>
                </div>
              </div>

              {/* 2. Sistema de Reseñas y Calificaciones */}
              <div className="reviews-container">
                <h4 className="reviews-title">Comentarios y Calificaciones</h4>
                
                {/* Listado de reseñas */}
                <div className="reviews-scroller">
                  {(!selectedHuarique.resenas || selectedHuarique.resenas.length === 0) ? (
                    <p className="no-reviews-text">Aún no hay reseñas de este huarique. ¡Sé el primero en calificarlo!</p>
                  ) : (
                    <div className="reviews-list">
                      {selectedHuarique.resenas.map((r, idx) => (
                        <div key={idx} className="review-card">
                          <div className="review-card-header">
                            <span className="review-user">{r.usuarioNombre}</span>
                            <span className="review-date">{new Date(r.fecha).toLocaleDateString()}</span>
                          </div>
                          <div className="review-stars-row">
                            {renderStars(r.calificacion)}
                          </div>
                          <p className="review-comment-text">{r.comentario}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Formulario de envío de reseñas */}
                {user ? (
                  <form onSubmit={(e) => handleAddReviewSubmit(e, selectedHuarique._id)} className="review-form">
                    <div className="review-rating-selector">
                      <span>Tu Calificación:</span>
                      <div className="review-star-picker">
                        {[1, 2, 3, 4, 5].map((starVal) => (
                          <button
                            type="button"
                            key={starVal}
                            onClick={() => setNewReviewRating(starVal)}
                            className={`star-picker-btn ${newReviewRating >= starVal ? 'selected' : ''}`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="review-input-row">
                      <input
                        type="text"
                        required
                        placeholder="Escribe tu opinión sobre la comida, precio, etc."
                        value={newReviewComment}
                        onChange={(e) => setNewReviewComment(e.target.value)}
                        className="review-input-field"
                      />
                      <button type="submit" className="review-submit-btn">Enviar</button>
                    </div>
                  </form>
                ) : (
                  <div className="review-login-prompt" onClick={onAuthClick}>
                    🔒 Inicia sesión para calificar y dejar una reseña
                  </div>
                )}
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
