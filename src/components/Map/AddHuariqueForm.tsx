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
          <div className="form-group form-group-half">
            <label className="form-label">Tipo de Comida</label>
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

          <div className="form-group form-group-half">
            <label className="form-label">Horario de Atención</label>
            <div className="time-inputs-row">
              <input
                type="time"
                required
                value={regHoraApertura}
                onChange={(e) => setRegHoraApertura(e.target.value)}
                className="form-input form-input-time"
              />
              <span className="time-separator">a</span>
              <input
                type="time"
                required
                value={regHoraCierre}
                onChange={(e) => setRegHoraCierre(e.target.value)}
                className="form-input form-input-time"
              />
            </div>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Foto del Huarique</label>
          <div className="file-upload-wrapper">
            <input
              id="huarique-file-input"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input-hidden"
              disabled={uploadingImage}
            />
            <label htmlFor="huarique-file-input" className="file-upload-trigger">
              <span className="upload-btn-text">
                {uploadingImage ? 'Subiendo foto...' : 'Seleccionar foto'}
              </span>
            </label>
            {!uploadingImage && regImagen && (
              <div className="image-preview-container">
                <img src={regImagen} alt="Vista previa" className="image-preview" />
                <button
                  type="button"
                  onClick={() => setRegImagen('')}
                  className="image-preview-remove"
                  title="Eliminar imagen"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Distrito *</label>
          {regCoordinates ? (
            <div className="district-select-wrapper">
              <select
                value={regDistrito}
                onChange={(e) => setRegDistrito(e.target.value)}
                className="form-select"
                required
              >
                <option value="">-- Selecciona un distrito --</option>
                {availableDistricts.map(d => {
                  const name = d === 'LIMA' ? 'Cercado de Lima' : d.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                  return <option key={d} value={d}>{name}</option>;
                })}
              </select>
              {loadingDistrict && <small className="loading-district-text">Buscando distrito en el mapa...</small>}
            </div>
          ) : (
            <div className="map-placeholder-box">
              <div className="map-placeholder-text">
                <span className="pulse-icon-dot"></span>
                <span>Haz clic en el mapa para ubicar el huarique</span>
              </div>
            </div>
          )}
        </div>

        <button type="submit" className="form-submit-btn">
          Registrar Huarique
        </button>
      </form>
    </div>
  );
}
