import type { Huarique } from '../types';
import { FALLBACK_HUARIQUES } from '../data/constants';

const API_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3000';

// Listar huariques aprobados para mapa y landing
export async function getHuariques(): Promise<Huarique[]> {
  try {
    const response = await fetch(`${API_URL}/huariques`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error('Error al obtener huariques del backend');
    }

    const data = await response.json();
    return data && data.length > 0 ? data : FALLBACK_HUARIQUES;
  } catch (error) {
    console.warn('Backend NestJS no disponible. Cargando huariques locales de respaldo:', error);
    return FALLBACK_HUARIQUES;
  }
}

// Listar todos los huariques (para el panel administrativo de Admin)
export async function getHuariquesAdmin(token: string): Promise<Huarique[]> {
  try {
    const response = await fetch(`${API_URL}/huariques/all`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Error al obtener huariques administrativos');
    }

    return response.json();
  } catch (error) {
    console.warn('Error al conectar con backend admin. Devolviendo todos los de respaldo:', error);
    // Devolver lista de respaldo local para propósitos de prueba offline
    return FALLBACK_HUARIQUES;
  }
}

// Crear un nuevo huarique (Crowdsourcing)
export async function createHuarique(huariqueData: any, token: string): Promise<Huarique> {
  try {
    const response = await fetch(`${API_URL}/huariques`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(huariqueData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al registrar huarique');
    }

    return response.json();
  } catch (error: any) {
    console.warn('Backend NestJS offline. Creando huarique localmente en memoria de respaldo:', error);
    // Simular creación offline
    return {
      _id: `offline-${Date.now()}`,
      ...huariqueData,
      estado: 'PENDIENTE',
      ratingPromedio: 0,
      numResenas: 0,
      votosExiste: [],
      votosNoExiste: [],
      resenas: []
    } as Huarique;
  }
}

// Validar existencia de huarique (Crowdsourcing)
export async function validateHuarique(huariqueId: string, existe: boolean, token: string): Promise<Huarique> {
  try {
    const response = await fetch(`${API_URL}/huariques/${huariqueId}/validar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ existe })
    });

    if (!response.ok) {
      throw new Error('Error al validar huarique');
    }

    return response.json();
  } catch (error) {
    console.error('Error en validación offline:', error);
    throw error;
  }
}

// Agregar reseña a un huarique
export async function addReview(huariqueId: string, reviewData: any, token: string): Promise<Huarique> {
  try {
    const response = await fetch(`${API_URL}/huariques/${huariqueId}/resenas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        comentario: reviewData.comentario || reviewData.text,
        calificacion: reviewData.calificacion || reviewData.rating
      })
    });

    if (!response.ok) {
      throw new Error('Error al agregar reseña');
    }

    return response.json();
  } catch (error) {
    console.error('Error en agregar reseña offline:', error);
    throw error;
  }
}

// Actualizar estado de aprobación (Admin)
export async function updateHuariqueEstado(huariqueId: string, estado: 'APROBADO' | 'PENDIENTE' | 'RECHAZADO', token: string): Promise<Huarique> {
  const response = await fetch(`${API_URL}/huariques/${huariqueId}/estado`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ estado })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al actualizar el estado');
  }

  return response.json();
}

// Modificar datos de un huarique (Admin)
export async function updateHuarique(huariqueId: string, updateData: any, token: string): Promise<Huarique> {
  const response = await fetch(`${API_URL}/huariques/${huariqueId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updateData)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al actualizar huarique');
  }

  return response.json();
}

// Eliminar un huarique (Admin)
export async function deleteHuarique(huariqueId: string, token: string): Promise<void> {
  const response = await fetch(`${API_URL}/huariques/${huariqueId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al eliminar huarique');
  }
}
