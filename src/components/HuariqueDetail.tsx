import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './HuariqueDetail.css';
import comunidadImg from '../assets/comunidadHuarique.png';

interface PointGeometry {
  type: 'Point';
  coordinates: number[]; // [longitud, latitud]
}

export interface Huarique {
  _id: string;
  nombre: string;
  descripcion: string;
  tipoComida: string;
  coordenadas: PointGeometry;
  horario: string;
  direccion?: string;
}

interface User {
  nombre: string;
  email?: string;
  token?: string | null;
  isLocal?: boolean;
}

interface HuariqueDetailProps {
  huarique: Huarique;
  onBack: () => void;
  likesCount: number;
  user?: User | null;
  onAuthClick?: () => void;
}

const UserIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const ClockIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="#fbbf24" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '2px' }}>
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);

const EditIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
    <path d="M12 20h9"></path>
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
  </svg>
);

// Comentarios simulados
const FAKE_COMMENTS = [
  { id: 1, user: 'Juan Pérez', text: '¡Excelente lugar! La comida tiene un sabor casero increíble, muy recomendado.', rating: 5, date: 'Hace 2 días', likes: 12, likedByMe: false },
  { id: 2, user: 'María González', text: 'El ambiente es un poco ruidoso, pero la sazón vale la pena totalmente. Volveré.', rating: 4, date: 'Hace 1 semana', likes: 8, likedByMe: true },
  { id: 3, user: 'Carlos M.', text: 'El mejor point para ir con la mancha el fin de semana. Precios justos.', rating: 5, date: 'Hace 2 semanas', likes: 4, likedByMe: false },
  { id: 4, user: 'Lucía F.', text: 'La comida nunca decepciona, siempre todo calentito y buenazo.', rating: 5, date: 'Hace 3 semanas', likes: 21, likedByMe: false },
  { id: 5, user: 'Pedro S.', text: 'Un clásico de Lima. Las cremas son espectaculares.', rating: 5, date: 'Hace 1 mes', likes: 5, likedByMe: false },
  { id: 6, user: 'Ana T.', text: 'Fui por primera vez y me encantó, aunque hay que hacer fila a veces.', rating: 4, date: 'Hace 1 mes', likes: 2, likedByMe: false },
];

