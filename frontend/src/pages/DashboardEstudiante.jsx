import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PanelLayout from '../components/PanelLayout';
import { obtenerMisCursos, obtenerTareasDelCurso, obtenerMiEntrega } from '../api';
import { obtenerSesion } from '../utils/sesion';
import './Cursos.css';
import './Dashboard.css';

// Pantalla IU-23: dashboard del estudiante. Reutiliza el mismo patrón de
// calculo que IU-22/IU-24 (promedio normalizado a escala 0-10 a partir de
// las entregas calificadas), pero juntando todos los cursos inscritos.
//
// La tarjeta "Recomendaciones" y la sección "Recomendaciones académicas"
// del bosquejo se omiten por ahora: dependen de la entidad Recomendacion,
// que requiere integración con IA y sigue en pausa (decidido con Alejandro
// el 04/11/2026). El botón "Ver retroalimentación" lleva a la pantalla
// dedicada IU-26 (Retroalimentacion.jsx).
function DashboardEstudiante() {
  const navigate = useNavigate();
  const sesion = obtenerSesion();
  const [resumenCursos, setResumenCursos] = useState([]);
  const [filas, setFilas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function cargar() {
    setCargando(true);
    const inscripciones = await obtenerMisCursos(sesion?.token);

    const porCurso = await Promise.all(
      inscripciones.map(async (inscripcion) => {
        const curso = inscripcion.curso;
        const tareas = await obtenerTareasDelCurso(sesion?.token, curso.id);
        const tareasActivas = tareas.filter((tarea) => tarea.activa);
        const entregas = await Promise.all(
          tareasActivas.map((tarea) => obtenerMiEntrega(sesion?.token, tarea.id))
        );
        const filasCurso = tareasActivas.map((tarea, indice) => ({
          curso,
          tarea,
          entrega: entregas[indice],
        }));

        const calificaciones = filasCurso
          .filter((f) => f.entrega?.estado === 'calificada' && f.entrega?.puntajeObtenido !== null)
          .map((f) => (f.entrega.puntajeObtenido / f.tarea.puntajeMaximo) * 10);
        const promedio =
          calificaciones.length > 0
            ? calificaciones.reduce((suma, valor) => suma + valor, 0) / calificaciones.length
            : null;

        return { curso, filas: filasCurso, promedio };
      })
    );

    setResumenCursos(porCurso.map(({ curso, promedio }) => ({ curso, promedio })));
    setFilas(porCurso.flatMap((p) => p.filas));
    setCargando(false);
  }

  const tareasPendientes = filas.filter((f) => !f.entrega).length;
  const actividadesEntregadas = filas.filter((f) => f.entrega).length;

  const calificacionesGlobales = filas
    .filter((f) => f.entrega?.estado === 'calificada' && f.entrega?.puntajeObtenido !== null)
    .map((f) => (f.entrega.puntajeObtenido / f.tarea.puntajeMaximo) * 10);
  const promedioActual =
    calificacionesGlobales.length > 0
      ? (calificacionesGlobales.reduce((suma, valor) => suma + valor, 0) / calificacionesGlobales.length).toFixed(1)
      : null;

  const ultimasCalificaciones = filas
    .filter((f) => f.entrega?.estado === 'calificada')
    .sort((a, b) => new Date(b.entrega.fechaCalificacion) - new Date(a.entrega.fechaCalificacion))
    .slice(0, 5);

  const retroalimentacionReciente = filas
    .filter((f) => f.entrega?.estado === 'calificada' && f.entrega?.comentario)
    .sort((a, b) => new Date(b.entrega.fechaCalificacion) - new Date(a.entrega.fechaCalificacion))[0];

  return (
    <PanelLayout rol="estudiante">
      <h1>Dashboard Estudiante</h1>
      <p className="cursos-subtitulo">Análisis general del avance y rendimiento académico</p>

      {cargando && <p>Cargando dashboard...</p>}

      {!cargando && (
        <>
          <div className="dashboard-tarjetas">
            <div className="dashboard-tarjeta">
              <p className="dashboard-numero">{promedioActual ?? '—'}</p>
              <p className="dashboard-etiqueta">Promedio actual</p>
            </div>
            <div className="dashboard-tarjeta">
              <p className="dashboard-numero">{tareasPendientes}</p>
              <p className="dashboard-etiqueta">Tareas pendientes</p>
            </div>
            <div className="dashboard-tarjeta">
              <p className="dashboard-numero">{actividadesEntregadas}</p>
              <p className="dashboard-etiqueta">Actividades entregadas</p>
            </div>
          </div>

          <div className="dashboard-fila">
            <div className="dashboard-panel">
              <h2>Rendimiento por curso</h2>
              {resumenCursos.length === 0 && <p className="dashboard-vacio">Todavía no estás inscrito en ningún curso.</p>}
              {resumenCursos.map(({ curso, promedio }) => (
                <div key={curso.id} className="dashboard-barra-fila">
                  <div className="dashboard-barra-etiquetas">
                    <span>{curso.nombre}</span>
                    <span>{promedio !== null ? promedio.toFixed(1) : 'Sin calificaciones aún'}</span>
                  </div>
                  <div className="dashboard-barra-track">
                    <div
                      className="dashboard-barra-relleno"
                      style={{ width: `${promedio !== null ? (promedio / 10) * 100 : 0}%` }}
                      title={`${curso.nombre}: ${promedio !== null ? promedio.toFixed(1) : 'sin calificaciones aún'}`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="dashboard-panel">
              <h2>Últimas calificaciones</h2>
              {ultimasCalificaciones.length === 0 && (
                <p className="dashboard-vacio">Todavía no tienes actividades calificadas.</p>
              )}
              {ultimasCalificaciones.length > 0 && (
                <ul className="dashboard-lista">
                  {ultimasCalificaciones.map(({ curso, tarea, entrega }) => (
                    <li key={entrega.id}>
                      {tarea.titulo} | {curso.nombre} | {entrega.puntajeObtenido}/{tarea.puntajeMaximo}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="dashboard-panel" style={{ maxWidth: 420 }}>
            <h2>Retroalimentación reciente</h2>
            {!retroalimentacionReciente && (
              <p className="dashboard-vacio">Todavía no tienes retroalimentación de tus docentes.</p>
            )}
            {retroalimentacionReciente && (
              <>
                <p className="dashboard-etiqueta">
                  {retroalimentacionReciente.tarea.titulo}
                  <br />
                  {retroalimentacionReciente.curso.nombre}
                  <br />
                  Comentario disponible
                </p>
                <div className="cursos-acciones">
                  <button
                    className="cursos-boton-principal"
                    onClick={() =>
                      navigate(
                        `/mis-cursos/${retroalimentacionReciente.curso.id}/tareas/${retroalimentacionReciente.tarea.id}/retroalimentacion`
                      )
                    }
                  >
                    Ver retroalimentación
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </PanelLayout>
  );
}

export default DashboardEstudiante;
