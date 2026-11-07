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

// Pantalla IU-16: reporte academico del grupo. Reutiliza el mismo calculo que
// el Dashboard docente (IU-14) sobre Curso/Tarea/Inscripcion/Entrega, asi que
// tampoco toca el backend. Tambien tiene su propio selector de curso, igual
// que IU-14, porque el bosquejo muestra un solo curso a la vez.
//
// "Hallazgos principales" y "Recomendaciones" son insights generados con
// reglas simples (no IA): la tarea con el promedio mas bajo, si hay entregas
// atrasadas, y si el rendimiento general del grupo es aceptable o no. No hay
// IU bloqueada por IA aqui, ver estructura-repo-pt2.md.
//
// "Exportar reporte" usa la funcion nativa de impresion del navegador
// (window.print) en vez de una libreria de PDF nueva: con el CSS de
// impresion de Dashboard.css se oculta el menu/barra superior y solo se
// imprime el contenido del reporte, y el usuario elige "Guardar como PDF" en
// el dialogo de impresion. Se eligio asi para no agregar una dependencia
// nueva solo para esta pantalla.
function ReporteAcademico() {
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

  // Misma regla de "atrasada" que IU-14/IU-15.
  function esAtrasada(tarea, entrega) {
    if (!entrega) return new Date(tarea.fechaEntrega) < ahora;
    return new Date(entrega.fechaEntrega) > new Date(tarea.fechaEntrega);
  }

  const tareasConPromedio = resumenPorTarea.map(({ tarea, entregasTarea }) => {
    const calificaciones = entregasTarea
      .filter((e) => e.estado === 'calificada' && e.puntajeObtenido !== null)
      .map((e) => (e.puntajeObtenido / tarea.puntajeMaximo) * 10);
    const promedio =
      calificaciones.length > 0 ? calificaciones.reduce((s, v) => s + v, 0) / calificaciones.length : null;
    return { tarea, entregasTarea, promedio };
  });

  const estudiantesConResumen = inscritos.map(({ estudiante }) => {
    let atrasadasEst = 0;
    const calificaciones = [];
    tareasConPromedio.forEach(({ tarea, entregasTarea }) => {
      const entrega = entregasTarea.find((e) => e.estudiante?.id === estudiante.id);
      if (esAtrasada(tarea, entrega)) atrasadasEst += 1;
      if (entrega?.estado === 'calificada' && entrega.puntajeObtenido !== null) {
        calificaciones.push((entrega.puntajeObtenido / tarea.puntajeMaximo) * 10);
      }
    });
    const promedio =
      calificaciones.length > 0 ? calificaciones.reduce((s, v) => s + v, 0) / calificaciones.length : null;
    const enRiesgo = (promedio !== null && promedio < 6) || atrasadasEst > 0;
    // Nivel de riesgo para la tabla de seguimiento: Alto si reprueba o tiene
    // varias entregas atrasadas, Medio para el resto de los casos en riesgo.
    const nivel = (promedio !== null && promedio < 6) || atrasadasEst >= 2 ? 'Alto' : 'Medio';
    return { estudiante, promedio, atrasadasEst, enRiesgo, nivel };
  });

  const todasLasCalificaciones = tareasConPromedio.flatMap(({ tarea, entregasTarea }) =>
    entregasTarea
      .filter((e) => e.estado === 'calificada' && e.puntajeObtenido !== null)
      .map((e) => (e.puntajeObtenido / tarea.puntajeMaximo) * 10)
  );
  const promedioGeneral =
    todasLasCalificaciones.length > 0
      ? todasLasCalificaciones.reduce((s, v) => s + v, 0) / todasLasCalificaciones.length
      : null;

  let entregasAtrasadasTotal = 0;
  tareasConPromedio.forEach(({ tarea, entregasTarea }) => {
    inscritos.forEach(({ estudiante }) => {
      const entrega = entregasTarea.find((e) => e.estudiante?.id === estudiante.id);
      if (esAtrasada(tarea, entrega)) entregasAtrasadasTotal += 1;
    });
  });

  const tareasConBajoDesempeno = tareasConPromedio.filter((r) => r.promedio !== null && r.promedio < 6);
  const estudiantesEnRiesgo = estudiantesConResumen.filter((r) => r.enRiesgo);
  const tareaMasBaja = tareasConBajoDesempeno.reduce(
    (menor, actual) => (!menor || actual.promedio < menor.promedio ? actual : menor),
    null
  );

  const hallazgos = [];
  if (tareaMasBaja) {
    hallazgos.push(
      `La ${tareaMasBaja.tarea.titulo} presentó el promedio más bajo (${tareaMasBaja.promedio.toFixed(1)}).`
    );
  }
  if (entregasAtrasadasTotal > 0) {
    hallazgos.push(`Hay estudiantes con entregas atrasadas (${entregasAtrasadasTotal} en total).`);
  }
  if (promedioGeneral !== null) {
    hallazgos.push(
      promedioGeneral >= 6
        ? `El grupo mantiene rendimiento aceptable (promedio general ${promedioGeneral.toFixed(1)}).`
        : `El grupo presenta bajo rendimiento general (promedio ${promedioGeneral.toFixed(1)}).`
    );
  }

  const recomendaciones = [];
  if (tareaMasBaja) recomendaciones.push(`Revisar los criterios de ${tareaMasBaja.tarea.titulo}.`);
  if (entregasAtrasadasTotal > 0) recomendaciones.push('Dar seguimiento a estudiantes atrasados.');
  if (tareasConBajoDesempeno.length > 0) {
    recomendaciones.push('Reforzar los temas relacionados con las tareas de bajo desempeño.');
  }
  if (recomendaciones.length === 0) {
    recomendaciones.push('El grupo no requiere acciones adicionales por ahora.');
  }

  return (
    <PanelLayout rol="docente">
      <h1>Reporte académico</h1>
      <p className="cursos-subtitulo">Resumen generado del rendimiento académico</p>

      {cursos.length === 0 && !cargando && (
        <p className="dashboard-vacio">Todavía no tienes cursos activos para generar un reporte.</p>
      )}

      {cursos.length > 0 && (
        <>
          <div className="dashboard-filtros reporte-no-imprimir">
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

          {cargando && <p>Generando reporte...</p>}

          {!cargando && (
            <div className="reporte-contenido">
              <p className="tareas-curso-tag">Curso: {curso?.nombre}</p>

              <div className="dashboard-panel" style={{ marginBottom: 20 }}>
                <h2>Resumen general</h2>
                <ul className="dashboard-lista">
                  <li>Promedio general del grupo: {promedioGeneral !== null ? promedioGeneral.toFixed(1) : '—'}</li>
                  <li>Entregas atrasadas: {entregasAtrasadasTotal}</li>
                  <li>Tareas con bajo desempeño: {tareasConBajoDesempeno.length}</li>
                  <li>Estudiantes en riesgo: {estudiantesEnRiesgo.length}</li>
                </ul>
              </div>

              <div className="dashboard-panel" style={{ marginBottom: 20 }}>
                <h2>Hallazgos principales</h2>
                {hallazgos.length === 0 && <p className="dashboard-vacio">Todavía no hay datos suficientes.</p>}
                {hallazgos.length > 0 && (
                  <ul className="dashboard-lista">
                    {hallazgos.map((texto, indice) => (
                      <li key={indice}>{texto}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="dashboard-panel" style={{ marginBottom: 20 }}>
                <h2>Estudiantes que requieren seguimiento</h2>
                {estudiantesEnRiesgo.length === 0 && (
                  <p className="dashboard-vacio">Ningún estudiante requiere seguimiento por ahora.</p>
                )}
                {estudiantesEnRiesgo.length > 0 && (
                  <table className="entregas-tabla">
                    <thead>
                      <tr>
                        <th>Estudiante</th>
                        <th>Promedio</th>
                        <th>Riesgo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {estudiantesEnRiesgo.map(({ estudiante, promedio, nivel }) => (
                        <tr key={estudiante.id}>
                          <td>{estudiante.nombreCompleto}</td>
                          <td>{promedio !== null ? promedio.toFixed(1) : 'Sin calificaciones aún'}</td>
                          <td>{nivel}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="dashboard-panel" style={{ marginBottom: 20 }}>
                <h2>Recomendaciones</h2>
                <ul className="dashboard-lista">
                  {recomendaciones.map((texto, indice) => (
                    <li key={indice}>{texto}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="cursos-acciones reporte-no-imprimir">
            <button className="cursos-boton-secundario" onClick={() => navigate('/dashboard-docente')}>
              Volver al dashboard
            </button>
            <button className="cursos-boton-secundario" onClick={() => window.print()} disabled={cargando}>
              Exportar reporte
            </button>
          </div>
        </>
      )}
    </PanelLayout>
  );
}

export default ReporteAcademico;
