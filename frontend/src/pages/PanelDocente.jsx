import PanelLayout from '../components/PanelLayout';
import { obtenerSesion } from '../utils/sesion';

// Pantalla IU-02 (versión inicial, ya dentro del layout compartido con menú y barra superior).
function PanelDocente() {
  const sesion = obtenerSesion();
  return (
    <PanelLayout rol="docente">
      <h1>Panel docente</h1>
      <p>Resumen general de cursos y actividades académicas.</p>
      <p>Bienvenido, {sesion?.nombreCompleto}.</p>
    </PanelLayout>
  );
}

export default PanelDocente;
