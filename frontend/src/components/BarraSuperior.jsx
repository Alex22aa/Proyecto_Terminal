import { useNavigate } from 'react-router-dom';
import { obtenerSesion, cerrarSesion } from '../utils/sesion';

// Componente reutilizable 302: barra superior con el usuario activo y cerrar sesion.
function BarraSuperior() {
  const navigate = useNavigate();
  const sesion = obtenerSesion();

  function salir() {
    cerrarSesion();
    navigate('/login');
  }

  const rolTexto = sesion?.rol === 'docente' ? 'Docente' : 'Estudiante';

  return (
    <header className="barra-superior">
      <span className="barra-superior-marca">Sistema Inteligente de Apoyo y Aprendizaje</span>
      <div className="barra-superior-usuario">
        <span>
          {rolTexto}: {sesion?.nombreCompleto}
        </span>
        <button onClick={salir}>Cerrar sesion</button>
      </div>
    </header>
  );
}

export default BarraSuperior;
