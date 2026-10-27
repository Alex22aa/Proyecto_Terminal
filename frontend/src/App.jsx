import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Registro from './pages/Registro';
import RecuperarContrasena from './pages/RecuperarContrasena';
import PanelDocente from './pages/PanelDocente';
import PanelEstudiante from './pages/PanelEstudiante';
import ListaCursos from './pages/ListaCursos';
import DetalleCurso from './pages/DetalleCurso';
import FormularioCurso from './pages/FormularioCurso';
import EnConstruccion from './pages/EnConstruccion';
import PanelLayout from './components/PanelLayout';
import { obtenerSesion } from './utils/sesion';

// Bloquea el paso a una pantalla si no hay sesion iniciada, y si se pide un
// rol especifico, manda al usuario a su propio panel cuando no coincide.
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
        path="/cursos/:id/tareas"
        element={
          <RutaProtegida rolRequerido="docente">
            <PanelLayout rol="docente">
              <EnConstruccion titulo="Lista de tareas" />
            </PanelLayout>
          </RutaProtegida>
        }
      />
      <Route
        path="/dashboard-docente"
        element={
          <RutaProtegida rolRequerido="docente">
            <PanelLayout rol="docente">
              <EnConstruccion titulo="Dashboard docente" />
            </PanelLayout>
          </RutaProtegida>
        }
      />
      <Route
        path="/evaluacion-asistida"
        element={
          <RutaProtegida rolRequerido="docente">
            <PanelLayout rol="docente">
              <EnConstruccion titulo="Evaluacion asistida" />
            </PanelLayout>
          </RutaProtegida>
        }
      />
      <Route
        path="/diagnosticos-ia"
        element={
          <RutaProtegida rolRequerido="docente">
            <PanelLayout rol="docente">
              <EnConstruccion titulo="Diagnosticos IA" />
            </PanelLayout>
          </RutaProtegida>
        }
      />
      <Route
        path="/notificaciones-docente"
        element={
          <RutaProtegida rolRequerido="docente">
            <PanelLayout rol="docente">
              <EnConstruccion titulo="Notificaciones" />
            </PanelLayout>
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
            <PanelLayout rol="estudiante">
              <EnConstruccion titulo="Mis cursos" />
            </PanelLayout>
          </RutaProtegida>
        }
      />
      <Route
        path="/dashboard-estudiante"
        element={
          <RutaProtegida rolRequerido="estudiante">
            <PanelLayout rol="estudiante">
              <EnConstruccion titulo="Dashboard estudiante" />
            </PanelLayout>
          </RutaProtegida>
        }
      />
      <Route
        path="/notificaciones-estudiante"
        element={
          <RutaProtegida rolRequerido="estudiante">
            <PanelLayout rol="estudiante">
              <EnConstruccion titulo="Notificaciones" />
            </PanelLayout>
          </RutaProtegida>
        }
      />
    </Routes>
  );
}

export default App;
