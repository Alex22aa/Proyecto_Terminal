import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PanelLayout from '../components/PanelLayout';
import { obtenerMisCursos, obtenerTareasDelCurso, obtenerMiEntrega } from '../api';
import { obtenerSesion } from '../utils/sesion';
import './Cursos.css';

// Pantalla IU-25: detalle de una tarea desde la perspectiva del estudiante.
// El campo "instrucciones" del bosquejo se combina con descripcion, igual
// que se hizo del lado docente (Tarea solo tiene un campo de texto).
function DetalleTareaEstudiante() {
  const { cursoId, tareaId } = useParams();
  const navigate = useNavigate();
  const sesion = obtenerSesion();
  const [curso, setCurso] = useState(null);
  const [tarea, setTarea] = useState(null);
  const [entrega, setEntrega] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tareaId]);

  async function cargar() {
    setCargando(true);

    const inscripciones = await obtenerMisCursos(sesion?.token);
    const inscripcion = inscripciones.find((i) => String(i.curso.id) === cursoId);
    setCurso(inscripcion ? inscripcion.curso : null);

    const tareas = await obtenerTareasDelCurso(sesion?.token, cursoId);
    setTarea(tareas.find((t) => String(t.id) === tareaId));

    const miEntrega = await obtenerMiEntrega(sesion?.token, tareaId);
    setEntrega(miEntrega);

    setCargando(false);
  }

  function nombreEstadoEntrega(estado) {
    if (estado === 'entregada') return 'Entregada, pendiente de calificación';
    if (estado === 'calificada') return 'Calificada';
    return estado;
  }

  if (cargando) {
    return (
      <PanelLayout rol="estudiante">
        <p>Cargando...</p>
      </PanelLayout>
    );
  }

  if (!tarea) {
    return (
      <PanelLayout rol="estudiante">
        <p>Tarea no encontrada.</p>
      </PanelLayout>
    );
  }

  return (
    <PanelLayout rol="estudiante">
      {curso && <p className="tareas-curso-tag">Curso: {curso.nombre} · Grupo: {curso.grupo}</p>}
      <h1>Detalle de tarea estudiante</h1>
      <p className="cursos-subtitulo">Información general de la tarea seleccionada</p>

      <div className="cursos-detalle">
        <p><strong>Título de tarea:</strong> {tarea.titulo}</p>
        <p><strong>Fecha de entrega:</strong> {new Date(tarea.fechaEntrega).toLocaleDateString('es-MX')}</p>
        <p><strong>Puntaje máximo:</strong> {tarea.puntajeMaximo}</p>
        <p><strong>Estado de la tarea:</strong> {tarea.activa ? 'Activa' : 'Cerrada'}</p>
        <p><strong>Instrucciones:</strong> {tarea.descripcion || 'Sin instrucciones adicionales.'}</p>
      </div>

      <h2 className="cursos-subtitulo">Mi entrega</h2>
      <div className="cursos-detalle">
        {!entrega && (
          <p>Todavía no has entregado esta tarea.</p>
        )}
        {entrega && (
          <>
            <p><strong>Fecha en que entregué:</strong> {new Date(entrega.fechaEntrega).toLocaleDateString('es-MX')}</p>
            <p><strong>Estado:</strong> {nombreEstadoEntrega(entrega.estado)}</p>
            <p><strong>Archivo entregado:</strong> {entrega.archivoUrl || 'Sin archivo.'}</p>
            {entrega.comentarioEstudiante && (
              <p><strong>Mi comentario:</strong> {entrega.comentarioEstudiante}</p>
            )}
            {entrega.estado === 'calificada' && (
              <>
                <p><strong>Calificación obtenida:</strong> {entrega.puntajeObtenido} / {tarea.puntajeMaximo}</p>
                <p><strong>Retroalimentación del docente:</strong> {entrega.comentario || 'Sin comentarios del docente.'}</p>
              </>
            )}
          </>
        )}
      </div>

      <div className="cursos-acciones">
        <button className="cursos-boton-secundario" onClick={() => navigate(`/mis-cursos/${cursoId}`)}>
          Volver al curso
        </button>
        {tarea.activa && (
          <button
            className="cursos-boton-principal"
            onClick={() => navigate(`/mis-cursos/${cursoId}/tareas/${tareaId}/entregar`)}
          >
            {entrega ? 'Actualizar entrega' : 'Entregar tarea'}
          </button>
        )}
      </div>
    </PanelLayout>
  );
}

export default DetalleTareaEstudiante;
