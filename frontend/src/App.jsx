import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Registro from './pages/Registro';
import RecuperarContrasena from './pages/RecuperarContrasena';
import PanelDocente from './pages/PanelDocente';
import PanelEstudiante from './pages/PanelEstudiante';
import ListaCursos from './pages/ListaCursos';
import DetalleCurso from './pages/DetalleCurso';
import FormularioCurso from './pages/FormularioCurso';
import ListaTareas from './pages/ListaTareas';
import DetalleTarea from './pages/DetalleTarea';
import FormularioTarea from './pages/FormularioTarea';
import FormularioRubrica from './pages/FormularioRubrica';
import ListaEntregas from './pages/ListaEntregas';
import DetalleEntrega from './pages/DetalleEntrega';
import NotificacionesDocente from './pages/NotificacionesDocente';
import NotificacionesEstudiante from './pages/NotificacionesEstudiante';
import MisCursos from './pages/MisCursos';
import DetalleCursoEstudiante from './pages/DetalleCursoEstudiante';
import DetalleTareaEstudiante from './pages/DetalleTareaEstudiante';
import EntregaTarea from './pages/EntregaTarea';
import DashboardEstudiante from './pages/DashboardEstudiante';
import DashboardDocente from './pages/DashboardDocente';
import DetalleEstudiante from './pages/DetalleEstudiante';
import Retroalimentacion from './pages/Retroalimentacion';
import ReporteAcademico from './pages/ReporteAcademico';
import EnConstruccion from './pages/EnConstruccion';
import PanelLayout from './components/PanelLayout';
import { obtenerSesion } from './utils/sesion';

