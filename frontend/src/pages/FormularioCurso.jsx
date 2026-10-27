import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PanelLayout from '../components/PanelLayout';
import { obtenerCursos, crearCurso, editarCurso, archivarCurso } from '../api';
import { obtenerSesion } from '../utils/sesion';
import './Cursos.css';

// Pantalla IU-06: formulario para crear o editar un curso.
function FormularioCurso() {
  const { id } = useParams();
  const esEdicion = Boolean(id);
  const navigate = useNavigate();
  const sesion = obtenerSesion();

  const [nombre, setNombre] = useState('');
  const [grupo, setGrupo] = useState('');
  const [trimestre, setTrimestre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [estado, setEstado] = useState('activo');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(esEdicion);

  useEffect(() => {
    if (esEdicion) cargarCurso();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function cargarCurso() {
    const lista = await obtenerCursos(sesion?.token);
    const curso = lista.find((c) => String(c.id) === id);
    if (curso) {
      setNombre(curso.nombre);
      setGrupo(curso.grupo || '');
      setTrimestre(curso.trimestre || '');
      setDescripcion(curso.descripcion || '');
      setEstado(curso.estado);
    }
    setCargando(false);
  }

  async function manejarEnvio(evento) {
    evento.preventDefault();
    setError('');
    try {
      if (esEdicion) {
        await editarCurso(sesion?.token, id, { nombre, grupo, trimestre, descripcion });
        navigate(`/cursos/${id}`);
      } else {
        const nuevo = await crearCurso(sesion?.token, { nombre, grupo, trimestre, descripcion });
        navigate(`/cursos/${nuevo.id}`);
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function manejarBorrado() {
    await archivarCurso(sesion?.token, id);
    navigate('/cursos');
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
      <h1>Formulario de curso</h1>
      <p className="cursos-subtitulo">Registro o edicion de informacion del curso</p>

      <form className="cursos-formulario" onSubmit={manejarEnvio}>
        <label>
          Nombre de curso:
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </label>
        <label>
          Grupo:
          <input value={grupo} onChange={(e) => setGrupo(e.target.value)} />
        </label>
        <label>
          Trimestre:
          <input value={trimestre} onChange={(e) => setTrimestre(e.target.value)} />
        </label>
        <label>
          Descripcion:
          <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={3} />
        </label>
        {esEdicion && (
          <p className="cursos-subtitulo">Estado: {estado === 'activo' ? 'Activo' : 'Archivado'}</p>
        )}
        {error && <p className="cursos-error">{error}</p>}
        <div className="cursos-acciones">
          {esEdicion && (
            <button type="button" className="cursos-boton-secundario" onClick={manejarBorrado}>
              Borrar curso
            </button>
          )}
          <button type="submit" className="cursos-boton-principal">
            Guardar curso
          </button>
        </div>
      </form>
    </PanelLayout>
  );
}

export default FormularioCurso;
