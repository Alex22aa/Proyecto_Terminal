import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PanelLayout from '../components/PanelLayout';
import { obtenerMisCursos, obtenerTareasDelCurso, obtenerMiEntrega } from '../api';
import { obtenerSesion } from '../utils/sesion';
import './Cursos.css';

// Pantalla IU-22: lista de cursos del estudiante.
function MisCursos() {
  const navigate = useNavigate();
  const sesion = obtenerSesion();
  const [cursos, setCursos] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function cargar() {
    setCargando(true);
    const inscripciones = await obtenerMisCursos(sesion?.token);
    const cursosConEstadisticas = await Promise.all(
      inscripciones.map(async (inscripcion) => {
        const estadisticas = await calcularEstadisticas(sesion?.token, inscripcion.curso.id);
        return { ...inscripcion.curso, ...estadisticas };
      })
    );
    setCursos(cursosConEstadisticas);
    setCargando(false);
  }

  async function calcularEstadisticas(token, cursoId) {
    const tareas = await obtenerTareasDelCurso(token, cursoId);
    const tareasActivas = tareas.filter((tarea) => tarea.activa);
    const entregas = await Promise.all(
      tareasActivas.map((tarea) => obtenerMiEntrega(token, tarea.id))
    );

    let tareasPendientes = 0;
    const calificaciones = [];
    tareasActivas.forEach((tarea, indice) => {
      const entrega = entregas[indice];
      if (!entrega) {
        tareasPendientes += 1;
      } else if (entrega.estado === 'calificada' && entrega.puntajeObtenido !== null) {
        calificaciones.push((entrega.puntajeObtenido / tarea.puntajeMaximo) * 10);
      }
    });

    const promedioActual =
      calificaciones.length > 0
        ? (calificaciones.reduce((suma, valor) => suma + valor, 0) / calificaciones.length).toFixed(1)
        : null;

    return { tareasPendientes, promedioActual };
  }

  const cursosFiltrados = cursos.filter((curso) =>
    curso.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <PanelLayout rol="estudiante">
      <h1>Lista de cursos del estudiante</h1>
      <p className="cursos-subtitulo">Cursos inscritos del estudiante</p>

      <input
        className="cursos-buscador"
        placeholder="Buscar curso"
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
      />

      {cargando && <p>Cargando cursos...</p>}

      {!cargando && cursosFiltrados.length === 0 && <p>Todavía no estás inscrito en ningún curso.</p>}

      <div className="cursos-grid">
        {cursosFiltrados.map((curso) => (
          <div key={curso.id} className="cursos-tarjeta">
            <h3>{curso.nombre}</h3>
            <p>Grupo: {curso.grupo}</p>
            <p>Trimestre: {curso.trimestre}</p>
            <p>Tareas pendientes: {curso.tareasPendientes}</p>
            <p>Promedio actual: {curso.promedioActual ?? 'Sin calificaciones aún'}</p>
            <div className="cursos-acciones">
              <button
                className="cursos-boton-principal"
                onClick={() => navigate(`/mis-cursos/${curso.id}`)}
              >
                Ver curso
              </button>
            </div>
          </div>
        ))}
      </div>
    </PanelLayout>
  );
}

export default MisCursos;
