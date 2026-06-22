import React from 'react';

interface AddHuariqueFormProps {
  setIsRegisterMode: (mode: boolean) => void;
  handleRegisterSubmit: (e: React.FormEvent) => void;
  regNombre: string;
  setRegNombre: (val: string) => void;
  regDescripcion: string;
  setRegDescripcion: (val: string) => void;
  regTipoComida: string;
  setRegTipoComida: (val: string) => void;
  CATEGORIES: string[];
  regHorario: string;
  setRegHorario: (val: string) => void;
  regCoordinates: [number, number] | null;
}

export default function AddHuariqueForm({
  setIsRegisterMode,
  handleRegisterSubmit,
  regNombre,
  setRegNombre,
  regDescripcion,
  setRegDescripcion,
  regTipoComida,
  setRegTipoComida,
  CATEGORIES,
  regHorario,
  setRegHorario,
  regCoordinates
}: AddHuariqueFormProps) {
  return (
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
  );
}
