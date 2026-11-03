import { useEffect, useState } from 'react';
import PanelLayout from '../components/PanelLayout';
import { obtenerMisNotificaciones, marcarNotificacionLeida, eliminarNotificacion } from '../api';
import { obtenerSesion } from '../utils/sesion';
import './Notificaciones.css';

// Pantalla IU-33: notificaciones del estudiante. Mismo patron que
// NotificacionesDocente (IU-29): se accede desde el menu lateral y no
// depende de un boton de regreso (navegacion libre).
function NotificacionesEstudiante() {
  const sesion = obtenerSesion();
  const [notificaciones, setNotificaciones] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setCargando(true);
    const lista = await obtenerMisNotificaciones(sesion?.token);
    setNotificaciones(lista);
    setCargando(false);
  }

  async function manejarClic(notificacion) {
    if (!notificacion.leida) {
      await marcarNotificacionLeida(sesion?.token, notificacion.id);
      setNotificaciones((actuales) =>
        actuales.map((n) => (n.id === notificacion.id ? { ...n, leida: true } : n))
      );
    }
  }

  async function manejarEliminar(evento, id) {
    evento.stopPropagation();
    await eliminarNotificacion(sesion?.token, id);
    setNotificaciones((actuales) => actuales.filter((n) => n.id !== id));
  }

  function formatearTiempo(fecha) {
    const fechaNotificacion = new Date(fecha);
    const ahora = new Date();
    const diffMinutos = Math.floor((ahora - fechaNotificacion) / 60000);

    if (diffMinutos < 1) return 'Hace un momento';
    if (diffMinutos < 60) return `Hace ${diffMinutos} minuto${diffMinutos === 1 ? '' : 's'}`;

    if (fechaNotificacion.toDateString() === ahora.toDateString()) return 'Hoy';

    const ayer = new Date(ahora);
    ayer.setDate(ahora.getDate() - 1);
    if (fechaNotificacion.toDateString() === ayer.toDateString()) return 'Ayer';

    return fechaNotificacion.toLocaleDateString('es-MX');
  }

  return (
    <PanelLayout rol="estudiante">
      <h1>Notificaciones Estudiante</h1>
      <p className="notificaciones-subtitulo">
        Consulta los avisos recientes relacionados con tu actividad académica como estudiante
      </p>

      <div className="notificaciones-encabezado">🔔 Notificaciones recientes</div>

      {cargando && <p>Cargando notificaciones...</p>}

      {!cargando && notificaciones.length === 0 && (
        <p className="notificaciones-vacio">No tienes notificaciones por ahora.</p>
      )}

      {!cargando && notificaciones.length > 0 && (
        <div className="notificaciones-lista">
          {notificaciones.map((notificacion) => (
            <div
              key={notificacion.id}
              className={`notificacion-item ${notificacion.leida ? 'leida' : 'no-leida'}`}
              onClick={() => manejarClic(notificacion)}
            >
              <span className="notificacion-punto">{notificacion.leida ? '◦' : '•'}</span>
              <div className="notificacion-cuerpo">
                <p className="notificacion-texto">{notificacion.mensaje}</p>
                <p className="notificacion-tiempo">{formatearTiempo(notificacion.fechaCreacion)}</p>
              </div>
              <button
                className="notificacion-eliminar"
                onClick={(evento) => manejarEliminar(evento, notificacion.id)}
                title="Eliminar notificación"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </PanelLayout>
  );
}

export default NotificacionesEstudiante;
