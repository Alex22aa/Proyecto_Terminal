import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PanelLayout from '../components/PanelLayout';
import {
  obtenerMisCursos,
  obtenerTareasDelCurso,
  obtenerMiEntrega,
  obtenerMaterialesDelCurso,
} from '../api';
import { obtenerSesion } from '../utils/sesion';
import './Cursos.css';

// Pantalla IU-24: detalle de un curso desde la perspectiva del estudiante.
// Incluye los materiales del curso (RF-08) en modo solo lectura (ver
// DetalleCurso.jsx para la version del docente, con agregar/eliminar).
function DetalleCursoEstudiante() {
  const { cursoId } = useParams();
  const navigate = useNavigate();
  const sesion = obtenerSesion();
  const [curso, setCurso] = useState(null);
  const [filas, setFilas] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursoId]);

  async function cargar() {
    setCargando(true);

    const inscripciones = await obtenerMisCursos(sesion?.token);
    const inscripcion = inscripciones.find((i) => String(i.curso.id) === cursoId);
    setCurso(inscripcion ? inscripcion.curso : null);

    const tareas = await obtenerTareasDelCurso(sesion?.token, cursoId);
    const tareasActivas = tareas.filter((tarea) => tarea.activa);
    const entregas = await Promise.all(
      tareasActivas.map((tarea) => obtenerMiEntrega(sesion?.token, tarea.id))
    );

    const filasTareas = tareasActivas.map((tarea, indice) => ({
      tarea,
      entrega: entregas[indice],
    }));
    setFilas(filasTareas);

    const listaMateriales = await obtenerMaterialesDelCurso(sesion?.token, cursoId).catch(() => []);
    setMateriales(listaMateriales);

    setCargando(false);
  }

  function nombreEstado(estado) {
    if (estado === 'activo') return 'En curso';
    if (estado === 'archivado') return 'Archivado';
    return estado;
  }

  const tareasPendientes = filas.filter((f) => !f.entrega).length;
  const tareasEntregadas = filas.filter((f) => f.entrega).length;
  const calificaciones = filas
    .filter((f) => f.entrega?.estado === 'calificada' && f.entrega?.puntajeObtenido !== null)
    .map((f) => (f.entrega.puntajeObtenido / f.tarea.puntajeMaximo) * 10);
  const promedioActual =
    calificaciones.length > 0
      ? (calificaciones.reduce((suma, valor) => suma + valor, 0) / calificaciones.length).toFixed(1)
      : null;

  if (cargando) {
    return (
      <PanelLayout rol="estudiante">
        <p>Cargando...</p>
      </PanelLayout>
    );
  }

  if (!curso) {
    return (
      <PanelLayout rol="estudiante">
        <p>Curso no encontrado o no estás inscrito en él.</p>
      </PanelLayout>
    );
  }

  return (
    <PanelLayout rol="estudiante">
      <p className="tareas-curso-tag">
        Curso: {curso.nombre} · Grupo: {curso.grupo} · Trimestre: {curso.trimestre}
      </p>
      <h1>Detalle de curso estudiante</h1>
      <p className="cursos-subtitulo">Información general del curso seleccionado</p>

      <div className="cursos-detalle">
        <p><strong>Nombre del curso:</strong> {curso.nombre}</p>
        <p><strong>Grupo:</strong> {curso.grupo}</p>
        <p><strong>Trimestre:</strong> {curso.trimestre}</p>
        <p><strong>Docente:</strong> {curso.docente?.nombreCompleto}</p>
        <p><strong>Promedio actual:</strong> {promedioActual ?? 'Sin calificaciones aún'}</p>
        <p><strong>Tareas pendientes:</strong> {tareasPendientes}</p>
        <p><strong>Tareas entregadas:</strong> {tareasEntregadas}</p>
        <p><strong>Estado:</strong> {nombreEstado(curso.estado)}</p>
        <p><strong>Descripción:</strong> {curso.descripcion}</p>
      </div>

      <h2 className="cursos-subtitulo">Materiales del curso</h2>
      {materiales.length === 0 && <p>Este curso todavía no tiene materiales.</p>}
      {materiales.length > 0 && (
        <div className="materiales-lista">
          {materiales.map((material) => (
            <div className="material-item" key={material.id}>
              <div>
                <strong>{material.titulo}</strong>{' '}
                <span className="cursos-subtitulo">({material.tipo})</span>
                {material.descripcion && (
                  <p className="cursos-subtitulo">{material.descripcion}</p>
                )}
                <a href={material.url} target="_blank" rel="noreferrer">
                  Abrir material
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {filas.length > 0 && (
        <table className="entregas-tabla">
          <thead>
            <tr>
              <th>Tarea</th>
              <th>Fecha de entrega</th>
              <th>Estado</th>
              <th>Calificación</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filas.map(({ tarea, entrega }) => (
              <tr key={tarea.id}>
                <td>{tarea.titulo}</td>
                <td>{new Date(tarea.fechaEntrega).toLocaleDateString('es-MX')}</td>
                <td>{entrega ? 'Entregada' : 'Pendiente'}</td>
                <td>{entrega?.puntajeObtenido ?? ''}</td>
                <td>
                  <button
                    className="cursos-boton-secundario"
                    onClick={() => navigate(`/mis-cursos/${cursoId}/tareas/${tarea.id}`)}
                  >
                    Ver tarea
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {filas.length === 0 && <p>Este curso todavía no tiene tareas.</p>}

      <div className="cursos-acciones">
        <button className="cursos-boton-secundario" onClick={() => navigate('/mis-cursos')}>
          Volver a lista de cursos
        </button>
      </div>
    </PanelLayout>
  );
}

export default DetalleCursoEstudiante;
