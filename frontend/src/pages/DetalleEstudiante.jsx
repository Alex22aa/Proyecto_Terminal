import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PanelLayout from '../components/PanelLayout';
import {
  obtenerCursos,
  obtenerTareasDelCurso,
  obtenerInscripcionesDelCurso,
  obtenerEntregasDeTarea,
} from '../api';
import { obtenerSesion } from '../utils/sesion';
import './Cursos.css';
import './Dashboard.css';

// Pantalla IU-15: detalle de un estudiante dentro de un curso. Se llega desde
// el Dashboard docente (IU-14, boton "Ver estudiante") y regresa a el.
//
// Dos campos del bosquejo no se muestran aqui, decididos con Alejandro:
// - "Matricula" si se agrego (columna nueva en Usuario), pero queda vacia
//   ("--") para cualquier cuenta que no la tenga capturada a mano todavia,
//   porque el registro (IU-31) no la pide.
// - "Asistencia/participacion" se omite por completo: no hay ninguna entidad
//   en el sistema que registre eso (nunca se diseño seguimiento de asistencia
//   en las 11 entidades del diccionario de datos).
//
// Las mismas reglas de "atrasada"/"en riesgo" que en IU-14 se reusan aqui
// para un solo estudiante. El estado por tarea y las observaciones finales
// son generados con reglas simples sobre los datos, no con IA.
function DetalleEstudiante() {
  const { cursoId, estudianteId } = useParams();
  const navigate = useNavigate();
  const sesion = obtenerSesion();
  const [curso, setCurso] = useState(null);
  const [estudiante, setEstudiante] = useState(null);
  const [resumenPorTarea, setResumenPorTarea] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursoId, estudianteId]);

  async function cargar() {
    setCargando(true);
    const [cursos, tareas, inscripciones] = await Promise.all([
      obtenerCursos(sesion?.token),
      obtenerTareasDelCurso(sesion?.token, cursoId),
      obtenerInscripcionesDelCurso(sesion?.token, cursoId),
    ]);

    setCurso(cursos.find((c) => String(c.id) === cursoId));
    const inscripcion = inscripciones.find((i) => String(i.estudiante?.id) === estudianteId);
    setEstudiante(inscripcion ? inscripcion.estudiante : null);

    const tareasActivas = tareas.filter((t) => t.activa);
    const entregasPorTarea = await Promise.all(
      tareasActivas.map((tarea) => obtenerEntregasDeTarea(sesion?.token, tarea.id))
    );
    setResumenPorTarea(
      tareasActivas.map((tarea, indice) => ({
        tarea,
        entrega: entregasPorTarea[indice].find((e) => String(e.estudiante?.id) === estudianteId) || null,
      }))
    );
    setCargando(false);
  }

  const ahora = new Date();

  function esAtrasada(tarea, entrega) {
    if (!entrega) return new Date(tarea.fechaEntrega) < ahora;
    return new Date(entrega.fechaEntrega) > new Date(tarea.fechaEntrega);
  }

  // Estado de cada tarea para este estudiante, tal como lo muestra el bosquejo.
  function estadoDeTarea(tarea, entrega) {
    if (!entrega) return esAtrasada(tarea, entrega) ? 'Atrasada' : 'Pendiente';
    if (esAtrasada(tarea, entrega)) return 'Entregada tarde';
    if (entrega.estado === 'calificada' && entrega.puntajeObtenido !== null) {
      const normalizada = (entrega.puntajeObtenido / tarea.puntajeMaximo) * 10;
      if (normalizada < 6) return 'Bajo desempeño';
    }
    return 'Entregada';
  }

  const filas = resumenPorTarea.map(({ tarea, entrega }) => {
    const calificacion =
      entrega?.estado === 'calificada' && entrega.puntajeObtenido !== null
        ? (entrega.puntajeObtenido / tarea.puntajeMaximo) * 10
        : null;
    return { tarea, entrega, calificacion, estado: estadoDeTarea(tarea, entrega) };
  });

  const calificaciones = filas.filter((f) => f.calificacion !== null).map((f) => f.calificacion);
  const promedio =
    calificaciones.length > 0 ? calificaciones.reduce((s, v) => s + v, 0) / calificaciones.length : null;
  const entregasAtrasadas = filas.filter((f) => f.estado === 'Atrasada' || f.estado === 'Entregada tarde').length;
  const tareasPendientes = filas.filter((f) => f.estado === 'Pendiente').length;
  const enRiesgo = (promedio !== null && promedio < 6) || entregasAtrasadas > 0;

  function observaciones() {
    const bajoPromedio = promedio !== null && promedio < 6;
    if (bajoPromedio && entregasAtrasadas > 0) {
      return 'El estudiante presenta bajo desempeño en las últimas actividades y registra entregas atrasadas. Se recomienda seguimiento académico.';
    }
    if (bajoPromedio) {
      return 'El estudiante presenta bajo desempeño en las calificaciones registradas. Se recomienda seguimiento académico.';
    }
    if (entregasAtrasadas > 0) {
      return 'El estudiante tiene entregas atrasadas, aunque su desempeño en las calificaciones es adecuado. Se recomienda dar seguimiento a sus tiempos de entrega.';
    }
    return 'El estudiante mantiene un desempeño adecuado y entregas a tiempo.';
  }

  if (cargando) {
    return (
      <PanelLayout rol="docente">
        <p>Cargando...</p>
      </PanelLayout>
    );
  }

  if (!estudiante) {
    return (
      <PanelLayout rol="docente">
        <p>Estudiante no encontrado en este curso.</p>
        <div className="cursos-acciones">
          <button className="cursos-boton-secundario" onClick={() => navigate('/dashboard-docente')}>
            Volver al dashboard
          </button>
        </div>
      </PanelLayout>
    );
  }

  return (
    <PanelLayout rol="docente">
      {curso && (
        <p className="tareas-curso-tag">
          Curso: {curso.nombre} · Grupo: {curso.grupo || '—'} · Estudiante: {estudiante.nombreCompleto}
        </p>
      )}
      <h1>Detalle de estudiante</h1>
      <p className="cursos-subtitulo">Información académica individual del estudiante</p>

      <div className="dashboard-panel" style={{ maxWidth: 420, marginBottom: 20 }}>
        <h2>Resumen del estudiante</h2>
        <div className="cursos-detalle">
          <p>
            <strong>Nombre:</strong> {estudiante.nombreCompleto}
          </p>
          <p>
            <strong>Matrícula:</strong> {estudiante.matricula || '—'}
          </p>
          <p>
            <strong>Promedio actual:</strong> {promedio !== null ? promedio.toFixed(1) : 'Sin calificaciones aún'}
          </p>
          <p>
            <strong>Estado académico:</strong> {enRiesgo ? 'En riesgo' : 'Regular'}
          </p>
          <p>
            <strong>Entregas atrasadas:</strong> {entregasAtrasadas}
          </p>
          <p>
            <strong>Tareas pendientes:</strong> {tareasPendientes}
          </p>
        </div>
      </div>

      <div className="dashboard-panel" style={{ marginBottom: 20 }}>
        <h2>Desempeño por tarea</h2>
        {filas.length === 0 && <p className="dashboard-vacio">Este curso todavía no tiene tareas activas.</p>}
        {filas.length > 0 && (
          <table className="entregas-tabla">
            <thead>
              <tr>
                <th>Tarea</th>
                <th>Calif.</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filas.map(({ tarea, calificacion, estado }) => (
                <tr key={tarea.id}>
                  <td>{tarea.titulo}</td>
                  <td>{calificacion !== null ? calificacion.toFixed(1) : '—'}</td>
                  <td>{estado}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="dashboard-panel" style={{ marginBottom: 20 }}>
        <h2>Observaciones</h2>
        <p>{observaciones()}</p>
      </div>

      <div className="cursos-acciones">
        <button className="cursos-boton-secundario" onClick={() => navigate('/dashboard-docente')}>
          Volver al dashboard
        </button>
      </div>
    </PanelLayout>
  );
}

export default DetalleEstudiante;
