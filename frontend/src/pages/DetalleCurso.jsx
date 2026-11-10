import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PanelLayout from '../components/PanelLayout';
import { obtenerCursos, obtenerMaterialesDelCurso, crearMaterial, eliminarMaterial } from '../api';
import { obtenerSesion } from '../utils/sesion';
import './Cursos.css';

// Pantalla IU-05: detalle de un curso.
// Materiales del curso (RF-08): no tiene IU propia en los 33 bosquejos de la
// tesina, asi que se agrego como una seccion chica aqui en vez de una pantalla
// nueva (decision de Alejandro, 09/11/2026). Solo agregar y eliminar; sin
// edicion para mantener la seccion simple.
function DetalleCurso() {
  const { id } = useParams();
  const navigate = useNavigate();
  const sesion = obtenerSesion();
  const [curso, setCurso] = useState(null);
  const [materiales, setMateriales] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [tituloMaterial, setTituloMaterial] = useState('');
  const [tipoMaterial, setTipoMaterial] = useState('enlace');
  const [urlMaterial, setUrlMaterial] = useState('');
  const [descripcionMaterial, setDescripcionMaterial] = useState('');
  const [guardandoMaterial, setGuardandoMaterial] = useState(false);
  const [errorMaterial, setErrorMaterial] = useState('');

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function cargar() {
    setCargando(true);
    const lista = await obtenerCursos(sesion?.token);
    setCurso(lista.find((c) => String(c.id) === id));
    const listaMateriales = await obtenerMaterialesDelCurso(sesion?.token, id).catch(() => []);
    setMateriales(listaMateriales);
    setCargando(false);
  }

  async function manejarAgregarMaterial(evento) {
    evento.preventDefault();
    setErrorMaterial('');
    setGuardandoMaterial(true);
    try {
      await crearMaterial(sesion?.token, {
        cursoId: id,
        titulo: tituloMaterial,
        tipo: tipoMaterial,
        url: urlMaterial,
        descripcion: descripcionMaterial,
      });
      setTituloMaterial('');
      setUrlMaterial('');
      setDescripcionMaterial('');
      const listaMateriales = await obtenerMaterialesDelCurso(sesion?.token, id);
      setMateriales(listaMateriales);
    } catch (err) {
      setErrorMaterial(err.message);
    } finally {
      setGuardandoMaterial(false);
    }
  }

  async function manejarEliminarMaterial(materialId) {
    await eliminarMaterial(sesion?.token, materialId);
    setMateriales((anterior) => anterior.filter((m) => m.id !== materialId));
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
      <p className="cursos-subtitulo">Información general del curso seleccionado</p>

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
          <strong>Descripción:</strong> {curso.descripcion || 'Sin descripción.'}
        </p>
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
              <button
                className="cursos-boton-secundario"
                onClick={() => manejarEliminarMaterial(material.id)}
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}

      <form className="cursos-formulario" onSubmit={manejarAgregarMaterial}>
        <label>
          Título
          <input
            value={tituloMaterial}
            onChange={(e) => setTituloMaterial(e.target.value)}
            required
          />
        </label>
        <label>
          Tipo
          <select value={tipoMaterial} onChange={(e) => setTipoMaterial(e.target.value)}>
            <option value="enlace">Enlace</option>
            <option value="PDF">PDF</option>
            <option value="video">Video</option>
            <option value="presentacion">Presentación</option>
          </select>
        </label>
        <label>
          URL
          <input
            type="url"
            value={urlMaterial}
            onChange={(e) => setUrlMaterial(e.target.value)}
            placeholder="https://..."
            required
          />
        </label>
        <label>
          Descripción (opcional)
          <textarea
            rows={2}
            value={descripcionMaterial}
            onChange={(e) => setDescripcionMaterial(e.target.value)}
          />
        </label>
        {errorMaterial && <p className="cursos-error">{errorMaterial}</p>}
        <button type="submit" className="cursos-boton-secundario" disabled={guardandoMaterial}>
          Agregar material
        </button>
      </form>

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
