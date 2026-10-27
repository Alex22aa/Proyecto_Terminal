import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PanelLayout from '../components/PanelLayout';
import { obtenerCursos } from '../api';
import { obtenerSesion } from '../utils/sesion';
import './Cursos.css';

// Pantalla IU-04: lista de cursos del docente.
function ListaCursos() {
  const navigate = useNavigate();
  const sesion = obtenerSesion();
  const [cursos, setCursos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setCargando(true);
    setError('');
    try {
      const lista = await obtenerCursos(sesion?.token);
      setCursos(lista);
    } catch {
      setError('No se pudieron cargar los cursos.');
    } finally {
      setCargando(false);
    }
  }

  const cursosFiltrados = cursos.filter((curso) =>
    curso.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <PanelLayout rol="docente">
      <div className="cursos-encabezado">
        <div>
          <h1>Lista de cursos</h1>
          <p className="cursos-subtitulo">Cursos asignados al docente</p>
        </div>
        <button className="cursos-boton-principal" onClick={() => navigate('/cursos/nuevo')}>
          Agregar curso
        </button>
      </div>

      <input
        className="cursos-buscador"
        placeholder="Buscar curso"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {cargando && <p>Cargando cursos...</p>}
      {error && <p className="cursos-error">{error}</p>}

      <div className="cursos-grid">
        {cursosFiltrados.map((curso) => (
          <div key={curso.id} className="cursos-tarjeta">
            <h3>{curso.nombre}</h3>
            <p>Grupo: {curso.grupo || '—'}</p>
            <p>Trimestre: {curso.trimestre || '—'}</p>
            <p>Estudiantes: {curso.estudiantesInscritos}</p>
            <p>Tareas activas: {curso.tareasActivas}</p>
            <button className="cursos-boton-secundario" onClick={() => navigate(`/cursos/${curso.id}`)}>
              Ver curso
            </button>
          </div>
        ))}
        {!cargando && cursosFiltrados.length === 0 && <p>Todavia no tienes cursos registrados.</p>}
      </div>
    </PanelLayout>
  );
}

export default ListaCursos;
