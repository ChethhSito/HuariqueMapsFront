import React, { useState } from 'react';

interface AddReviewDrawerProps {
  isCommentDrawerOpen: boolean;
  setIsCommentDrawerOpen: (isOpen: boolean) => void;
  newComment: string;
  setNewComment: (val: string) => void;
  newRating: number;
  setNewRating: (val: number) => void;
  handleAddComment: (e: React.FormEvent) => void;
  EditIcon: React.FC;
  handleFabClick: () => void;
  huarique: {
    nombre: string;
    tipoComida: string;
    distrito?: string;
  };
}

const InteractiveStar = ({ filled, onClick, onMouseEnter, onMouseLeave }: { 
  filled: boolean; 
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) => (
  <svg 
    viewBox="0 0 24 24" 
    width="28" 
    height="28" 
    fill={filled ? "#fbbf24" : "none"} 
    stroke="#fbbf24" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ cursor: 'pointer', transition: 'transform 0.1s ease', margin: '0 4px' }}
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    className="interactive-star"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

export default function AddReviewDrawer({
  isCommentDrawerOpen,
  setIsCommentDrawerOpen,
  newComment,
  setNewComment,
  newRating,
  setNewRating,
  handleAddComment,
  EditIcon,
  handleFabClick,
  huarique
}: AddReviewDrawerProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return 'Malo';
      case 2: return 'Regular';
      case 3: return 'Bueno';
      case 4: return 'Muy bueno';
      case 5: return 'Excelente';
      default: return '';
    }
  };

  const formatDistrict = (dist?: string) => {
    if (!dist) return '';
    if (dist === 'LIMA') return 'Cercado de Lima';
    return dist.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <>
      <button 
        className="comment-fab"
        onClick={handleFabClick}
        title="Registra tu comentario"
      >
        <EditIcon />
        Registrar comentario
      </button>

      <div className={`comment-drawer-overlay ${isCommentDrawerOpen ? 'open' : ''}`} onClick={() => setIsCommentDrawerOpen(false)}>
        <div className="comment-drawer" onClick={(e) => e.stopPropagation()}>
          <div className="drawer-header">
            <h3>Nueva reseña</h3>
            <button className="drawer-close-btn" onClick={() => setIsCommentDrawerOpen(false)}>✕</button>
          </div>
          
          <div className="drawer-body">
            {/* Cabecera de información del huarique */}
            <div className="drawer-huarique-info">
              <div className="drawer-huarique-title">{huarique.nombre}</div>
              <div className="drawer-huarique-meta">
                <span className="meta-tag food-tag">{huarique.tipoComida}</span>
                {huarique.distrito && (
                  <span className="meta-tag location-tag">{formatDistrict(huarique.distrito)}</span>
                )}
              </div>
            </div>

            <form className="comment-form" onSubmit={handleAddComment}>
              {/* Sección de calificación con estrellas */}
              <div className="drawer-rating-section">
                <label className="rating-label">Tu Calificación:</label>
                <div className="stars-container">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <InteractiveStar
                      key={star}
                      filled={hoverRating !== null ? star <= hoverRating : star <= newRating}
                      onClick={() => setNewRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                    />
                  ))}
                  <span className="rating-value-text">
                    {getRatingText(hoverRating !== null ? hoverRating : newRating)}
                  </span>
                </div>
              </div>

              {/* Comentario */}
              <div className="drawer-textarea-section" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label className="rating-label">Tu Opinión:</label>
                <textarea 
                  className="comment-input" 
                  placeholder="¿Qué te pareció este huarique? Cuéntanos tu experiencia..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={6}
                  autoFocus
                />
              </div>
              
              <button type="submit" className="comment-submit-btn" disabled={!newComment.trim()}>
                Publicar comentario
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
