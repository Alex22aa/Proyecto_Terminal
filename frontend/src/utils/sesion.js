// Guarda y lee la sesion del usuario (token, nombre y rol) en el navegador.

const CLAVE_SESION = 'sesionUsuario';

export function guardarSesion(datos) {
  localStorage.setItem(CLAVE_SESION, JSON.stringify(datos));
}

export function obtenerSesion() {
  const guardado = localStorage.getItem(CLAVE_SESION);
  return guardado ? JSON.parse(guardado) : null;
}

export function cerrarSesion() {
  localStorage.removeItem(CLAVE_SESION);
}
