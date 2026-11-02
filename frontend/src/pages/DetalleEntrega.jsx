import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PanelLayout from '../components/PanelLayout';
import { obtenerTareasDelCurso, obtenerEntregasDeTarea, obtenerRubricaDeTarea } from '../api';
import { obtenerSesion } from '../utils/sesion';
import './Cursos.css';

// Pantalla IU-12: detalle de una entrega (vista del docente).
function DetalleEntrega() {
  const { cursoId, tareaId, entregaId } = useParams();
  const navigate = useNavigate();
  const sesion = obtenerSesion();
  const [tarea, setTarea] = useState(null);
  const [entrega, setEntrega] = useState(null);
  const [tieneRubrica, setTieneRubrica] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entregaId]);

  async function cargar() {
    setCargando(true);
    const [tareas, entregas, rubrica] = await Promise.all([
      obtenerTareasDelCurso(sesion?.token, cursoId),
      obtenerEntregasDeTarea(sesion?.token, tareaId),
      obtenerRubricaDeTarea(sesion?.token, tareaId).catch(() => null),
    ]);
    setTarea(tareas.find((t) => String(t.id) === tareaId));
    setEntrega(entregas.find((e) => String(e.id) === entregaId));
    setTieneRubrica(Boolean(rubrica));
    setCargando(false);
  }

  if (cargando) {
    return (
      <PanelLayout rol="docente">
        <p>Cargando...</p>
      </PanelLayout>
    );
  }

  if (!entrega) {
    return (
      <PanelLayout rol="docente">
        <p>Entrega no encontrada.</p>
      </PanelLayout>
    );
  }

  return (
    <PanelLayout rol="docente">
      {tarea && <p className="tareas-curso-tag">Tarea: {tarea.titulo}</p>}
      <h1>Detalle de entrega</h1>
      <p className="cursos-subtitulo">Información de la entrega seleccionada</p>

      <div className="cursos-detalle">
        <p>
          <strong>Estudiante:</strong> {entrega.estudiante?.nombreCompleto}
        </p>
        <p>
          <strong>Fecha de entrega:</strong> {new Date(entrega.fechaEntrega).toLocaleDateString('es-MX')}
        </p>
        <p>
          <strong>Estado:</strong> {entrega.estado}
        </p>
        <p>
          <strong>Archivo entregado:</strong> {entrega.archivoUrl || 'Sin archivo (entrega de solo texto).'}
        </p>
        <p>
          <strong>Calificación actual:</strong> {entrega.puntajeObtenido ?? 'Pendiente'}
        </p>
        <p>
          <strong>Rúbrica:</strong> {tieneRubrica ? 'Definida' : 'No definida'}
        </p>
        <p>
          <strong>Resumen de la entrega:</strong> {entrega.comentario || 'Sin comentarios todavía.'}
        </p>
      </div>

      <div className="cursos-acciones">
        <button
          className="cursos-boton-secundario"
          onClick={() => navigate(`/cursos/${cursoId}/tareas/${tareaId}/entregas`)}
        >
          Volver a entregas
        </button>
        <button
          className="cursos-boton-principal"
          onClick={() =>
            navigate(`/cursos/${cursoId}/tareas/${tareaId}/entregas/${entregaId}/evaluacion-ia`)
          }
        >
          Solicitar evaluación asistida
        </button>
      </div>
    </PanelLayout>
  );
}

export default DetalleEntrega;
