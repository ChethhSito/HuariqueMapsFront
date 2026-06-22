import { useState, useEffect } from 'react';
import type { Huarique } from '../../types';

interface HuariqueDetailOverlayProps {
  selectedHuarique: Huarique;
  user: any;
  handleVoteExistence: (id: string, existe: boolean) => void;
  myLikesMap: { [id: string]: boolean };
  likesMap: { [id: string]: number };
  handleToggleLike: (id: string) => void;
  onViewDetail?: (huarique: Huarique) => void;
  handleGuideMe: (huarique: Huarique) => void;
  showCharacterMessage: (msg: string) => void;
}

const addressCache: { [id: string]: { road?: string; suburb?: string } } = {};

export default function HuariqueDetailOverlay({
  selectedHuarique,
  user,
  handleVoteExistence,
  myLikesMap,
  likesMap,
  handleToggleLike,
  onViewDetail,
  handleGuideMe,
  showCharacterMessage
}: HuariqueDetailOverlayProps) {
  const [address, setAddress] = useState<{ road?: string; suburb?: string } | null>(null);
  const [addressLoading, setAddressLoading] = useState(false);

  useEffect(() => {
    const id = selectedHuarique._id;
    if (addressCache[id]) {
      setAddress(addressCache[id]);
      return;
    }

    if (!selectedHuarique.coordenadas || !selectedHuarique.coordenadas.coordinates || selectedHuarique.coordenadas.coordinates.length < 2) {
      setAddress(null);
      return;
    }

    const [lng, lat] = selectedHuarique.coordenadas.coordinates;
    setAddress(null);
    setAddressLoading(true);

    const controller = new AbortController();

    fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'HuariqueMap-App'
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.address) {
          const addr = {
            road: data.address.road || data.address.pedestrian || data.address.suburb || '',
            suburb: data.address.suburb || data.address.neighbourhood || data.address.city_district || data.address.town || data.address.city || ''
          };
          addressCache[id] = addr;
          setAddress(addr);
        } else {
          setAddress(null);
        }
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error("Error fetching address:", err);
        }
        setAddress(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setAddressLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [selectedHuarique._id]);

  return (
    <div className="detail-overlay" style={{ zIndex: 1010 }}>
      <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
        <span>{selectedHuarique.nombre}</span>
      </h3>
      <span className="huarique-tag" style={{ marginBottom: '12px' }}>{selectedHuarique.tipoComida}</span>
      <p>{selectedHuarique.descripcion}</p>

      {addressLoading && (
        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="loading-spinner-small" style={{ display: 'inline-block', width: '12px', height: '12px', border: '2px solid #bd2d2d', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></span>
          <span>Obteniendo dirección de referencia...</span>
        </div>
      )}

      {!addressLoading && address && address.suburb && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'var(--peru-red-light, rgba(189, 45, 45, 0.04))', padding: '10px 12px', borderRadius: '8px', borderLeft: '3px solid var(--peru-red-bright, #bd2d2d)', marginBottom: '12px', fontSize: '12px' }}>
          <div style={{ display: 'flex', gap: '6px', color: 'var(--peru-text-dark)' }}>
            <span style={{ fontWeight: 'bold' }}>Distrito:</span>
            <span style={{ color: 'var(--peru-text)' }}>{address.suburb}</span>
          </div>
        </div>
      )}

      <div className="detail-row">
        <span className="detail-label">Horario:</span>
        <span>{selectedHuarique.horario || 'No especificado'}</span>
      </div>

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
            className={`val-btn val-btn-yes ${user && (selectedHuarique.votosExiste || []).includes(user.email || user.nombre || '') ? 'active' : ''}`}
            onClick={() => handleVoteExistence(selectedHuarique._id, true)}
            style={{ flex: 1, padding: '8px 10px', borderRadius: '8px', border: '1px solid #059669', background: user && (selectedHuarique.votosExiste || []).includes(user.email || user.nombre || '') ? '#059669' : 'transparent', color: user && (selectedHuarique.votosExiste || []).includes(user.email || user.nombre || '') ? '#fff' : '#059669', cursor: 'pointer', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s' }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
            Sí existe
          </button>
          <button 
            className={`val-btn val-btn-no ${user && (selectedHuarique.votosNoExiste || []).includes(user.email || user.nombre || '') ? 'active' : ''}`}
            onClick={() => handleVoteExistence(selectedHuarique._id, false)}
            style={{ flex: 1, padding: '8px 10px', borderRadius: '8px', border: '1px solid #ef4444', background: user && (selectedHuarique.votosNoExiste || []).includes(user.email || user.nombre || '') ? '#ef4444' : 'transparent', color: user && (selectedHuarique.votosNoExiste || []).includes(user.email || user.nombre || '') ? '#fff' : '#ef4444', cursor: 'pointer', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', transition: 'all 0.2s' }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path></svg>
            Ya cerró
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
        <button
          className={`like-button ${myLikesMap[selectedHuarique._id] ? 'liked' : ''}`}
          onClick={() => handleToggleLike(selectedHuarique._id)}
          style={{ flex: 1, marginTop: 0}}
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
  );
}
