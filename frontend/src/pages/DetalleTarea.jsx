import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PanelLayout from '../components/PanelLayout';
import {
  obtenerCursos,
  obtenerTareasDelCurso,
  obtenerEntregasDeTarea,
  obtenerRubricaDeTarea,
} from '../api';
import { obtenerSesion } from '../utils/sesion';
import './Cursos.css';

// Pantalla IU-08: detalle de una tarea (vista del docente).
function DetalleTarea() {
  const { cursoId, tareaId } = useParams();
  const navigate = useNavigate();
  const sesion = obtenerSesion();
  const [curso, setCurso] = useState(null);
  const [tarea, setTarea] = useState(null);
  const [entregasCount, setEntregasCount] = useState(0);
  const [tieneRubrica, setTieneRubrica] = useState(false);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tareaId]);

  async function cargar() {
    setCargando(true);
    const [cursos, tareas, entregas, rubrica] = await Promise.all([
      obtenerCursos(sesion?.token),
      obtenerTareasDelCurso(sesion?.token, cursoId),
      obtenerEntregasDeTarea(sesion?.token, tareaId).catch(() => []),
      obtenerRubricaDeTarea(sesion?.token, tareaId).catch(() => null),
    ]);
    setCurso(cursos.find((c) => String(c.id) === cursoId));
    setTarea(tareas.find((t) => String(t.id) === tareaId));
    setEntregasCount(entregas.length);
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

  if (!tarea) {
    return (
      <PanelLayout rol="docente">
        <p>Tarea no encontrada.</p>
      </PanelLayout>
    );
  }

  return (
    <PanelLayout rol="docente">
      <h1>Detalle de tarea docente</h1>
      <p className="cursos-subtitulo">Información general de la tarea seleccionada</p>

      <div className="cursos-detalle">
        <p>
          <strong>Título de tarea:</strong> {tarea.titulo}
        </p>
        <p>
          <strong>Curso:</strong> {curso?.nombre}
        </p>
        <p>
          <strong>Fecha de entrega:</strong> {new Date(tarea.fechaEntrega).toLocaleDateString('es-MX')}
        </p>
        <p>
          <strong>Estado:</strong> {tarea.activa ? 'Activa' : 'Cerrada'}
        </p>
        <p>
          <strong>Entregas recibidas:</strong> {entregasCount}
        </p>
        <p>
          <strong>Rúbrica:</strong> {tieneRubrica ? 'Definida' : 'No definida'}
        </p>
        <p>
          <strong>Descripción:</strong> {tarea.descripcion || 'Sin descripción.'}
        </p>
      </div>

      <div className="cursos-acciones">
        <button className="cursos-boton-secundario" onClick={() => navigate(`/cursos/${cursoId}/tareas`)}>
          Volver
        </button>
        <button
          className="cursos-boton-secundario"
          onClick={() => navigate(`/cursos/${cursoId}/tareas/${tareaId}/editar`)}
        >
          Editar tarea
        </button>
        <button
          className="cursos-boton-secundario"
          onClick={() => navigate(`/cursos/${cursoId}/tareas/${tareaId}/rubrica`)}
        >
          {tieneRubrica ? 'Editar rúbrica' : 'Definir rúbrica'}
        </button>
        <button
          className="cursos-boton-principal"
          onClick={() => navigate(`/cursos/${cursoId}/tareas/${tareaId}/entregas`)}
        >
          Ver entregas
        </button>
      </div>
    </PanelLayout>
  );
}

export default DetalleTarea;
