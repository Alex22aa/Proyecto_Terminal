// Guarda y lee la sesión del usuario (token, nombre y rol) en el navegador.
// Se usa sessionStorage (no localStorage) para que cada pestaña tenga su
// propia sesión independiente, en vez de compartirla entre todas las
// pestañas del navegador. La sesión se pierde al cerrar la pestaña.

const CLAVE_SESION = 'sesionUsuario';

export function guardarSesion(datos) {
  sessionStorage.setItem(CLAVE_SESION, JSON.stringify(datos));
}

export function obtenerSesion() {
  const guardado = sessionStorage.getItem(CLAVE_SESION);
  return guardado ? JSON.parse(guardado) : null;
}

export function cerrarSesion() {
  sessionStorage.removeItem(CLAVE_SESION);
}
