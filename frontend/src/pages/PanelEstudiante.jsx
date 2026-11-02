import PanelLayout from '../components/PanelLayout';
import { obtenerSesion } from '../utils/sesion';

// Pantalla IU-03 (versión inicial, ya dentro del layout compartido con menú y barra superior).
function PanelEstudiante() {
  const sesion = obtenerSesion();
  return (
    <PanelLayout rol="estudiante">
      <h1>Panel estudiante</h1>
      <p>Bienvenido, {sesion?.nombreCompleto}.</p>
    </PanelLayout>
  );
}

export default PanelEstudiante;
