import React, { useState, useEffect } from 'react';
import { storage } from '../../config/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
  regHoraApertura: string;
  setRegHoraApertura: (val: string) => void;
  regHoraCierre: string;
  setRegHoraCierre: (val: string) => void;
  regImagen: string;
  setRegImagen: (val: string) => void;
  regCoordinates: [number, number] | null;
  availableDistricts: string[];
  regDistrito: string;
  setRegDistrito: (val: string) => void;
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
  regHoraApertura,
  setRegHoraApertura,
  regHoraCierre,
  setRegHoraCierre,
  regImagen,
  setRegImagen,
  regCoordinates,
  availableDistricts,
  regDistrito,
  setRegDistrito
}: AddHuariqueFormProps) {
  const [loadingDistrict, setLoadingDistrict] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (!regCoordinates) {
      setRegDistrito('');
      return;
    }
    const [lat, lng] = regCoordinates;
    setRegDistrito('');
    setLoadingDistrict(true);

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
          const dist = data.address.suburb || data.address.neighbourhood || data.address.city_district || data.address.town || data.address.city || '';
          if (dist) {
            const searchName = dist.toUpperCase().trim();
            const match = availableDistricts.find(d => searchName.includes(d) || d.includes(searchName));
            if (match) {
              setRegDistrito(match);
            } else {
              setRegDistrito('LIMA'); // default fallback (Cercado de Lima)
            }
          } else {
            setRegDistrito('LIMA');
          }
        } else {
          setRegDistrito('LIMA');
        }
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.error("Error fetching district:", err);
          setRegDistrito('LIMA');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingDistrict(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [regCoordinates, availableDistricts]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);

    try {
      const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
      if (!apiKey || apiKey === "mock-api-key") {
        throw new Error("Firebase no está configurado (usando credenciales mock).");
      }

      const storageRef = ref(storage, `huariques_images/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      setRegImagen(downloadUrl);
      setUploadingImage(false);
      return;
    } catch (err) {
      console.warn("Firebase Storage upload failed or not configured, falling back to Base64:", err);
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setRegImagen(reader.result as string);
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

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
            <label className="form-label">Horario de Atención *</label>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <input
                type="time"
                required
                value={regHoraApertura}
                onChange={(e) => setRegHoraApertura(e.target.value)}
                className="form-input"
                style={{ padding: '6px 8px', fontSize: '12px' }}
              />
              <span style={{ fontSize: '12px', color: 'var(--peru-text)' }}>a</span>
              <input
                type="time"
                required
                value={regHoraCierre}
                onChange={(e) => setRegHoraCierre(e.target.value)}
                className="form-input"
                style={{ padding: '6px 8px', fontSize: '12px' }}
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Foto del Huarique</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ fontSize: '12px', fontFamily: 'Outfit' }}
              disabled={uploadingImage}
            />
            {uploadingImage && <div style={{ fontSize: '11px', color: '#ea580c', fontWeight: 600 }}>Subiendo foto...</div>}
            {!uploadingImage && regImagen && (
              <div style={{ position: 'relative', width: '100%', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '1.5px solid var(--peru-border)' }}>
                <img src={regImagen} alt="Vista previa" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button
                  type="button"
                  onClick={() => setRegImagen('')}
                  style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '10px' }}
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Ubicación Geográfica *</label>
          <div className={`coordinates-status-box ${regCoordinates ? 'success' : 'pending'}`}>
            {regCoordinates ? (
              <div className="coords-display" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
                  <span>Lat: {regCoordinates[0].toFixed(6)}</span>
                  <span>Lng: {regCoordinates[1].toFixed(6)}</span>
                </div>
                <div style={{ borderTop: '1px dashed rgba(255,255,255,0.3)', paddingTop: '6px', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>📍 Distrito Seleccionado:</span>
                  <select
                    value={regDistrito}
                    onChange={(e) => setRegDistrito(e.target.value)}
                    style={{
                      padding: '5px 8px',
                      borderRadius: '6px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      background: 'white',
                      color: '#1e293b',
                      fontFamily: 'Outfit, sans-serif',
                      fontSize: '12px',
                      cursor: 'pointer',
                      width: '100%',
                      fontWeight: 500
                    }}
                  >
                    <option value="">-- Selecciona un distrito --</option>
                    {availableDistricts.map(d => {
                      const name = d === 'LIMA' ? 'Cercado de Lima' : d.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                      return <option key={d} value={d}>{name}</option>;
                    })}
                  </select>
                  {loadingDistrict && <small style={{ fontSize: '10px', fontStyle: 'italic', opacity: 0.8 }}>Buscando distrito en el mapa...</small>}
                </div>
              </div>
            ) : (
              <div className="coords-helper">
                <span className="pulse-icon"></span>
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
