import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PanelLayout from '../components/PanelLayout';
import {
  obtenerCursos,
  obtenerTareasDelCurso,
  obtenerInscripcionesDelCurso,
  obtenerEntregasDeTarea,
} from '../api';
import { obtenerSesion } from '../utils/sesion';
import './Cursos.css';
import './Dashboard.css';

// Pantalla IU-14: dashboard del docente. Igual que IU-23 (estudiante), todo se
// calcula en el frontend a partir de Curso/Tarea/Entrega, sin tocar el backend.
//
// El bosquejo muestra "Curso/Periodo/Tarea/Grupo" como el contexto de una
// sola clase; como un docente puede tener varios cursos, aqui se implementa
// como un selector de curso, y "Periodo"/"Grupo" muestran el trimestre/grupo
// del curso elegido. "Tarea" se deja fijo en "Todas": el dashboard siempre
// resume todas las tareas activas del curso seleccionado, sin un filtro por
// tarea individual.
//
// Reglas de negocio definidas aqui (el bosquejo solo muestra el resultado
// esperado, no como se calcula):
// - Una entrega cuenta como "atrasada" si se mando despues de la fecha
//   limite de la tarea, o si nunca se entrego y la fecha limite ya paso.
// - Una tarea tiene "bajo desempeño" si su promedio (de las entregas ya
//   calificadas) es menor a 6.0, la calificacion minima aprobatoria.
// - Un estudiante esta "en riesgo" si su promedio general es menor a 6.0,
//   o si tiene al menos una entrega atrasada.
//
// "Ver estudiante" lleva a Detalle de estudiante (IU-15, ya construida) y
// "Ver tarea" a Detalle de tarea (IU-08, ya existia). "Generar reporte"
// (IU-16) todavia usa una ruta provisional con el componente generico
// EnConstruccion. "Generar diagnostico" sigue bloqueado por IA, igual que en
// el resto del sistema.
function DashboardDocente() {
  const navigate = useNavigate();
  const sesion = obtenerSesion();
  const [cursos, setCursos] = useState([]);
  const [cursoId, setCursoId] = useState('');
  const [resumenPorTarea, setResumenPorTarea] = useState([]);
  const [inscritos, setInscritos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarCursos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (cursoId) cargarDatosDelCurso();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursoId]);

  async function cargarCursos() {
    const lista = await obtenerCursos(sesion?.token);
    const activos = lista.filter((c) => c.estado === 'activo');
    setCursos(activos);
    if (activos.length > 0) setCursoId(String(activos[0].id));
    else setCargando(false);
  }

  async function cargarDatosDelCurso() {
    setCargando(true);
    const [listaTareas, listaInscritos] = await Promise.all([
      obtenerTareasDelCurso(sesion?.token, cursoId),
      obtenerInscripcionesDelCurso(sesion?.token, cursoId),
    ]);
    const tareasActivas = listaTareas.filter((t) => t.activa);
    const inscritosActivos = listaInscritos.filter((i) => i.activa);

    const entregasPorTarea = await Promise.all(
      tareasActivas.map((tarea) => obtenerEntregasDeTarea(sesion?.token, tarea.id))
    );

    setResumenPorTarea(
      tareasActivas.map((tarea, indice) => ({ tarea, entregasTarea: entregasPorTarea[indice] }))
    );
    setInscritos(inscritosActivos);
    setCargando(false);
  }

  const curso = cursos.find((c) => String(c.id) === cursoId);
  const ahora = new Date();

  // Determina si una entrega concreta (o su ausencia) cuenta como atrasada.
  function esAtrasada(tarea, entrega) {
    if (!entrega) return new Date(tarea.fechaEntrega) < ahora;
    return new Date(entrega.fechaEntrega) > new Date(tarea.fechaEntrega);
  }

  // --- Promedio y total de entregas por tarea, para la grafica de barras ---
  const tareasConPromedio = resumenPorTarea.map(({ tarea, entregasTarea }) => {
    const calificaciones = entregasTarea
      .filter((e) => e.estado === 'calificada' && e.puntajeObtenido !== null)
      .map((e) => (e.puntajeObtenido / tarea.puntajeMaximo) * 10);
    const promedio =
      calificaciones.length > 0 ? calificaciones.reduce((s, v) => s + v, 0) / calificaciones.length : null;
    return { tarea, entregasTarea, promedio, totalEntregas: entregasTarea.length };
  });

  // --- Promedio y atrasadas por estudiante, para la tabla de riesgo ---
  const estudiantesConResumen = inscritos.map(({ estudiante }) => {
    let atrasadas = 0;
    const calificaciones = [];

    tareasConPromedio.forEach(({ tarea, entregasTarea }) => {
      const entrega = entregasTarea.find((e) => e.estudiante?.id === estudiante.id);
      if (esAtrasada(tarea, entrega)) atrasadas += 1;
      if (entrega?.estado === 'calificada' && entrega.puntajeObtenido !== null) {
        calificaciones.push((entrega.puntajeObtenido / tarea.puntajeMaximo) * 10);
      }
    });

    const promedio =
      calificaciones.length > 0 ? calificaciones.reduce((s, v) => s + v, 0) / calificaciones.length : null;
    const enRiesgo = (promedio !== null && promedio < 6) || atrasadas > 0;

    return { estudiante, promedio, atrasadas, enRiesgo };
  });

  // --- Indicadores generales del curso ---
  const todasLasCalificaciones = tareasConPromedio.flatMap(({ tarea, entregasTarea }) =>
    entregasTarea
      .filter((e) => e.estado === 'calificada' && e.puntajeObtenido !== null)
      .map((e) => (e.puntajeObtenido / tarea.puntajeMaximo) * 10)
  );
  const promedioGeneral =
    todasLasCalificaciones.length > 0
      ? (todasLasCalificaciones.reduce((s, v) => s + v, 0) / todasLasCalificaciones.length).toFixed(1)
      : null;

  let entregadas = 0;
  let atrasadas = 0;
  let pendientes = 0;
  tareasConPromedio.forEach(({ tarea, entregasTarea }) => {
    inscritos.forEach(({ estudiante }) => {
      const entrega = entregasTarea.find((e) => e.estudiante?.id === estudiante.id);
      if (entrega) {
        if (esAtrasada(tarea, entrega)) atrasadas += 1;
        else entregadas += 1;
      } else if (new Date(tarea.fechaEntrega) < ahora) {
        atrasadas += 1;
      } else {
        pendientes += 1;
      }
    });
  });

  const tareasConBajoDesempeno = tareasConPromedio.filter((r) => r.promedio !== null && r.promedio < 6);
  const estudiantesEnRiesgo = estudiantesConResumen.filter((r) => r.enRiesgo);

  return (
    <PanelLayout rol="docente">
      <h1>Dashboard docente</h1>
      <p className="cursos-subtitulo">Análisis general del rendimiento académico</p>

      {cursos.length === 0 && !cargando && (
        <p className="dashboard-vacio">Todavía no tienes cursos activos para mostrar en el dashboard.</p>
      )}

      {cursos.length > 0 && (
        <>
          <div className="dashboard-filtros">
            <label className="dashboard-filtro-curso">
              Curso:
              <select value={cursoId} onChange={(e) => setCursoId(e.target.value)}>
                {cursos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </label>
            <span className="tareas-curso-tag">Periodo: {curso?.trimestre || '—'}</span>
            <span className="tareas-curso-tag">Grupo: {curso?.grupo || '—'}</span>
            <span className="tareas-curso-tag">Tarea: Todas</span>
          </div>

          {cargando && <p>Cargando dashboard...</p>}

          {!cargando && (
            <>
              <div className="dashboard-tarjetas">
                <div className="dashboard-tarjeta">
                  <p className="dashboard-numero">{promedioGeneral ?? '—'}</p>
                  <p className="dashboard-etiqueta">Promedio general</p>
                </div>
                <div className="dashboard-tarjeta">
                  <p className="dashboard-numero">{atrasadas}</p>
                  <p className="dashboard-etiqueta">Entregas atrasadas</p>
                </div>
                <div className="dashboard-tarjeta">
                  <p className="dashboard-numero">{tareasConBajoDesempeno.length}</p>
                  <p className="dashboard-etiqueta">Tareas con bajo desempeño</p>
                </div>
                <div className="dashboard-tarjeta">
                  <p className="dashboard-numero">{estudiantesEnRiesgo.length}</p>
                  <p className="dashboard-etiqueta">Estudiantes en riesgo</p>
                </div>
              </div>

              <div className="dashboard-fila">
                <div className="dashboard-panel">
                  <h2>Rendimiento por tarea</h2>
                  {tareasConPromedio.length === 0 && (
                    <p className="dashboard-vacio">Este curso todavía no tiene tareas activas.</p>
                  )}
                  {tareasConPromedio.map(({ tarea, promedio }) => (
                    <div key={tarea.id} className="dashboard-barra-fila">
                      <div className="dashboard-barra-etiquetas">
                        <span>{tarea.titulo}</span>
                        <span>{promedio !== null ? promedio.toFixed(1) : 'Sin calificaciones aún'}</span>
                      </div>
                      <div className="dashboard-barra-track">
                        <div
                          className="dashboard-barra-relleno"
                          style={{ width: `${promedio !== null ? (promedio / 10) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="dashboard-panel">
                  <h2>Distribución de entregas</h2>
                  <ul className="dashboard-lista">
                    <li>Entregadas: {entregadas}</li>
                    <li>Atrasadas: {atrasadas}</li>
                    <li>Pendientes: {pendientes}</li>
                  </ul>
                </div>
              </div>

              <div className="dashboard-panel" style={{ marginBottom: 20 }}>
                <h2>Estudiantes en riesgo</h2>
                {estudiantesEnRiesgo.length === 0 && (
                  <p className="dashboard-vacio">Ningún estudiante en riesgo por ahora.</p>
                )}
                {estudiantesEnRiesgo.length > 0 && (
                  <table className="entregas-tabla">
                    <thead>
                      <tr>
                        <th>Estudiante</th>
                        <th>Promedio</th>
                        <th>Atrasadas</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {estudiantesEnRiesgo.map(({ estudiante, promedio, atrasadas: atrasadasEst }) => (
                        <tr key={estudiante.id}>
                          <td>{estudiante.nombreCompleto}</td>
                          <td>{promedio !== null ? promedio.toFixed(1) : 'Sin calificaciones aún'}</td>
                          <td>{atrasadasEst}</td>
                          <td>
                            <button
                              className="cursos-boton-secundario"
                              onClick={() => navigate(`/dashboard-docente/${cursoId}/estudiante/${estudiante.id}`)}
                            >
                              Ver estudiante
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="dashboard-panel" style={{ marginBottom: 20 }}>
                <h2>Tareas con bajo desempeño</h2>
                {tareasConBajoDesempeno.length === 0 && (
                  <p className="dashboard-vacio">Ninguna tarea con bajo desempeño por ahora.</p>
                )}
                {tareasConBajoDesempeno.length > 0 && (
                  <table className="entregas-tabla">
                    <thead>
                      <tr>
                        <th>Tarea</th>
                        <th>Promedio</th>
                        <th>Entregas</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {tareasConBajoDesempeno.map(({ tarea, promedio, totalEntregas }) => (
                        <tr key={tarea.id}>
                          <td>{tarea.titulo}</td>
                          <td>{promedio.toFixed(1)}</td>
                          <td>{totalEntregas}</td>
                          <td>
                            <button
                              className="cursos-boton-secundario"
                              onClick={() => navigate(`/cursos/${cursoId}/tareas/${tarea.id}`)}
                            >
                              Ver tarea
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="cursos-acciones">
                <button className="cursos-boton-secundario" onClick={() => navigate('/reporte-academico')}>
                  Generar reporte
                </button>
                <button className="cursos-boton-secundario" onClick={() => navigate('/diagnosticos-ia')}>
                  Generar diagnóstico
                </button>
              </div>
            </>
          )}
        </>
      )}
    </PanelLayout>
  );
}

export default DashboardDocente;
