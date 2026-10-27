import PanelLayout from '../components/PanelLayout';
import { obtenerSesion } from '../utils/sesion';

// Pantalla IU-02 (version inicial, ya dentro del layout compartido con menu y barra superior).
function PanelDocente() {
  const sesion = obtenerSesion();
  return (
    <PanelLayout rol="docente">
      <h1>Panel docente</h1>
      <p>Resumen general de cursos y actividades academicas.</p>
      <p>Bienvenido, {sesion?.nombreCompleto}.</p>
    </PanelLayout>
  );
}

export default PanelDocente;
