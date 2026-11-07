import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PanelLayout from '../components/PanelLayout';
import {
  obtenerTareasDelCurso,
  obtenerEntregasDeTarea,
  obtenerRubricaDeTarea,
  obtenerCriteriosDeRubrica,
  calificarEntrega,
} from '../api';
import { obtenerSesion } from '../utils/sesion';
import './Cursos.css';

// Pantalla IU-12: detalle de una entrega (vista del docente).
// No hay una IU aparte para calificar en los 33 bosquejos, asi que el
// formulario de calificacion vive aqui mismo, dentro del detalle.
//
// Si la tarea tiene rubrica con criterios (IU-10), calificar se hace
// criterio por criterio y el puntaje final se suma solo; si no tiene
// rubrica, se mantiene el campo de puntaje unico de siempre. Decision de
// Alejandro (07/11/2026): solo se guarda el total en la entrega, no el
// desglose por criterio (para no agregar una columna nueva fuera del
// diccionario de datos aprobado), asi que al reabrir una entrega ya
// calificada hay que volver a capturar los criterios si se quiere ajustar.
function DetalleEntrega() {
  const { cursoId, tareaId, entregaId } = useParams();
  const navigate = useNavigate();
  const sesion = obtenerSesion();
  const [tarea, setTarea] = useState(null);
  const [entrega, setEntrega] = useState(null);
  const [rubrica, setRubrica] = useState(null);
  const [criterios, setCriterios] = useState([]);
  const [puntajesCriterios, setPuntajesCriterios] = useState({});
  const [cargando, setCargando] = useState(true);
  const [puntajeObtenido, setPuntajeObtenido] = useState('');
  const [comentario, setComentario] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entregaId]);

  async function cargar() {
    setCargando(true);
    const [tareas, entregas, rubricaEncontrada] = await Promise.all([
      obtenerTareasDelCurso(sesion?.token, cursoId),
      obtenerEntregasDeTarea(sesion?.token, tareaId),
      obtenerRubricaDeTarea(sesion?.token, tareaId).catch(() => null),
    ]);
    const tareaEncontrada = tareas.find((t) => String(t.id) === tareaId);
    const entregaEncontrada = entregas.find((e) => String(e.id) === entregaId);
    setTarea(tareaEncontrada);
    setEntrega(entregaEncontrada);
    setRubrica(rubricaEncontrada);

    const listaCriterios = rubricaEncontrada
      ? await obtenerCriteriosDeRubrica(sesion?.token, rubricaEncontrada.id).catch(() => [])
      : [];
    setCriterios(listaCriterios);
    setPuntajesCriterios({});

    if (entregaEncontrada) {
      setPuntajeObtenido(entregaEncontrada.puntajeObtenido ?? '');
      setComentario(entregaEncontrada.comentario ?? '');
    }
    setCargando(false);
  }

  // Si hay criterios, el puntaje se califica por criterio y se suma solo.
  const usaRubrica = criterios.length > 0;
  const sumaCriterios = criterios.reduce(
    (suma, c) => suma + (Number(puntajesCriterios[c.id]) || 0),
    0
  );

  function actualizarPuntajeCriterio(criterioId, valor) {
    setPuntajesCriterios((anterior) => ({ ...anterior, [criterioId]: valor }));
  }

  function nombreEstado(estado) {
    if (estado === 'entregada') return 'Entregada, pendiente de calificación';
    if (estado === 'calificada') return 'Calificada';
    return estado;
  }

  async function manejarCalificar(evento) {
    evento.preventDefault();
    setError('');
    setGuardando(true);
    try {
      const entregaActualizada = await calificarEntrega(sesion?.token, entrega.id, {
        puntajeObtenido: usaRubrica ? sumaCriterios : Number(puntajeObtenido),
        comentario,
      });
      setEntrega(entregaActualizada);
    } catch (err) {
      setError(err.message);
    } finally {
      setGuardando(false);
    }
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
          <strong>Estado:</strong> {nombreEstado(entrega.estado)}
        </p>
        <p>
          <strong>Archivo entregado:</strong> {entrega.archivoUrl || 'Sin archivo (entrega de solo texto).'}
        </p>
        <p>
          <strong>Comentario del estudiante:</strong> {entrega.comentarioEstudiante || 'Sin comentario del estudiante.'}
        </p>
        <p>
          <strong>Calificación actual:</strong> {entrega.puntajeObtenido ?? 'Pendiente'} / {tarea?.puntajeMaximo}
        </p>
        <p>
          <strong>Rúbrica:</strong> {rubrica ? `Definida (${rubrica.titulo})` : 'No definida'}
        </p>
        <p>
          <strong>Retroalimentación del docente:</strong> {entrega.comentario || 'Sin comentarios todavía.'}
        </p>
      </div>

      <h2 className="cursos-subtitulo">Calificar entrega</h2>
      <form className="cursos-formulario" onSubmit={manejarCalificar}>
        {usaRubrica ? (
          <>
            {entrega.estado === 'calificada' && (
              <p className="cursos-subtitulo">
                Vuelve a capturar el puntaje de cada criterio para actualizar la calificación.
              </p>
            )}
            {criterios.map((criterio) => (
              <label key={criterio.id}>
                {criterio.nombre} (máximo {criterio.puntajeMaximo})
                {criterio.descripcion && (
                  <span className="cursos-subtitulo" style={{ display: 'block', margin: '2px 0' }}>
                    {criterio.descripcion}
                  </span>
                )}
                <input
                  type="number"
                  min="0"
                  max={criterio.puntajeMaximo}
                  step="0.01"
                  value={puntajesCriterios[criterio.id] ?? ''}
                  onChange={(e) => actualizarPuntajeCriterio(criterio.id, e.target.value)}
                  required
                />
              </label>
            ))}
            <p>
              <strong>Puntaje total:</strong> {sumaCriterios.toFixed(1)} / {rubrica.puntajeTotal}
            </p>
          </>
        ) : (
          <label>
            Puntaje obtenido (máximo {tarea?.puntajeMaximo})
            <input
              type="number"
              min="0"
              max={tarea?.puntajeMaximo}
              step="0.01"
              value={puntajeObtenido}
              onChange={(e) => setPuntajeObtenido(e.target.value)}
              required
            />
          </label>
        )}
        <label>
          Retroalimentación
          <textarea
            rows={4}
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Comentarios para el estudiante sobre su entrega (opcional)"
          />
        </label>

        {error && <p className="cursos-error">{error}</p>}

        <div className="cursos-acciones">
          <button type="submit" className="cursos-boton-principal" disabled={guardando}>
            {entrega.estado === 'calificada' ? 'Actualizar calificación' : 'Calificar entrega'}
          </button>
        </div>
      </form>

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
