import type { Huarique } from '../../types';

interface MapSidebarListProps {
  filteredHuariques: Huarique[];
  selectedId: string | null;
  setSelectedId: (id: string) => void;
  handleToggleLike: (id: string) => void;
  myLikesMap: { [id: string]: boolean };
  likesMap: { [id: string]: number };
  user: any;
}

export default function MapSidebarList({
  filteredHuariques,
  selectedId,
  setSelectedId,
  handleToggleLike,
  myLikesMap,
  likesMap,
  user
}: MapSidebarListProps) {
  return (
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
  );
}
