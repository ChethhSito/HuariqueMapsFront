import { useState, useEffect, useRef } from 'react';
import type { Huarique } from '../types';
import { FALLBACK_HUARIQUES } from '../data/constants';
import { getHuariques, createHuarique, validateHuarique } from '../api/huariques';

export function useMapData(
  isConnected: boolean,
  setIsConnected: (connected: boolean) => void,
  user: any,
  onAuthClick: () => void
) {
  const [huariques, setHuariques] = useState<Huarique[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de filtros y likes
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [likesMap, setLikesMap] = useState<{ [id: string]: number }>({});
  const [characterMessage, setCharacterMessage] = useState<string | null>(null);
  const [myLikesMap, setMyLikesMap] = useState<{ [id: string]: boolean }>({});

  // Estados de Registro Crowdsourcing
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [regNombre, setRegNombre] = useState('');
  const [regDescripcion, setRegDescripcion] = useState('');
  const [regTipoComida, setRegTipoComida] = useState('Marina');
  const [regHorario, setRegHorario] = useState('');
  const [regCoordinates, setRegCoordinates] = useState<[number, number] | null>(null); // [lat, lng]

  const characterMessageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showCharacterMessage = (msg: string) => {
    setCharacterMessage(msg);
    if (characterMessageTimeoutRef.current) {
      clearTimeout(characterMessageTimeoutRef.current);
    }
    characterMessageTimeoutRef.current = setTimeout(() => {
      setCharacterMessage(null);
    }, 4000);
  };

  const resetRegisterForm = () => {
    setRegNombre('');
    setRegDescripcion('');
    setRegTipoComida('Marina');
    setRegHorario('');
    setRegCoordinates(null);
  };

  // Cargar huariques desde API o datos de respaldo
  useEffect(() => {
    const fetchHuariques = async () => {
      try {
        setLoading(true);
        const data = await getHuariques();
        if (data && data.length > 0) {
          setHuariques(data);
          setIsConnected(true);
          setError(null);
          setSelectedId(data[0]._id);
        } else {
          setHuariques(FALLBACK_HUARIQUES);
          setIsConnected(true);
          setError(null);
          setSelectedId(FALLBACK_HUARIQUES[0]._id);
        }
      } catch (err: any) {
        console.warn('Error conectando al API, usando huariques de respaldo:', err);
        setHuariques(FALLBACK_HUARIQUES);
        setError('Sin conexión al backend NestJS. Mostrando huariques de respaldo.');
        setIsConnected(false);
        setSelectedId(FALLBACK_HUARIQUES[0]._id);
      } finally {
        setLoading(false);
      }
    };

    fetchHuariques();
  }, [setIsConnected]);

  // Inicializar estado de Likes con localStorage o por defecto
  useEffect(() => {
    if (huariques.length === 0) return;

    const savedLikes = localStorage.getItem('huariques_likes_map');
    const savedMyLikes = localStorage.getItem('huariques_my_likes_map');

    let parsedLikes: { [id: string]: number } = {};
    let parsedMyLikes: { [id: string]: boolean } = {};

    if (savedLikes) {
      try { parsedLikes = JSON.parse(savedLikes); } catch (e) { }
    }
    if (savedMyLikes) {
      try { parsedMyLikes = JSON.parse(savedMyLikes); } catch (e) { }
    }

    const updatedLikesMap = { ...parsedLikes };

    huariques.forEach((h) => {
      if (updatedLikesMap[h._id] === undefined) {
        if (h._id === 'fallback-1') updatedLikesMap[h._id] = 34;
        else if (h._id === 'fallback-2') updatedLikesMap[h._id] = 48;
        else if (h._id === 'fallback-3') updatedLikesMap[h._id] = 57;
        else if (h._id === 'fallback-4') updatedLikesMap[h._id] = 120;
        else if (h._id === 'fallback-5') updatedLikesMap[h._id] = 22;
        else updatedLikesMap[h._id] = 15;
      }
    });

    setLikesMap(updatedLikesMap);
    setMyLikesMap(parsedMyLikes);
  }, [huariques]);

  const handleToggleLike = (id: string) => {
    if (!user) {
      onAuthClick();
      return;
    }

    const isLiked = !!myLikesMap[id];
    const newMyLikes = { ...myLikesMap, [id]: !isLiked };
    const newLikes = { ...likesMap, [id]: (likesMap[id] || 0) + (isLiked ? -1 : 1) };

    if (!isLiked) {
      showCharacterMessage("¡Buenazo! Gracias por tu like, causa.");
    } else {
      showCharacterMessage("¡Uy! Le quitaste el like.");
    }

    setMyLikesMap(newMyLikes);
    setLikesMap(newLikes);

    localStorage.setItem('huariques_my_likes_map', JSON.stringify(newMyLikes));
    localStorage.setItem('huariques_likes_map', JSON.stringify(newLikes));
  };

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
      try {
        const registeredHuarique = await createHuarique(newHuariqueData, user.token);
        
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

  const handleVoteExistence = async (huariqueId: string, existe: boolean) => {
    if (!user) {
      onAuthClick();
      return;
    }

    const userIdentifier = user.email || user.nombre;

    if (isConnected && user.token && !user.isLocal) {
      try {
        const updatedHuarique = await validateHuarique(huariqueId, existe, user.token);
        setHuariques(prev => prev.map(h => h._id === huariqueId ? updatedHuarique : h));
      } catch (err: any) {
        alert(`Error al guardar validación: ${err.message}`);
      }
    } else {
      const updatedList = huariques.map(h => {
        if (h._id !== huariqueId) return h;

        let votosExiste = h.votosExiste || [];
        let votosNoExiste = h.votosNoExiste || [];

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

  const selectedHuarique = huariques.find((h) => h._id === selectedId);

  return {
    huariques, setHuariques,
    selectedId, setSelectedId,
    loading, error,
    selectedCategory, setSelectedCategory,
    likesMap, setLikesMap,
    myLikesMap, setMyLikesMap,
    characterMessage, showCharacterMessage,
    isRegisterMode, setIsRegisterMode,
    regNombre, setRegNombre,
    regDescripcion, setRegDescripcion,
    regTipoComida, setRegTipoComida,
    regHorario, setRegHorario,
    regCoordinates, setRegCoordinates,
    handleToggleLike,
    handleVoteExistence,
    handleRegisterSubmit,
    filteredHuariques,
    selectedHuarique
  };
}
