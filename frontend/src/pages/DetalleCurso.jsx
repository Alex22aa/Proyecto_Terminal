import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PanelLayout from '../components/PanelLayout';
import { obtenerCursos } from '../api';
import { obtenerSesion } from '../utils/sesion';
import './Cursos.css';

// Pantalla IU-05: detalle de un curso.
function DetalleCurso() {
  const { id } = useParams();
  const navigate = useNavigate();
  const sesion = obtenerSesion();
  const [curso, setCurso] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function cargar() {
    setCargando(true);
    const lista = await obtenerCursos(sesion?.token);
    setCurso(lista.find((c) => String(c.id) === id));
    setCargando(false);
  }

  if (cargando) {
    return (
      <PanelLayout rol="docente">
        <p>Cargando...</p>
      </PanelLayout>
    );
  }

  if (!curso) {
    return (
      <PanelLayout rol="docente">
        <p>Curso no encontrado.</p>
      </PanelLayout>
    );
  }

  return (
    <PanelLayout rol="docente">
      <h1>Detalle de curso</h1>
      <p className="cursos-subtitulo">Informacion general del curso seleccionado</p>

      <div className="cursos-detalle">
        <p>
          <strong>Nombre del curso:</strong> {curso.nombre}
        </p>
        <p>
          <strong>Grupo:</strong> {curso.grupo || '—'}
        </p>
        <p>
          <strong>Trimestre:</strong> {curso.trimestre || '—'}
        </p>
        <p>
          <strong>Estudiantes inscritos:</strong> {curso.estudiantesInscritos}
        </p>
        <p>
          <strong>Tareas activas:</strong> {curso.tareasActivas}
        </p>
        <p>
          <strong>Estado:</strong> {curso.estado === 'activo' ? 'Activo' : 'Archivado'}
        </p>
        <p>
          <strong>Descripcion:</strong> {curso.descripcion || 'Sin descripcion.'}
        </p>
      </div>

      <div className="cursos-acciones">
        <button className="cursos-boton-secundario" onClick={() => navigate('/cursos')}>
          Volver
        </button>
        <button className="cursos-boton-secundario" onClick={() => navigate(`/cursos/${curso.id}/tareas`)}>
          Tareas
        </button>
        <button className="cursos-boton-principal" onClick={() => navigate(`/cursos/${curso.id}/editar`)}>
          Editar curso
        </button>
      </div>
    </PanelLayout>
  );
}

export default DetalleCurso;