// Bloquea el paso a una pantalla si no hay sesión iniciada, y si se pide un
// rol específico, manda al usuario a su propio panel cuando no coincide.
function RutaProtegida({ children, rolRequerido }) {
  const sesion = obtenerSesion();
  if (!sesion) return <Navigate to="/login" replace />;
  if (rolRequerido && sesion.rol !== rolRequerido) {
    return <Navigate to={sesion.rol === 'docente' ? '/panel-docente' : '/panel-estudiante'} replace />;
  }
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/recuperar-contrasena" element={<RecuperarContrasena />} />

      <Route
        path="/panel-docente"
        element={
          <RutaProtegida rolRequerido="docente">
            <PanelDocente />
          </RutaProtegida>
        }
      />
      <Route
        path="/cursos"
        element={
          <RutaProtegida rolRequerido="docente">
            <ListaCursos />
          </RutaProtegida>
        }
      />
      <Route
        path="/cursos/nuevo"
        element={
          <RutaProtegida rolRequerido="docente">
            <FormularioCurso />
          </RutaProtegida>
        }
      />
      <Route
        path="/cursos/:id"
        element={
          <RutaProtegida rolRequerido="docente">
            <DetalleCurso />
          </RutaProtegida>
        }
      />
      <Route
        path="/cursos/:id/editar"
        element={
          <RutaProtegida rolRequerido="docente">
            <FormularioCurso />
          </RutaProtegida>
        }
      />
      <Route
        path="/cursos/:cursoId/tareas"
        element={
          <RutaProtegida rolRequerido="docente">
            <ListaTareas />
          </RutaProtegida>
        }
      />
      <Route
        path="/cursos/:cursoId/tareas/nueva"
        element={
          <RutaProtegida rolRequerido="docente">
            <FormularioTarea />
          </RutaProtegida>
        }
      />
      <Route
        path="/cursos/:cursoId/tareas/:tareaId"
        element={
          <RutaProtegida rolRequerido="docente">
            <DetalleTarea />
          </RutaProtegida>
        }
      />
      <Route
        path="/cursos/:cursoId/tareas/:tareaId/editar"
        element={
          <RutaProtegida rolRequerido="docente">
            <FormularioTarea />
          </RutaProtegida>
        }
      />
      <Route
        path="/cursos/:cursoId/tareas/:tareaId/rubrica"
        element={
          <RutaProtegida rolRequerido="docente">
            <FormularioRubrica />
          </RutaProtegida>
        }
      />
      <Route
        path="/cursos/:cursoId/tareas/:tareaId/entregas"
        element={
          <RutaProtegida rolRequerido="docente">
            <ListaEntregas />
          </RutaProtegida>
        }
      />
      <Route
        path="/cursos/:cursoId/tareas/:tareaId/entregas/:entregaId"
        element={
          <RutaProtegida rolRequerido="docente">
            <DetalleEntrega />
          </RutaProtegida>
        }
      />
      <Route
        path="/cursos/:cursoId/tareas/:tareaId/entregas/:entregaId/evaluacion-ia"
        element={
          <RutaProtegida rolRequerido="docente">
            <PanelLayout rol="docente">
              <EnConstruccion titulo="Resultado de IA" />
            </PanelLayout>
          </RutaProtegida>
        }
      />
      <Route
        path="/dashboard-docente"
        element={
          <RutaProtegida rolRequerido="docente">
            <DashboardDocente />
          </RutaProtegida>
        }
      />
      <Route
        path="/dashboard-docente/:cursoId/estudiante/:estudianteId"
        element={
          <RutaProtegida rolRequerido="docente">
            <DetalleEstudiante />
          </RutaProtegida>
        }
      />
      <Route
        path="/reporte-academico"
        element={
          <RutaProtegida rolRequerido="docente">
            <ReporteAcademico />
          </RutaProtegida>
        }
      />
      <Route
        path="/evaluacion-asistida"
        element={
          <RutaProtegida rolRequerido="docente">
            <PanelLayout rol="docente">
              <EnConstruccion titulo="Evaluación asistida" />
            </PanelLayout>
          </RutaProtegida>
        }
      />
      <Route
        path="/diagnosticos-ia"
        element={
          <RutaProtegida rolRequerido="docente">
            <PanelLayout rol="docente">
              <EnConstruccion titulo="Diagnósticos IA" />
            </PanelLayout>
          </RutaProtegida>
        }
      />
      <Route
        path="/notificaciones-docente"
        element={
          <RutaProtegida rolRequerido="docente">
            <NotificacionesDocente />
          </RutaProtegida>
        }
      />

      <Route
        path="/panel-estudiante"
        element={
          <RutaProtegida rolRequerido="estudiante">
            <PanelEstudiante />
          </RutaProtegida>
        }
      />
      <Route
        path="/mis-cursos"
        element={
          <RutaProtegida rolRequerido="estudiante">
            <MisCursos />
          </RutaProtegida>
        }
      />
      <Route
        path="/mis-cursos/:cursoId"
        element={
          <RutaProtegida rolRequerido="estudiante">
            <DetalleCursoEstudiante />
          </RutaProtegida>
        }
      />
      <Route
        path="/mis-cursos/:cursoId/tareas/:tareaId"
        element={
          <RutaProtegida rolRequerido="estudiante">
            <DetalleTareaEstudiante />
          </RutaProtegida>
        }
      />
      <Route
        path="/mis-cursos/:cursoId/tareas/:tareaId/entregar"
        element={
          <RutaProtegida rolRequerido="estudiante">
            <EntregaTarea />
          </RutaProtegida>
        }
      />
      <Route
        path="/mis-cursos/:cursoId/tareas/:tareaId/retroalimentacion"
        element={
          <RutaProtegida rolRequerido="estudiante">
            <Retroalimentacion />
          </RutaProtegida>
        }
      />
      <Route
        path="/dashboard-estudiante"
        element={
          <RutaProtegida rolRequerido="estudiante">
            <DashboardEstudiante />
          </RutaProtegida>
        }
      />
      <Route
        path="/notificaciones-estudiante"
        element={
          <RutaProtegida rolRequerido="estudiante">
            <NotificacionesEstudiante />
          </RutaProtegida>
        }
      />
    </Routes>
  );
}

export default App;
