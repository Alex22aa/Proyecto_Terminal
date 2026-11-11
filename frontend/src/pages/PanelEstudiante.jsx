import { useEffect, useState } from 'react';
import PanelLayout from '../components/PanelLayout';
import { obtenerMisCursos, obtenerTareasDelCurso, obtenerMiEntrega, obtenerMisNotificaciones } from '../api';
import { obtenerSesion } from '../utils/sesion';
import './Dashboard.css';

// Pantalla IU-03: pantalla principal del estudiante al iniciar sesion
// (Figura 24, pagina 24 de la tesina). Mismo criterio que Panel docente
// (IU-02): resumen corto de indicadores y pendientes, distinto del Dashboard
// (IU-23) y de Notificaciones (IU-33). La tarjeta "Recomendaciones" y la
// alerta de recomendacion del bosquejo se omiten por depender de la entidad
// Recomendacion (IA, en pausa) — mismo criterio ya usado en el Dashboard
// estudiante. "Retroalimentaciones nuevas" reutiliza las notificaciones de
// tipo calificacion que todavia no se marcan como leidas, sin dato nuevo.
function PanelEstudiante() {
  const sesion = obtenerSesion();
  const [cargando, setCargando] = useState(true);
  const [cursosInscritos, setCursosInscritos] = useState(0);
  const [tareasPendientes, setTareasPendientes] = useState([]);
  const [retroalimentacionesNuevas, setRetroalimentacionesNuevas] = useState([]);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function cargar() {
    setCargando(true);
    const [inscripciones, notificaciones] = await Promise.all([
      obtenerMisCursos(sesion?.token),
      obtenerMisNotificaciones(sesion?.token),
    ]);
    setCursosInscritos(inscripciones.length);

    const porCurso = await Promise.all(
      inscripciones.map(async (inscripcion) => {
        const curso = inscripcion.curso;
        const tareas = await obtenerTareasDelCurso(sesion?.token, curso.id);
        const tareasActivas = tareas.filter((t) => t.activa);
        const entregas = await Promise.all(
          tareasActivas.map((tarea) => obtenerMiEntrega(sesion?.token, tarea.id))
        );
        return tareasActivas.map((tarea, indice) => ({ curso, tarea, entrega: entregas[indice] }));
      })
    );

    const pendientes = porCurso
      .flat()
      .filter((f) => !f.entrega)
      .sort((a, b) => new Date(a.tarea.fechaEntrega) - new Date(b.tarea.fechaEntrega));
    setTareasPendientes(pendientes);

    const calificacionesNuevas = notificaciones.filter((n) => n.tipo === 'calificación' && !n.leida);
    setRetroalimentacionesNuevas(calificacionesNuevas);

    setCargando(false);
  }

  const sinPendientes = tareasPendientes.length === 0 && retroalimentacionesNuevas.length === 0;

  return (
    <PanelLayout rol="estudiante">
      <h1>Panel estudiante</h1>
      <p className="cursos-subtitulo">Resumen general de cursos, tareas y retroalimentación</p>

      {cargando && <p>Cargando...</p>}

      {!cargando && (
        <>
          <div className="dashboard-tarjetas">
            <div className="dashboard-tarjeta">
              <p className="dashboard-numero">{cursosInscritos}</p>
              <p className="dashboard-etiqueta">Cursos inscritos</p>
            </div>
            <div className="dashboard-tarjeta">
              <p className="dashboard-numero">{tareasPendientes.length}</p>
              <p className="dashboard-etiqueta">Tareas pendientes</p>
            </div>
            <div className="dashboard-tarjeta">
              <p className="dashboard-numero">{retroalimentacionesNuevas.length}</p>
              <p className="dashboard-etiqueta">Retroalimentaciones nuevas</p>
            </div>
          </div>

          <div className="dashboard-panel" style={{ maxWidth: 480 }}>
            <h2>Pendientes recientes</h2>
            {sinPendientes && <p className="dashboard-vacio">Sin pendientes recientes.</p>}
            {!sinPendientes && (
              <div className="panel-alertas">
                {tareasPendientes.slice(0, 3).map((f) => (
                  <div className="panel-alerta" key={`tarea-${f.tarea.id}`}>
                    Tarea pendiente: {f.tarea.titulo}
                  </div>
                ))}
                {retroalimentacionesNuevas.slice(0, 3).map((n) => (
                  <div className="panel-alerta" key={`notif-${n.id}`}>
                    {n.mensaje}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </PanelLayout>
  );
}

export default PanelEstudiante;
