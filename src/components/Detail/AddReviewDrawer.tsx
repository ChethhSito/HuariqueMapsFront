import React from 'react';

interface AddReviewDrawerProps {
  isCommentDrawerOpen: boolean;
  setIsCommentDrawerOpen: (isOpen: boolean) => void;
  newComment: string;
  setNewComment: (val: string) => void;
  handleAddComment: (e: React.FormEvent) => void;
  EditIcon: React.FC;
  handleFabClick: () => void;
}

export default function AddReviewDrawer({
  isCommentDrawerOpen,
  setIsCommentDrawerOpen,
  newComment,
  setNewComment,
  handleAddComment,
  EditIcon,
  handleFabClick
}: AddReviewDrawerProps) {
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
    </>
  );
}
