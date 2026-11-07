import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PanelLayout from '../components/PanelLayout';
import { obtenerMisCursos, obtenerTareasDelCurso, obtenerMiEntrega } from '../api';
import { obtenerSesion } from '../utils/sesion';
import './Cursos.css';

// Pantalla IU-26: retroalimentación de una entrega calificada, vista del
// estudiante. Se accede desde el Dashboard (IU-23) y regresa a él, no a
// la pantalla de la tarea.
//
// El bosquejo separa el comentario del docente en "Aspectos positivos",
// "Aspectos a mejorar" y "Sugerencia", pero el modelo Entrega (y el
// formulario de calificar de IU-12) solo tiene un campo único de
// retroalimentación. Mismo criterio ya aplicado en Tarea (IU-09/IU-25):
// se muestra como un solo bloque de texto, sin agregar columnas nuevas.
function Retroalimentacion() {
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

  function nombreEstado(estado) {
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
      {curso && <p className="tareas-curso-tag">Curso: {curso.nombre} · Tarea: {tarea.titulo}</p>}
      <h1>Retroalimentación</h1>
      <p className="cursos-subtitulo">Comentarios y observaciones sobre la tarea</p>

      {!entrega && <p>Todavía no has entregado esta tarea, así que no hay retroalimentación disponible.</p>}

      {entrega && entrega.estado !== 'calificada' && (
        <p>Tu entrega todavía no ha sido calificada, así que no hay retroalimentación disponible.</p>
      )}

      {entrega && entrega.estado === 'calificada' && (
        <div className="cursos-detalle">
          <h2 className="cursos-subtitulo">Información de la retroalimentación</h2>
          <p><strong>Tarea:</strong> {tarea.titulo}</p>
          <p><strong>Curso:</strong> {curso?.nombre}</p>
          <p><strong>Fecha de entrega:</strong> {new Date(entrega.fechaEntrega).toLocaleDateString('es-MX')}</p>
          <p><strong>Estado:</strong> {nombreEstado(entrega.estado)}</p>
          <p><strong>Calificación:</strong> {entrega.puntajeObtenido} / {tarea.puntajeMaximo}</p>
          <p><strong>Comentario del docente:</strong> {entrega.comentario || 'Sin comentarios todavía.'}</p>
        </div>
      )}

      <div className="cursos-acciones">
        <button className="cursos-boton-secundario" onClick={() => navigate('/dashboard-estudiante')}>
          Volver
        </button>
      </div>
    </PanelLayout>
  );
}

export default Retroalimentacion;
