import { useEffect, useState } from 'react';
import PanelLayout from '../components/PanelLayout';
import {
  obtenerCursos,
  obtenerTareasDelCurso,
  obtenerInscripcionesDelCurso,
  obtenerEntregasDeTarea,
} from '../api';
import { obtenerSesion } from '../utils/sesion';
import './Dashboard.css';

// Pantalla IU-02: pantalla principal del docente al iniciar sesion (Figura 4,
// pagina 12 de la tesina). Es un resumen corto de indicadores y alertas,
// distinto del Dashboard (IU-14, mas detallado y con selector de curso) y de
// Notificaciones (IU-29, lista completa) — aqui se juntan todos los cursos
// activos del docente. Reutiliza las mismas reglas de "atrasada"/"bajo
// desempeño" que el Dashboard (ver DashboardDocente.jsx), sin tocar el
// backend. La alerta "Diagnostico pendiente de revisar" del bosquejo se omite
// porque depende de la entidad Diagnostico (IA, en pausa) — mismo criterio ya
// usado con Recomendaciones en el Dashboard estudiante.
function PanelDocente() {
  const sesion = obtenerSesion();
  const [cargando, setCargando] = useState(true);
  const [cursosActivos, setCursosActivos] = useState(0);
  const [tareasActivasTotal, setTareasActivasTotal] = useState(0);
  const [entregasPendientes, setEntregasPendientes] = useState(0);
  const [estudiantesEnRiesgo, setEstudiantesEnRiesgo] = useState(0);
  const [tareasBajoDesempeno, setTareasBajoDesempeno] = useState([]);
  const [estudiantesAtrasados, setEstudiantesAtrasados] = useState(0);

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function cargar() {
    setCargando(true);
    const cursos = await obtenerCursos(sesion?.token);
    const activos = cursos.filter((c) => c.estado === 'activo');
    setCursosActivos(activos.length);

    const porCurso = await Promise.all(
      activos.map(async (curso) => {
        const [tareas, inscritos] = await Promise.all([
          obtenerTareasDelCurso(sesion?.token, curso.id),
          obtenerInscripcionesDelCurso(sesion?.token, curso.id),
        ]);
        const tareasActivas = tareas.filter((t) => t.activa);
        const inscritosActivos = inscritos.filter((i) => i.activa);
        const entregasPorTarea = await Promise.all(
          tareasActivas.map((tarea) => obtenerEntregasDeTarea(sesion?.token, tarea.id))
        );
        return { tareasActivas, inscritosActivos, entregasPorTarea };
      })
    );

    const ahora = new Date();
    function esAtrasada(tarea, entrega) {
      if (!entrega) return new Date(tarea.fechaEntrega) < ahora;
      return new Date(entrega.fechaEntrega) > new Date(tarea.fechaEntrega);
    }

    let tareasTotal = 0;
    let pendientes = 0;
    const bajoDesempeno = [];
    const enRiesgoIds = new Set();
    const atrasadosIds = new Set();

    porCurso.forEach(({ tareasActivas, inscritosActivos, entregasPorTarea }) => {
      tareasTotal += tareasActivas.length;

      tareasActivas.forEach((tarea, indice) => {
        const entregas = entregasPorTarea[indice];
        entregas.forEach((entrega) => {
          if (entrega.estado === 'entregada') pendientes += 1;
        });

        const calificaciones = entregas
          .filter((e) => e.estado === 'calificada' && e.puntajeObtenido !== null)
          .map((e) => (e.puntajeObtenido / tarea.puntajeMaximo) * 10);
        const promedio =
          calificaciones.length > 0 ? calificaciones.reduce((s, v) => s + v, 0) / calificaciones.length : null;
        if (promedio !== null && promedio < 6) bajoDesempeno.push(tarea.titulo);

        inscritosActivos.forEach(({ estudiante }) => {
          const entrega = entregas.find((e) => e.estudiante?.id === estudiante.id);
          if (esAtrasada(tarea, entrega)) {
            enRiesgoIds.add(estudiante.id);
            atrasadosIds.add(estudiante.id);
          }
        });
      });

      inscritosActivos.forEach(({ estudiante }) => {
        const calificacionesEstudiante = [];
        tareasActivas.forEach((tarea, indice) => {
          const entrega = entregasPorTarea[indice].find((e) => e.estudiante?.id === estudiante.id);
          if (entrega?.estado === 'calificada' && entrega.puntajeObtenido !== null) {
            calificacionesEstudiante.push((entrega.puntajeObtenido / tarea.puntajeMaximo) * 10);
          }
        });
        const promedio =
          calificacionesEstudiante.length > 0
            ? calificacionesEstudiante.reduce((s, v) => s + v, 0) / calificacionesEstudiante.length
            : null;
        if (promedio !== null && promedio < 6) enRiesgoIds.add(estudiante.id);
      });
    });

    setTareasActivasTotal(tareasTotal);
    setEntregasPendientes(pendientes);
    setTareasBajoDesempeno(bajoDesempeno);
    setEstudiantesEnRiesgo(enRiesgoIds.size);
    setEstudiantesAtrasados(atrasadosIds.size);
    setCargando(false);
  }

  const sinAlertas = tareasBajoDesempeno.length === 0 && estudiantesAtrasados === 0;

  return (
    <PanelLayout rol="docente">
      <h1>Panel docente</h1>
      <p className="cursos-subtitulo">Resumen general de cursos y actividades académicas</p>

      {cargando && <p>Cargando...</p>}

      {!cargando && (
        <>
          <div className="dashboard-tarjetas">
            <div className="dashboard-tarjeta">
              <p className="dashboard-numero">{cursosActivos}</p>
              <p className="dashboard-etiqueta">Cursos activos</p>
            </div>
            <div className="dashboard-tarjeta">
              <p className="dashboard-numero">{tareasActivasTotal}</p>
              <p className="dashboard-etiqueta">Tareas activas</p>
            </div>
            <div className="dashboard-tarjeta">
              <p className="dashboard-numero">{entregasPendientes}</p>
              <p className="dashboard-etiqueta">Entregas pendientes</p>
            </div>
            <div className="dashboard-tarjeta">
              <p className="dashboard-numero">{estudiantesEnRiesgo}</p>
              <p className="dashboard-etiqueta">Estudiantes en riesgo</p>
            </div>
          </div>

          <div className="dashboard-panel" style={{ maxWidth: 480 }}>
            <h2>Alertas recientes</h2>
            {sinAlertas && <p className="dashboard-vacio">Sin alertas recientes.</p>}
            {!sinAlertas && (
              <div className="panel-alertas">
                {tareasBajoDesempeno.map((titulo) => (
                  <div className="panel-alerta" key={titulo}>
                    Tarea con bajo desempeño: {titulo}
                  </div>
                ))}
                {estudiantesAtrasados > 0 && (
                  <div className="panel-alerta">
                    {estudiantesAtrasados} estudiante{estudiantesAtrasados === 1 ? '' : 's'} con entregas atrasadas
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </PanelLayout>
  );
}

export default PanelDocente;
