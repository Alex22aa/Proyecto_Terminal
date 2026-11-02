import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PanelLayout from '../components/PanelLayout';
import { obtenerTareasDelCurso, crearTarea, editarTarea, desactivarTarea } from '../api';
import { obtenerSesion } from '../utils/sesion';
import './Cursos.css';

// Pantalla IU-09: formulario para crear o editar una tarea.
// "Descripción" aquí también cubre las instrucciones: el modelo Tarea no
// tiene un campo aparte para eso, así que se escriben juntas.
function FormularioTarea() {
  const { cursoId, tareaId } = useParams();
  const esEdicion = Boolean(tareaId);
  const navigate = useNavigate();
  const sesion = obtenerSesion();

  const [titulo, setTitulo] = useState('');
  const [fechaEntrega, setFechaEntrega] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [puntajeMaximo, setPuntajeMaximo] = useState('100');
  const [activa, setActiva] = useState(true);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(esEdicion);

  useEffect(() => {
    if (esEdicion) cargarTarea();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tareaId]);

  async function cargarTarea() {
    const lista = await obtenerTareasDelCurso(sesion?.token, cursoId);
    const tarea = lista.find((t) => String(t.id) === tareaId);
    if (tarea) {
      setTitulo(tarea.titulo);
      setFechaEntrega(tarea.fechaEntrega.slice(0, 10));
      setDescripcion(tarea.descripcion || '');
      setPuntajeMaximo(String(tarea.puntajeMaximo));
      setActiva(tarea.activa);
    }
    setCargando(false);
  }

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setError('');
    try {
      if (esEdicion) {
        await editarTarea(sesion?.token, tareaId, { titulo, fechaEntrega, descripcion, puntajeMaximo });
        navigate(`/cursos/${cursoId}/tareas/${tareaId}`);
      } else {
        const nueva = await crearTarea(sesion?.token, {
          cursoId,
          titulo,
          fechaEntrega,
          descripcion,
          puntajeMaximo,
        });
        navigate(`/cursos/${cursoId}/tareas/${nueva.id}`);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function manejarBorrado() {
    await desactivarTarea(sesion?.token, tareaId);
    navigate(`/cursos/${cursoId}/tareas`);
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
      <h1>Formulario de tarea</h1>
      <p className="cursos-subtitulo">Registro o edición de información de la tarea</p>

      <form className="cursos-formulario" onSubmit={manejarEnvio}>
        <label>
          Título de tarea:
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
        </label>
        <label>
          Fecha de entrega:
          <input
            type="date"
            value={fechaEntrega}
            onChange={(e) => setFechaEntrega(e.target.value)}
            required
          />
        </label>
        <label>
          Descripción (incluye instrucciones):
          <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={4} />
        </label>
        <label>
          Puntaje máximo:
          <input
            type="number"
            min="0"
            step="0.01"
            value={puntajeMaximo}
            onChange={(e) => setPuntajeMaximo(e.target.value)}
          />
        </label>
        {esEdicion && <p className="cursos-subtitulo">Estado: {activa ? 'Activa' : 'Cerrada'}</p>}
        {error && <p className="cursos-error">{error}</p>}
        <div className="cursos-acciones">
          {esEdicion && (
            <button type="button" className="cursos-boton-secundario" onClick={manejarBorrado}>
              Borrar tarea
            </button>
          )}
          {esEdicion && (
            <button
              type="button"
              className="cursos-boton-secundario"
              onClick={() => navigate(`/cursos/${cursoId}/tareas/${tareaId}/rubrica`)}
            >
              Definir rúbrica
            </button>
          )}
          <button type="submit" className="cursos-boton-principal">
            Guardar tarea
          </button>
        </div>
      </form>
    </PanelLayout>
  );
}

export default FormularioTarea;
