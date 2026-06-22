const API_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:3000';

export async function loginUser(email: string, contrasena: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: contrasena })
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.message || 'Error en login');
  }

  return response.json();
}

export async function registerUser(nombre: string, email: string, contrasena: string) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombre, email, password: contrasena })
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.message || 'Error en registro');
  }

  return response.json();
}

export async function loginWithGoogle(token: string) {
  const response = await fetch(`${API_URL}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.message || 'Error en login con Google');
  }

  return response.json();
}
