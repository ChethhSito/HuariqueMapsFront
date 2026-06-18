interface Comment {
  id: number;
  user: string;
  rating: number;
  text: string;
  date: string;
  likes: number;
  likedByMe: boolean;
}

interface ReviewListProps {
  comments: Comment[];
  showAllComments: boolean;
  setShowAllComments: (show: boolean) => void;
  handleToggleLike: (id: number) => void;
  UserIcon: React.FC;
  StarIcon: React.FC;
  HeartIcon: React.FC;
}

export default function ReviewList({
  comments,
  showAllComments,
  setShowAllComments,
  handleToggleLike,
  UserIcon,
  StarIcon,
  HeartIcon
}: ReviewListProps) {
  return (
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
  );
}
