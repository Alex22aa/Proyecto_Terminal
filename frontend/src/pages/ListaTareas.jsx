import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PanelLayout from '../components/PanelLayout';
import { obtenerCursos, obtenerTareasDelCurso, obtenerEntregasDeTarea, obtenerRubricaDeTarea } from '../api';
import { obtenerSesion } from '../utils/sesion';
import './Cursos.css';

// Pantalla IU-07: lista de tareas de un curso (vista del docente).
function ListaTareas() {
  const { cursoId } = useParams();
  const navigate = useNavigate();
  const sesion = obtenerSesion();
  const [curso, setCurso] = useState(null);
  const [tareas, setTareas] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursoId]);

  async function cargar() {
    setCargando(true);
    setError('');
    try {
      const [cursos, listaTareas] = await Promise.all([
        obtenerCursos(sesion?.token),
        obtenerTareasDelCurso(sesion?.token, cursoId),
      ]);
      setCurso(cursos.find((c) => String(c.id) === cursoId));

      // Por cada tarea, también se consulta cuántas entregas tiene y si ya
      // tiene rúbrica definida, porque el bosquejo lo pide en cada tarjeta.
      const tareasConDatos = await Promise.all(
        listaTareas.map(async (tarea) => {
          const [entregas, rubrica] = await Promise.all([
            obtenerEntregasDeTarea(sesion?.token, tarea.id).catch(() => []),
            obtenerRubricaDeTarea(sesion?.token, tarea.id).catch(() => null),
          ]);
          return { ...tarea, entregasCount: entregas.length, tieneRubrica: Boolean(rubrica) };
        })
      );
      setTareas(tareasConDatos);
    } catch {
      setError('No se pudieron cargar las tareas.');
    } finally {
      setCargando(false);
    }
  }

  const tareasFiltradas = tareas.filter((tarea) =>
    tarea.titulo.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <PanelLayout rol="docente">
      {curso && <p className="tareas-curso-tag">Curso: {curso.nombre}</p>}
      <div className="cursos-encabezado">
        <div>
          <h1>Lista de tareas docente</h1>
          <p className="cursos-subtitulo">Tareas asociadas al curso seleccionado</p>
        </div>
        <button
          className="cursos-boton-principal"
          onClick={() => navigate(`/cursos/${cursoId}/tareas/nueva`)}
        >
          Agregar tarea
        </button>
      </div>

      <input
        className="cursos-buscador"
        placeholder="Buscar tarea"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {cargando && <p>Cargando tareas...</p>}
      {error && <p className="cursos-error">{error}</p>}

      <div className="cursos-grid">
        {tareasFiltradas.map((tarea) => (
          <div key={tarea.id} className="cursos-tarjeta">
            <h3>{tarea.titulo}</h3>
            <p>Fecha de entrega: {new Date(tarea.fechaEntrega).toLocaleDateString('es-MX')}</p>
            <p>Estado: {tarea.activa ? 'Activa' : 'Cerrada'}</p>
            <p>Entregas: {tarea.entregasCount}</p>
            <p>Rúbrica: {tarea.tieneRubrica ? 'Definida' : 'No definida'}</p>
            <button
              className="cursos-boton-secundario"
              onClick={() => navigate(`/cursos/${cursoId}/tareas/${tarea.id}`)}
            >
              Ver tarea
            </button>
          </div>
        ))}
        {!cargando && tareasFiltradas.length === 0 && <p>Todavía no hay tareas en este curso.</p>}
      </div>

      <div className="cursos-acciones">
        <button className="cursos-boton-secundario" onClick={() => navigate(`/cursos/${cursoId}`)}>
          Volver al curso
        </button>
      </div>
    </PanelLayout>
  );
}

export default ListaTareas;
