import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PanelLayout from '../components/PanelLayout';
import {
  obtenerMisCursos,
  obtenerTareasDelCurso,
  obtenerMiEntrega,
  crearEntrega,
  actualizarEntrega,
} from '../api';
import { obtenerSesion } from '../utils/sesion';
import './Cursos.css';

// Pantalla IU-30: entrega de tarea (vista del estudiante).
// El bosquejo pide un selector de archivo real y un campo "Comentario del
// estudiante". El modelo Entrega solo guarda un link de texto (archivoUrl),
// por eso el archivo se resuelve como un campo de texto para pegar un link
// (ej. Google Drive). El comentario del estudiante si tiene columna propia
// (comentarioEstudiante), distinta de "comentario" que es la retroalimentacion
// que escribe el docente al calificar.
function EntregaTarea() {
  const { cursoId, tareaId } = useParams();
  const navigate = useNavigate();
  const sesion = obtenerSesion();
  const [curso, setCurso] = useState(null);
  const [tarea, setTarea] = useState(null);
  const [entrega, setEntrega] = useState(null);
  const [archivoUrl, setArchivoUrl] = useState('');
  const [comentarioEstudiante, setComentarioEstudiante] = useState('');
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

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
    if (miEntrega) {
      setArchivoUrl(miEntrega.archivoUrl || '');
      setComentarioEstudiante(miEntrega.comentarioEstudiante || '');
    }

    setCargando(false);
  }

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setError('');
    setGuardando(true);

    try {
      const datos = { archivoUrl, comentarioEstudiante };
      if (entrega) {
        await actualizarEntrega(sesion?.token, entrega.id, datos);
      } else {
        await crearEntrega(sesion?.token, { tareaId, ...datos });
      }
      navigate(`/mis-cursos/${cursoId}/tareas/${tareaId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
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

  if (!tarea.activa) {
    return (
      <PanelLayout rol="estudiante">
        <h1>Entrega de tarea</h1>
        <p>Esta tarea ya está cerrada y no se puede entregar.</p>
        <div className="cursos-acciones">
          <button
            className="cursos-boton-secundario"
            onClick={() => navigate(`/mis-cursos/${cursoId}/tareas/${tareaId}`)}
          >
            Volver
          </button>
        </div>
      </PanelLayout>
    );
  }

  if (entrega?.estado === 'calificada') {
    return (
      <PanelLayout rol="estudiante">
        <h1>Entrega de tarea</h1>
        <p>Esta entrega ya fue calificada y no se puede modificar.</p>
        <div className="cursos-acciones">
          <button
            className="cursos-boton-secundario"
            onClick={() => navigate(`/mis-cursos/${cursoId}/tareas/${tareaId}`)}
          >
            Volver
          </button>
        </div>
      </PanelLayout>
    );
  }

  return (
    <PanelLayout rol="estudiante">
      {curso && tarea && (
        <p className="tareas-curso-tag">
          Curso: {curso.nombre} · Tarea: {tarea.titulo}
        </p>
      )}
      <h1>Entrega de tarea</h1>
      <p className="cursos-subtitulo">
        {entrega ? 'Ya entregaste esta tarea. Puedes actualizar tu entrega.' : 'Completa tu entrega para esta tarea'}
      </p>

      <form className="cursos-formulario" onSubmit={manejarEnvio}>
        <label>
          Enlace del archivo (Google Drive u otro)
          <input
            type="text"
            value={archivoUrl}
            onChange={(e) => setArchivoUrl(e.target.value)}
            placeholder="https://drive.google.com/..."
          />
        </label>
        <label>
          Comentario del estudiante
          <textarea
            rows={4}
            value={comentarioEstudiante}
            onChange={(e) => setComentarioEstudiante(e.target.value)}
            placeholder="Algo que quieras decirle a tu docente sobre esta entrega (opcional)"
          />
        </label>

        {error && <p className="cursos-error">{error}</p>}

        <div className="cursos-acciones">
          <button
            type="button"
            className="cursos-boton-secundario"
            onClick={() => navigate(`/mis-cursos/${cursoId}/tareas/${tareaId}`)}
          >
            Cancelar
          </button>
          <button type="submit" className="cursos-boton-principal" disabled={guardando}>
            {entrega ? 'Actualizar entrega' : 'Entregar tarea'}
          </button>
        </div>
      </form>
    </PanelLayout>
  );
}

export default EntregaTarea;
