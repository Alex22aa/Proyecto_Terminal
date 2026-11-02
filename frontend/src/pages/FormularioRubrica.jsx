import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PanelLayout from '../components/PanelLayout';
import {
  obtenerTareasDelCurso,
  obtenerRubricaDeTarea,
  crearRubrica,
  editarRubrica,
  eliminarRubrica,
  obtenerCriteriosDeRubrica,
  crearCriterio,
  editarCriterio,
  eliminarCriterio,
} from '../api';
import { obtenerSesion } from '../utils/sesion';
import './Cursos.css';

// Pantalla IU-10: formulario de rúbrica y sus criterios de evaluación.
// Primero se guarda la rúbrica (nombre, descripción, puntaje total); una vez
// que existe, se pueden agregar/editar/eliminar sus criterios.
function FormularioRubrica() {
  const { cursoId, tareaId } = useParams();
  const navigate = useNavigate();
  const sesion = obtenerSesion();

  const [tarea, setTarea] = useState(null);
  const [rubrica, setRubrica] = useState(null);
  const [criterios, setCriterios] = useState([]);

  const [nombreRubrica, setNombreRubrica] = useState('');
  const [descripcionRubrica, setDescripcionRubrica] = useState('');
  const [puntajeTotal, setPuntajeTotal] = useState('100');

  const [nuevoCriterio, setNuevoCriterio] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tareaId]);

  async function cargar() {
    setCargando(true);
    const tareas = await obtenerTareasDelCurso(sesion?.token, cursoId);
    setTarea(tareas.find((t) => String(t.id) === tareaId));

    const rubricaExistente = await obtenerRubricaDeTarea(sesion?.token, tareaId).catch(() => null);
    if (rubricaExistente) {
      setRubrica(rubricaExistente);
      setNombreRubrica(rubricaExistente.titulo);
      setDescripcionRubrica(rubricaExistente.descripcion || '');
      setPuntajeTotal(String(rubricaExistente.puntajeTotal));
      const listaCriterios = await obtenerCriteriosDeRubrica(sesion?.token, rubricaExistente.id);
      setCriterios(listaCriterios);
    }
    setCargando(false);
  }

  async function guardarRubrica(evento) {
    evento.preventDefault();
    setError('');
    try {
      if (rubrica) {
        const actualizada = await editarRubrica(sesion?.token, rubrica.id, {
          titulo: nombreRubrica,
          descripcion: descripcionRubrica,
          puntajeTotal,
        });
        setRubrica(actualizada);
      } else {
        const nueva = await crearRubrica(sesion?.token, {
          tareaId,
          titulo: nombreRubrica,
          descripcion: descripcionRubrica,
          puntajeTotal,
        });
        setRubrica(nueva);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function borrarRubrica() {
    await eliminarRubrica(sesion?.token, rubrica.id);
    navigate(`/cursos/${cursoId}/tareas/${tareaId}`);
  }

  function mostrarFormularioCriterio() {
    setNuevoCriterio({ nombre: '', descripcion: '', puntajeMaximo: '' });
  }

  async function guardarNuevoCriterio() {
    const guardado = await crearCriterio(sesion?.token, {
      rubricaId: rubrica.id,
      nombre: nuevoCriterio.nombre,
      descripcion: nuevoCriterio.descripcion,
      puntajeMaximo: nuevoCriterio.puntajeMaximo,
    });
    setCriterios([...criterios, guardado]);
    setNuevoCriterio(null);
  }

  function cambiarCriterio(id, campo, valor) {
    setCriterios(criterios.map((c) => (c.id === id ? { ...c, [campo]: valor } : c)));
  }

  async function actualizarCriterio(criterio) {
    const actualizado = await editarCriterio(sesion?.token, criterio.id, {
      nombre: criterio.nombre,
      descripcion: criterio.descripcion,
      puntajeMaximo: criterio.puntajeMaximo,
    });
    setCriterios(criterios.map((c) => (c.id === actualizado.id ? actualizado : c)));
  }

  async function borrarCriterio(id) {
    await eliminarCriterio(sesion?.token, id);
    setCriterios(criterios.filter((c) => c.id !== id));
  }

  if (cargando) {
    return (
      <PanelLayout rol="docente">
        <p>Cargando...</p>
      </PanelLayout>
    );
  }

  return (
    <PanelLayout rol="docente">
      <h1>Formulario de rúbrica</h1>
      <p className="cursos-subtitulo">Definición de criterios de evaluación de la tarea</p>
      {tarea && <p className="tareas-curso-tag">Tarea: {tarea.titulo}</p>}

      <form className="cursos-formulario" onSubmit={guardarRubrica}>
        <label>
          Nombre de la rúbrica:
          <input value={nombreRubrica} onChange={(e) => setNombreRubrica(e.target.value)} required />
        </label>
        <label>
          Descripción general:
          <textarea
            value={descripcionRubrica}
            onChange={(e) => setDescripcionRubrica(e.target.value)}
            rows={3}
          />
        </label>
        <label>
          Puntaje total:
          <input
            type="number"
            min="0"
            step="0.01"
            value={puntajeTotal}
            onChange={(e) => setPuntajeTotal(e.target.value)}
          />
        </label>
        {error && <p className="cursos-error">{error}</p>}
        <div className="cursos-acciones">
          {rubrica && (
            <button type="button" className="cursos-boton-secundario" onClick={borrarRubrica}>
              Borrar rúbrica
            </button>
          )}
          <button type="submit" className="cursos-boton-principal">
            Guardar rúbrica
          </button>
        </div>
      </form>

      {rubrica && (
        <div className="rubrica-criterios">
          <h2>Criterios de evaluación</h2>

          {criterios.map((criterio) => (
            <div key={criterio.id} className="cursos-tarjeta criterio-tarjeta">
              <label>
                Criterio:
                <input
                  value={criterio.nombre}
                  onChange={(e) => cambiarCriterio(criterio.id, 'nombre', e.target.value)}
                />
              </label>
              <label>
                Descripción:
                <input
                  value={criterio.descripcion || ''}
                  onChange={(e) => cambiarCriterio(criterio.id, 'descripcion', e.target.value)}
                />
              </label>
              <label>
                Ponderación:
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={criterio.puntajeMaximo}
                  onChange={(e) => cambiarCriterio(criterio.id, 'puntajeMaximo', e.target.value)}
                />
              </label>
              <div className="cursos-acciones">
                <button
                  type="button"
                  className="cursos-boton-secundario"
                  onClick={() => borrarCriterio(criterio.id)}
                >
                  Eliminar
                </button>
                <button
                  type="button"
                  className="cursos-boton-principal"
                  onClick={() => actualizarCriterio(criterio)}
                >
                  Guardar criterio
                </button>
              </div>
            </div>
          ))}

          {nuevoCriterio ? (
            <div className="cursos-tarjeta criterio-tarjeta">
              <label>
                Criterio:
                <input
                  value={nuevoCriterio.nombre}
                  onChange={(e) => setNuevoCriterio({ ...nuevoCriterio, nombre: e.target.value })}
                />
              </label>
              <label>
                Descripción:
                <input
                  value={nuevoCriterio.descripcion}
                  onChange={(e) => setNuevoCriterio({ ...nuevoCriterio, descripcion: e.target.value })}
                />
              </label>
              <label>
                Ponderación:
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={nuevoCriterio.puntajeMaximo}
                  onChange={(e) =>
                    setNuevoCriterio({ ...nuevoCriterio, puntajeMaximo: e.target.value })
                  }
                />
              </label>
              <button type="button" className="cursos-boton-principal" onClick={guardarNuevoCriterio}>
                Guardar criterio
              </button>
            </div>
          ) : (
            <button type="button" className="cursos-boton-secundario" onClick={mostrarFormularioCriterio}>
              Agregar criterio
            </button>
          )}
        </div>
      )}

      <div className="cursos-acciones">
        <button
          className="cursos-boton-secundario"
          onClick={() => navigate(`/cursos/${cursoId}/tareas/${tareaId}`)}
        >
          Volver
        </button>
      </div>
    </PanelLayout>
  );
}

export default FormularioRubrica;
