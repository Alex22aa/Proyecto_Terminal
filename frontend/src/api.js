// Cliente simple para hablar con la API REST del backend (MVC del lado servidor).
// El frontend en React consume esto; nunca habla directo con la base de datos.

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export async function iniciarSesion(correoInstitucional, contrasena) {
  const respuesta = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correoInstitucional, contrasena }),
  });
  if (!respuesta.ok) {
    throw new Error('No se pudo iniciar sesion');
  }
  return respuesta.json();
}

export async function registrarUsuario(datos) {
  const respuesta = await fetch(`${API_URL}/auth/registro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(datos),
  });
  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}));
    throw new Error(error.error || 'No se pudo registrar el usuario');
  }
  return respuesta.json();
}

export async function obtenerCursos(token) {
  const respuesta = await fetch(`${API_URL}/cursos`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!respuesta.ok) {
    throw new Error('No se pudieron obtener los cursos');
  }
  return respuesta.json();
}

export async function crearCurso(token, datos) {
  const respuesta = await fetch(`${API_URL}/cursos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(datos),
  });
  if (!respuesta.ok) {
    const error = await respuesta.json().catch(() => ({}));
    throw new Error(error.error || 'No se pudo crear el curso');
  }
  return respuesta.json();
}
