const API_URL = import.meta.env.VITE_API_URL as string;

export async function getHuariques() {
  const response = await fetch(`${API_URL}/huariques`);
  if (!response.ok) {
    throw new Error(`Error en el servidor: ${response.statusText}`);
  }
  return response.json();
}

export async function createHuarique(huariqueData: any, token: string) {
  const response = await fetch(`${API_URL}/huariques`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(huariqueData)
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.message || 'Error al registrar el huarique');
  }

  return response.json();
}

export async function validateHuarique(huariqueId: string, existe: boolean, token: string) {
  const response = await fetch(`${API_URL}/huariques/${huariqueId}/validar`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ existe })
  });

  if (!response.ok) {
    throw new Error('Error al enviar el voto al servidor.');
  }

  return response.json();
}

export async function addReview(huariqueId: string, reviewData: any, token: string) {
  const response = await fetch(`${API_URL}/huariques/${huariqueId}/resenas`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(reviewData)
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.message || 'Error al agregar comentario');
  }

  return response.json();
}