export default function HuariqueDetail({ huarique, onBack, likesCount, user, onAuthClick }: HuariqueDetailProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(FAKE_COMMENTS);
  const [showAllComments, setShowAllComments] = useState(false);
  const [isCommentDrawerOpen, setIsCommentDrawerOpen] = useState(false);
  const [address, setAddress] = useState<string>('Cargando dirección...');
  const [characterMessage, setCharacterMessage] = useState<string | null>(null);
  const messageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showCharacterMessage = (msg: string) => {
    setCharacterMessage(msg);
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    messageTimeoutRef.current = setTimeout(() => {
      setCharacterMessage(null);
    }, 5000); // 5 seconds
  };

  // Mensaje de bienvenida
  useEffect(() => {
    showCharacterMessage('¡Revisa los comentarios y anímate a dejar el tuyo, causa!');
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
    };
  }, []);

  // Cargar dirección real a partir de coordenadas si no hay una dada
  useEffect(() => {
    if (huarique.direccion) {
      setAddress(huarique.direccion);
      return;
    }
    const [lng, lat] = huarique.coordenadas.coordinates;
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
      .then(res => res.json())
      .then(data => {
        if (data && data.address) {
          const street = data.address.road || data.address.pedestrian || data.address.suburb || 'Calle sin nombre';
          const city = data.address.city || data.address.town || data.address.village || '';
          setAddress(`${street}${city ? `, ${city}` : ''}`);
        } else {
          setAddress('Ubicación en el mapa');
        }
      })
      .catch(() => setAddress('Ubicación en el mapa'));
  }, [huarique]);

  // Inicializar mapa estático
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const [lng, lat] = huarique.coordenadas.coordinates;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      dragging: false, // Desactiva arrastrar
      scrollWheelZoom: false,
      doubleClickZoom: false,
      boxZoom: false,
      keyboard: false,
      touchZoom: false
    }).setView([lat, lng], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    // Añadir el marcador estático
    const customIcon = L.divIcon({
      className: 'custom-static-marker',
      html: `
        <div class="marker-wrapper">
          <div class="marker-pin-head">
            <div class="marker-pin-dot"></div>
          </div>
          <div class="marker-pin-tip"></div>
        </div>
      `,
      iconSize: [30, 42],
      iconAnchor: [15, 42]
    });

    L.marker([lat, lng], { icon: customIcon, interactive: false }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [huarique]);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const added = {
      id: Date.now(),
      user: user?.nombre || 'Tú (Usuario)',
      text: newComment,
      rating: 5,
      date: 'Justo ahora',
      likes: 0,
      likedByMe: false
    };

    setComments([added, ...comments]);
    setNewComment('');
    setIsCommentDrawerOpen(false);
    showCharacterMessage('¡Comentario publicado, buenazo!');
  };

  const handleToggleLike = (id: number) => {
    let isLiking = false;
    setComments(comments.map(c => {
      if (c.id === id) {
        isLiking = !c.likedByMe;
        return {
          ...c,
          likes: c.likedByMe ? c.likes - 1 : c.likes + 1,
          likedByMe: !c.likedByMe
        };
      }
      return c;
    }));
    if (isLiking) {
      showCharacterMessage('¡Gracias por darle amor a este comentario!');
    }
  };

  const handleFabClick = () => {
    if (!user && onAuthClick) {
      onAuthClick();
    } else {
      setIsCommentDrawerOpen(true);
    }
  };

  return (
    <div className="detail-page-container fade-in-slide">
      {/* Breadcrumbs / Navbar Interna */}
      <div className="detail-breadcrumbs">
        <button className="breadcrumb-back-btn" onClick={onBack}>
          <svg viewBox="0 0 24 24" width="20" height="20" style={{ fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Volver al Mapa
        </button>
        <span className="breadcrumb-separator">/</span>
        <span className="breadcrumb-current">{huarique.nombre}</span>
      </div>

      <div className="detail-content-layout">
        
        {/* Columna Izquierda: Info e Imagen */}
        <div className="detail-left-col">
          <div className="detail-card info-card">
            <div className="detail-header-flex">
              <h1 className="detail-title">{huarique.nombre}</h1>
              <div 
                className="detail-likes-badge" 
                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => showCharacterMessage('¡Gracias por apoyar este huarique, causa!')}
              >
                <HeartIcon /> {likesCount} Likes
              </div>
            </div>
            <span className="detail-tag">{huarique.tipoComida}</span>
            <p className="detail-description">{huarique.descripcion}</p>
            
            <div className="detail-meta-box">
              <div className="meta-item">
                <span className="meta-icon" style={{ color: 'var(--peru-red)' }}><ClockIcon /></span>
                <div className="meta-text">
                  <strong>Horario de Atención</strong>
                  <span>{huarique.horario || 'Horario no especificado'}</span>
                </div>
              </div>
              <div className="meta-item">
                <span className="meta-icon" style={{ color: 'var(--peru-red)' }}><MapPinIcon /></span>
                <div className="meta-text">
                  <strong>Dirección / Ubicación</strong>
                  <span>{address}</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', background: 'transparent', border: 'none', boxShadow: 'none', margin: '20px -30px 0 -30px' }}>
            <img src={comunidadImg} alt="Comunidad Huarique" style={{ width: '150%', maxWidth: 'none', maxHeight: '600px', objectFit: 'contain', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.15))' }} />
            
            {/* Burbuja de diálogo */}
            {characterMessage && (
              <div key={characterMessage} className="detail-character-speech-bubble fade-in">
                {characterMessage}
                <div className="detail-bubble-tail"></div>
              </div>
            )}
          </div>
        </div>

        {/* Columna Derecha: Mapa y Comentarios */}
        <div className="detail-right-col">
          <div className="detail-card map-card">
            <h2 className="detail-subtitle">Ubicación Exacta</h2>
            <div className="static-map-wrapper">
              <div id="static-map-container" ref={mapContainerRef} />
              <div className="static-map-overlay-text">
                Mapa Estático
              </div>
            </div>
            
            <button
              className="guide-button external-nav-btn"
              onClick={() => {
                const [lng, lat] = huarique.coordenadas.coordinates;
                window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=transit`, '_blank');
              }}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" style={{ fill: 'currentColor', marginRight: '8px' }}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" />
              </svg>
              Abrir indicaciones en Google Maps
            </button>
          </div>

          <div className="comments-card" style={{ padding: '0', background: 'transparent', border: 'none', boxShadow: 'none' }}>
            <h2 className="detail-subtitle">Comentarios de la comunidad</h2>

            <div className={`comments-list ${showAllComments ? 'scrollable' : ''}`}>
              {comments.slice(0, showAllComments ? comments.length : 4).map(c => (
                <div key={c.id} className="comment-item">
                  <div className="comment-avatar" style={{ color: 'var(--peru-text)' }}><UserIcon /></div>
                  <div className="comment-body">
                    <div className="comment-header">
                      <span className="comment-user">{c.user}</span>
                      <span className="comment-date">{c.date}</span>
                    </div>
                    <div className="comment-stars">
                      {Array.from({ length: c.rating }).map((_, i) => (
                        <StarIcon key={i} />
                      ))}
                    </div>
                    <p className="comment-text">{c.text}</p>
                    
                    {/* Botón Like de Comentario */}
                    <div style={{ marginTop: '8px', display: 'flex' }}>
                      <button 
                        onClick={() => handleToggleLike(c.id)}
                        style={{ 
                          background: 'none', border: 'none', padding: '0', margin: '0', 
                          display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer',
                          color: c.likedByMe ? 'var(--peru-red)' : '#64748b', fontSize: '13px', fontWeight: '500',
                          transition: 'all 0.2s'
                        }}
                      >
                        <HeartIcon /> {c.likes > 0 ? c.likes : 'Me gusta'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {comments.length > 4 && (
              <button 
                onClick={() => setShowAllComments(!showAllComments)}
                style={{ width: '100%', marginTop: '16px', padding: '12px', background: 'var(--peru-white)', border: '1.5px solid var(--peru-border-btn)', borderRadius: '8px', fontWeight: '600', color: 'var(--peru-text-dark)', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', transition: 'all 0.2s ease' }}
              >
                {showAllComments ? 'Cargar menos comentarios' : `Cargar más comentarios (${comments.length - 4})`}
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Floating Action Button para Comentarios */}
      <button 
        className="comment-fab"
        onClick={handleFabClick}
        title="Registra tu comentario"
      >
        <EditIcon />
        Registrar comentario
      </button>

      {/* Drawer / Modal Lateral de Comentarios */}
      <div className={`comment-drawer-overlay ${isCommentDrawerOpen ? 'open' : ''}`} onClick={() => setIsCommentDrawerOpen(false)}>
        <div className="comment-drawer" onClick={(e) => e.stopPropagation()}>
          <div className="drawer-header">
            <h3>Registra tu comentario</h3>
            <button className="drawer-close-btn" onClick={() => setIsCommentDrawerOpen(false)}>✕</button>
          </div>
          <div className="drawer-body">
            <form className="comment-form" onSubmit={handleAddComment}>
              <textarea 
                className="comment-input" 
                placeholder="¿Qué te pareció este huarique? ¡Queremos saberlo!"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={5}
                autoFocus
              />
              <button type="submit" className="comment-submit-btn" disabled={!newComment.trim()}>
                Publicar comentario
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ marginTop: '40px', paddingTop: '20px', paddingBottom: '10px', textAlign: 'center', color: 'var(--peru-text)', fontSize: '14px', borderTop: '1px solid var(--map-border)' }}>
        <p>© 2026 Huarique Map. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
